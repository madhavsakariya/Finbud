"""
Chat API with Feedback Collection for RLHF
"""
import sys
import os

# 1. Print immediately to confirm the file is running
print("✅ Python started. Initializing FinBud Server...", flush=True)

# 2. Wrap imports in try/except to catch "Silent" crashes
try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    import json
    import torch
    print("   Libraries imported successfully.", flush=True)
except ImportError as e:
    print(f"❌ CRITICAL IMPORT ERROR: {e}")
    input("Press Enter to exit...") # Keep window open
    sys.exit(1)

# 3. Load Config
try:
    import rlhf_config as config
    print(f"   Config loaded. Model path: {config.RLHF_MODEL_PATH}", flush=True)
except Exception as e:
    print(f"❌ CONFIG ERROR: {e}")
    sys.exit(1)

from transformers import AutoTokenizer, AutoModelForCausalLM

app = Flask(__name__)
CORS(app)

# Global variables
model = None
tokenizer = None

def load_model_safely():
    """Loads the model with explicit progress updates"""
    global model, tokenizer
    
    # Check which model to use
    if os.path.exists(config.RLHF_MODEL_PATH):
        model_path = config.RLHF_MODEL_PATH
        model_type = "RLHF (Custom)"
    else:
        model_path = config.BASE_MODEL_PATH
        model_type = "Base (Phi-2)"

    print(f"\n==================================================")
    print(f"📥 LOADING MODEL: {model_type}")
    print(f"📂 Path: {model_path}")
    print(f"==================================================", flush=True)

    if not os.path.exists(model_path) and "/" not in model_path:
        print(f"❌ ERROR: The folder '{model_path}' does not exist.")
        print(f"   Make sure you updated 'rlhf_config.py' correctly.")
        sys.exit(1)

    try:
        print("   Step 1/2: Loading Tokenizer...", flush=True)
        tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
        tokenizer.pad_token = tokenizer.eos_token

        print("   Step 2/2: Loading Model (This takes 1-2 mins)...", flush=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True
        )
        print(f"✅ SUCCESS: Model loaded on {model.device}", flush=True)
        
    except Exception as e:
        print(f"\n❌ MODEL LOAD FAILED: {str(e)}")
        sys.exit(1)

# In-memory storage for conversation IDs
conversations = {}

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat endpoint"""
    global model, tokenizer
    
    if model is None:
        return jsonify({'error': 'Model is loading...'}), 503

    data = request.get_json()
    question = data.get('question', '').strip()
    
    print(f"💬 User: {question}")
    
    try:
        prompt = f"Instruct: {question}\nOutput:"
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=200,
                do_sample=True,
                temperature=0.7,
                top_p=0.9
            )
        
        response_text = tokenizer.decode(outputs[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True)
        
        # Save ID for feedback
        conv_id = len(conversations) + 1
        conversations[conv_id] = {"question": question}
        
        print(f"🤖 AI: {response_text[:50]}...")
        
        return jsonify({
            'conversation_id': conv_id,
            'answer': response_text,
            'model': 'phi-2'
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback', methods=['POST'])
def feedback():
    """Receive user rating"""
    data = request.get_json()
    print(f"⭐ Feedback Received: {data.get('rating')} Stars")
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    load_model_safely()
    
    print("\n" + "="*60)
    print("🚀 SERVER STARTED: http://localhost:5000")
    print("="*60 + "\n", flush=True)
    
    app.run(host='0.0.0.0', port=5000, debug=False)