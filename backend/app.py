"""
FinBud Backend - FIXED to match test.py format
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import sqlite3
import os

app = Flask(__name__)
CORS(app)

model = None
tokenizer = None

# FIXED: Use correct path for Llama-2 model (or change to Phi-2 if you trained Phi-2)
MODEL_PATH = r"D:\Finbud\training\models\finbud_indian"

# ─────────────────────────────────────────────
# DATABASE SETUP
# ─────────────────────────────────────────────

def init_db():
    """Create tables if they don't exist"""
    conn = sqlite3.connect("instance/finbud_users.db")
    cursor = conn.cursor()

    # Chat history table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            question TEXT,
            answer TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Feedback table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER,
            user_id TEXT,
            question TEXT,
            answer TEXT,
            rating INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Database tables ready!")

def save_chat(user_id, question, answer):
    """Save every chat to DB, return the chat ID"""
    conn = sqlite3.connect("instance/finbud_users.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO chat_history (user_id, question, answer) VALUES (?, ?, ?)",
        (user_id, question, answer)
    )
    chat_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return chat_id

def save_feedback(chat_id, user_id, question, answer, rating):
    """Save thumbs up/down feedback"""
    conn = sqlite3.connect("instance/finbud_users.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO feedback (chat_id, user_id, question, answer, rating) VALUES (?, ?, ?, ?, ?)",
        (chat_id, user_id, question, answer, rating)
    )
    conn.commit()
    conn.close()

def get_recent_history(user_id, limit=4):
    """Get last few messages for conversation memory"""
    conn = sqlite3.connect("instance/finbud_users.db")
    cursor = conn.cursor()
    cursor.execute(
        "SELECT question, answer FROM chat_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?",
        (user_id, limit)
    )
    rows = cursor.fetchall()
    conn.close()
    return list(reversed(rows))


# ─────────────────────────────────────────────
# RAG SETUP
# ─────────────────────────────────────────────

rag_index = None
rag_documents = []
embedding_model = None

def load_rag():
    """Load RAG system if documents folder exists"""
    global rag_index, rag_documents, embedding_model

    docs_folder = "rag/documents"
    index_path = "rag/finance_index.faiss"
    store_path = "rag/documents_store.pkl"

    if not os.path.exists(docs_folder):
        print("⚠️  No rag/documents folder found. RAG disabled.")
        return

    try:
        import faiss
        import pickle
        import numpy as np
        from sentence_transformers import SentenceTransformer

        if not os.path.exists(index_path):
            print("\n📚 Building RAG index from documents...")
            build_rag_index(docs_folder, index_path, store_path)

        print("📖 Loading RAG index...")
        rag_index = faiss.read_index(index_path)

        with open(store_path, "rb") as f:
            store = pickle.load(f)
        rag_documents.extend(store["documents"])

        embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        print(f"✅ RAG ready! {len(rag_documents)} knowledge chunks loaded.")

    except Exception as e:
        print(f"⚠️  RAG failed to load: {e}. Continuing without RAG.")

