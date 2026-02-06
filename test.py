"""
Interactive Phi-2 Finance AI Chatbot
"""

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

print("="*70)
print("PHI-2 FINANCE AI - INTERACTIVE MODE")
print("="*70)

print("\n🔄 Loading model...")

# Load base model
base_model = AutoModelForCausalLM.from_pretrained(
    "microsoft/phi-2",
    torch_dtype=torch.float16,
    trust_remote_code=True,
    low_cpu_mem_usage=True
)

# Load LoRA adapter
model = PeftModel.from_pretrained(base_model, "./models/finance_phi2_model")
model = model.to("cuda")
model.eval()

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained("microsoft/phi-2", trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token

print("✅ Model loaded and ready!\n")

def ask_question(question):
    """Generate answer for a question"""
    prompt = f"Instruct: {question}\nOutput:"
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=200,
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

# Interactive Loop
print("="*70)
print("💬 CHAT MODE - Ask me anything about finance!")
print("="*70)
print("\n💡 Examples:")
print("   • What is compound interest?")
print("   • Should I invest in index funds?")
print("   • How to save for retirement?")
print("   • What is a 401k?")
print("\n📝 Type 'exit', 'quit', or 'bye' to end chat")
print("="*70 + "\n")

while True:
    # Get user input
    user_question = input("❓ You: ").strip()
    
    # Check for exit commands
    if user_question.lower() in ['exit', 'quit', 'bye', 'q']:
        print("\n👋 Thanks for using Phi-2 Finance AI!")
        print("="*70)
        break
    
    # Skip empty inputs
    if not user_question:
        print("⚠️  Please enter a question!\n")
        continue
    
    # Generate and display answer
    print("\n💡 AI:", end=" ")
    try:
        answer = ask_question(user_question)
        print(answer)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "-"*70 + "\n")

print("\n✅ Session ended!")