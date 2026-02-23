"""
FinBud Backend - Upgraded with RAG + Feedback + Chat History
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import sqlite3
import os
import time

app = Flask(__name__)
CORS(app)

model = None
tokenizer = None

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
            rating INTEGER,  -- 1 = thumbs up, 0 = thumbs down
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
    # Reverse so oldest is first
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

    # If no documents folder, skip RAG silently
    if not os.path.exists(docs_folder):
        print("⚠️  No rag/documents folder found. RAG disabled.")
        print("   Create rag/documents/ and add .txt files to enable it.")
        return

    try:
        import faiss
        import pickle
        import numpy as np
        from sentence_transformers import SentenceTransformer

        # Build index if it doesn't exist yet
        if not os.path.exists(index_path):
            print("\n📚 Building RAG index from documents...")
            build_rag_index(docs_folder, index_path, store_path)

        # Load index and documents
        print("📖 Loading RAG index...")
        rag_index = faiss.read_index(index_path)

        with open(store_path, "rb") as f:
            import pickle
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
            # Split into chunks of ~150 words
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

def retrieve_context(query, top_k=3):
    """Find relevant finance info for the query"""
    if rag_index is None or embedding_model is None:
        return ""  # No RAG available, return empty

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
# MODEL SETUP
# ─────────────────────────────────────────────

def load_model():
    global model, tokenizer

    if model is not None:
        return

    print("\n" + "="*60)
    print("📄 Loading Phi-2 Model...")
    print("="*60)

    try:
        try:
            model = AutoModelForCausalLM.from_pretrained(
                MODEL_PATH,
                torch_dtype=torch.float16,
                device_map="cuda",
                trust_remote_code=True
            )
            tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
            print("✅ Loaded complete model!")

        except Exception as e1:
            print(f"   Attempt 1 failed: {e1}")
            print("\nAttempt 2: Loading base + LoRA adapter...")
            from peft import PeftModel

            base = AutoModelForCausalLM.from_pretrained(
                "microsoft/phi-2",
                torch_dtype=torch.float16,
                device_map="auto",
                trust_remote_code=True,
                use_flash_attention_2=False
            )
            model = PeftModel.from_pretrained(base, MODEL_PATH)
            tokenizer = AutoTokenizer.from_pretrained("microsoft/phi-2", trust_remote_code=True)
            print("✅ Loaded with LoRA adapter!")

        model.eval()
        tokenizer.pad_token = tokenizer.eos_token
        print("\n✅ Model READY!\n")

    except Exception as e:
        print(f"\n❌ Model load error: {e}")
        import traceback
        traceback.print_exc()
        raise


# ─────────────────────────────────────────────
# GENERATION
# ─────────────────────────────────────────────

def generate(question, user_id="anonymous"):
    if model is None:
        return "Model is still loading, please wait...", None

    # 1. Get relevant context from RAG
    context = retrieve_context(question,top_k=1)

    # 2. Get recent chat history for memory
    history = get_recent_history(user_id,limit=2)

    if context:
        prompt = f"""Q: {context} Based on this, {question}
        A:"""
    else:
        prompt = f"""Q: {question}
        A:"""

    # 5. Generate response
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(model.device)
    input_length = inputs["input_ids"].shape[1]  # count how many tokens the prompt is

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=250,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.1
        )

    # Only decode the NEW tokens the model generated, skip the prompt tokens
    new_tokens = outputs[0][input_length:]
    
    response = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()


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
    user_id = data.get('user_id', 'anonymous')  # frontend should send user ID

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    answer, chat_id = generate(question, user_id)

    return jsonify({
        'answer': answer,
        'chat_id': chat_id  # frontend needs this for feedback
    })


@app.route('/api/feedback', methods=['POST'])
def feedback():
    """Receive thumbs up / thumbs down from frontend"""
    data = request.json
    chat_id = data.get('chat_id')
    user_id = data.get('user_id', 'anonymous')
    question = data.get('question')
    answer = data.get('answer')
    rating = data.get('rating')  # 1 = 👍, 0 = 👎

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
        print(f"   {torch.cuda.get_device_name(0)}")
    else:
        print("   ⚠️  No GPU! Will be slow on CPU")

    init_db()      # Setup database tables
    load_rag()     # Load RAG (optional, works without it)
    load_model()   # Load Phi-2

    print("\n🚀 FinBud Server running at http://localhost:5000")
    app.run(port=5000, debug=False)