def build_rag_index(docs_folder, index_path, store_path):
    """Build FAISS index from text files"""
    import faiss
    import pickle
    import numpy as np
    from sentence_transformers import SentenceTransformer

    em = SentenceTransformer('all-MiniLM-L6-v2')
    documents = []

    for filename in os.listdir(docs_folder):
        if filename.endswith(".txt"):
            filepath = os.path.join(docs_folder, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            words = content.split()
            for i in range(0, len(words), 150):
                chunk = " ".join(words[i:i+150])
                documents.append(chunk)

    embeddings = em.encode(documents, show_progress_bar=True)
    embeddings = np.array(embeddings).astype('float32')

    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    os.makedirs("rag", exist_ok=True)
    faiss.write_index(index, index_path)
    with open(store_path, "wb") as f:
        pickle.dump({"documents": documents}, f)

    print(f"✅ Index built! {len(documents)} chunks indexed.")

def retrieve_context(query, top_k=2):
    """Find relevant finance info for the query"""
    if rag_index is None or embedding_model is None:
        return ""

    import numpy as np

    query_embedding = embedding_model.encode([query])
    query_embedding = np.array(query_embedding).astype('float32')

    distances, indices = rag_index.search(query_embedding, top_k)

    chunks = []
    for idx in indices[0]:
        if idx < len(rag_documents):
            chunks.append(rag_documents[idx])

    return "\n\n".join(chunks)


# ─────────────────────────────────────────────
# MODEL SETUP - FIXED
# ─────────────────────────────────────────────

def load_model():
    global model, tokenizer

    if model is not None:
        return

    print("\n" + "="*60)
    print("📄 Loading Model...")
    print("="*60)

    try:
        # Check what model was actually trained
        import json
        config_path = os.path.join(MODEL_PATH, "adapter_config.json")
        
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
            # Update the fallback value here
            base_model_name = config.get('base_model_name_or_path', 'microsoft/phi-2')
            print(f"   Detected base model: {base_model_name}")
        else:
            # Update the default fallback here
            base_model_name = "microsoft/phi-2"
            print(f"   No config found, assuming: {base_model_name}")

        # Load base model
        print(f"   Loading base model: {base_model_name}...")
        base = AutoModelForCausalLM.from_pretrained(
            base_model_name,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True,
            low_cpu_mem_usage=True
        )

        # Load LoRA adapter
        print(f"   Loading LoRA adapter from: {MODEL_PATH}...")
        model = PeftModel.from_pretrained(base, MODEL_PATH)
        
        # Merge for faster inference
        print("   Merging LoRA weights...")
        model = model.merge_and_unload()
        model.eval()

        # Load tokenizer
        tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token

        print("\n✅ Model READY!")
        print(f"   GPU Memory: {torch.cuda.memory_allocated() / 1024**3:.2f} GB\n")

    except Exception as e:
        print(f"\n❌ Model load error: {e}")
        import traceback
        traceback.print_exc()
        raise


# ─────────────────────────────────────────────
# GENERATION - FIXED to match test.py format
# ─────────────────────────────────────────────

def generate(question, user_id="anonymous"):
    if model is None:
        return "Model is still loading, please wait...", None

    # 1. Get relevant context from RAG (optional)
    context = retrieve_context(question, top_k=2)

    # 2. Build prompt in EXACT SAME FORMAT as test.py
    # CRITICAL: This must match your training format!
    
    if context:
        # If RAG context available, include it
        prompt = f"Instruction: Based on the following information: {context}\n\nAnswer this question: {question}\nResponse:"
    else:
        # Simple format - MATCHES test.py
        prompt = f"Instruction: {question}\nResponse:"

    print(f"\n🔍 Prompt being sent:\n{prompt}\n")  # Debug logging

    # 3. Tokenize
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(model.device)

    # 4. Generate
    torch.cuda.empty_cache()
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=250,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.1,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id
        )

    # 5. Decode - FIXED to match test.py approach
    full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract only the answer part after "Response:"
    if "Response:" in full_response:
        response = full_response.split("Response:")[-1].strip()
    else:
        response = full_response.strip()

    print(f"💬 Generated response:\n{response}\n")  # Debug logging

    # 6. Save to database
    chat_id = save_chat(user_id, question, response)

    return response, chat_id


# ─────────────────────────────────────────────
# API ROUTES
# ─────────────────────────────────────────────

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    question = data.get('question', '')
    user_id = data.get('user_id', 'anonymous')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    answer, chat_id = generate(question, user_id)

    return jsonify({
        'answer': answer,
        'chat_id': chat_id
    })


@app.route('/api/feedback', methods=['POST'])
def feedback():
    """Receive thumbs up / thumbs down from frontend"""
    data = request.json
    chat_id = data.get('chat_id')
    user_id = data.get('user_id', 'anonymous')
    question = data.get('question')
    answer = data.get('answer')
    rating = data.get('rating')

    if rating is None or chat_id is None:
        return jsonify({'error': 'Missing chat_id or rating'}), 400

    save_feedback(chat_id, user_id, question, answer, rating)
    return jsonify({'status': 'Feedback saved, thank you!'})


@app.route('/api/history', methods=['GET'])
def history():
    """Get chat history for a user"""
    user_id = request.args.get('user_id', 'anonymous')
    conn = sqlite3.connect("instance/finbud_users.db")
    cursor = conn.cursor()
    cursor.execute(
        "SELECT question, answer, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20",
        (user_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'history': [
        {'question': r[0], 'answer': r[1], 'timestamp': r[2]} for r in rows
    ]})


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'rag_enabled': rag_index is not None
    })


# ─────────────────────────────────────────────
# STARTUP
# ─────────────────────────────────────────────

if __name__ == '__main__':
    print(f"\n🔍 GPU Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"   GPU: {torch.cuda.get_device_name(0)}")
        print(f"   VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
    else:
        print("   ⚠️  No GPU! Will be slow on CPU")

    init_db()
    load_rag()
    load_model()

    print("\n🚀 FinBud Server running at http://localhost:5000")
    print("="*60)
    app.run(port=5000, debug=False)