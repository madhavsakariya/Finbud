"""
Simplified: Load your complete trained model directly
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import time

app = Flask(__name__)
CORS(app)

model = None
tokenizer = None

MODEL_PATH = r"D:\Finbud\training\models\finbud_indian"  # Update this to your model path

def load_model():
    """Load model directly"""
    global model, tokenizer
    
    if model is not None:
        return
    
    print("\n" + "="*60)
    print("📄 Loading Model...")
    print("="*60)
    
    try:
        # Option 1: Load as complete model (if you saved full model)
        print("\nAttempt 1: Loading as complete model...")
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
            print(f"   Failed: {e1}")
            
            # Option 2: Load with base + adapter (LoRA)
            print("\nAttempt 2: Loading base + adapter...")
            from peft import PeftModel
            
            base = AutoModelForCausalLM.from_pretrained(
                "microsoft/phi-2",
                torch_dtype=torch.float16,
                device_map="auto",
                trust_remote_code=True,
                use_flash_attention_2=False  # Disable if causing issues
            )
            
            model = PeftModel.from_pretrained(base, MODEL_PATH)
            tokenizer = AutoTokenizer.from_pretrained("microsoft/phi-2", trust_remote_code=True)
            print("✅ Loaded with adapter!")
        
        model.eval()
        tokenizer.pad_token = tokenizer.eos_token
        
        print("\n" + "="*60)
        print("✅ READY!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise

def generate(question):
    if model is None:
        return "Model loading..."
    
    prompt = f"Instruct: {question}\nOutput:"
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    outputs = model.generate(
        **inputs,
        max_new_tokens=200,
        do_sample=True,
        temperature=0.7
    )
    
    return tokenizer.decode(outputs[0], skip_special_tokens=True).split("Output:")[-1].strip()

@app.route('/api/chat', methods=['POST'])
def chat():
    question = request.json.get('question', '')
    if not question:
        return jsonify({'error': 'No question'}), 400
    
    answer = generate(question)
    return jsonify({'answer': answer})

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'loaded': model is not None})

if __name__ == '__main__':
    # Check GPU
    print(f"\n🔍 GPU Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"   {torch.cuda.get_device_name(0)}")
    else:
        print("   ⚠️  No GPU! This will be VERY slow on CPU")
    
    load_model()
    
    print("\n🚀 Server: http://localhost:5000")
    app.run(port=5000, debug=False)
    