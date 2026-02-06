"""
Flask Backend for Phi-2 Finance AI
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for React

# Global variables for model
model = None
tokenizer = None
is_loading = False

def load_model():
    """Load the fine-tuned model"""
    global model, tokenizer, is_loading
    
    if model is not None:
        return
    
    is_loading = True
    print("🔄 Loading Phi-2 Finance AI...")
    
    try:
        # Load base model
        base_model = AutoModelForCausalLM.from_pretrained(
            "microsoft/phi-2",
            torch_dtype=torch.float16,
            trust_remote_code=True,
            low_cpu_mem_usage=True
        )
        
        # Load LoRA adapter
        model = PeftModel.from_pretrained(base_model, "../models/finance_phi2_model")
        model = model.to("cuda")
        model.eval()
        
        # Load tokenizer
        tokenizer = AutoTokenizer.from_pretrained("microsoft/phi-2", trust_remote_code=True)
        tokenizer.pad_token = tokenizer.eos_token
        
        print("✅ Model loaded successfully!")
        is_loading = False
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        is_loading = False
        raise

def generate_answer(question):
    """Generate answer for a question"""
    if model is None or tokenizer is None:
        return "Model is still loading. Please try again in a moment."
    
    prompt = f"Instruct: {question}\nOutput:"
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=250,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.1,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id
        )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    answer = response.split("Output:")[-1].strip()
    return answer

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'is_loading': is_loading
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat endpoint"""
    try:
        data = request.json
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({'error': 'Question cannot be empty'}), 400
        
        # Generate answer
        start_time = time.time()
        answer = generate_answer(question)
        response_time = time.time() - start_time
        
        return jsonify({
            'answer': answer,
            'response_time': round(response_time, 2)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    """Get suggested questions"""
    suggestions = [
        "What is compound interest?",
        "Should I invest in index funds or individual stocks?",
        "How much should I save for retirement?",
        "What is a 401k retirement account?",
        "Explain portfolio diversification",
        "What is the difference between Roth IRA and Traditional IRA?",
        "How do I create an emergency fund?",
        "What are dividends?"
    ]
    return jsonify({'suggestions': suggestions})

if __name__ == '__main__':
    # Load model on startup
    load_model()
    
    # Run Flask app
    print("\n" + "="*70)
    print("🚀 FINBUD FINANCE AI - Backend Server")
    print("="*70)
    print("📡 Server running on: http://localhost:5000")
    print("💬 API endpoint: http://localhost:5000/api/chat")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
