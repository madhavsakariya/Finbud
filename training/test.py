"""
Test Script for Fine-tuned Phi-2 Finance Model - OPTIMIZED
"""

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

MODEL_DIR = "./models/finbud_indian"  # Path to your fine-tuned model directory

print("="*60)
print("PHI-2 FINANCE MODEL - TEST")
print("="*60)

print("\n[1/3] Loading fine-tuned model...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR, trust_remote_code=True)

base_model = AutoModelForCausalLM.from_pretrained(
    "microsoft/phi-2",
    torch_dtype=torch.float16,
    device_map="cuda",
    trust_remote_code=True
)

model = PeftModel.from_pretrained(base_model, MODEL_DIR)
model = model.merge_and_unload()  # Merge LoRA weights
model.eval()

print("✓ Model loaded")

test_prompts = [
    "Instruction: What is compound interest?\nResponse:",
    "Instruction: How can I start investing?\nResponse:",
    "Instruction: What is a budget?\nResponse:",
]

print("\n[2/3] Running inference tests...\n")
print("="*60)

torch.cuda.empty_cache()

with torch.no_grad():
    for i, prompt in enumerate(test_prompts, 1):
        question = prompt.split("Instruction: ")[1].split("\n")[0]
        print(f"\n[Test {i}] Q: {question}")
        
        inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
        
        outputs = model.generate(
            **inputs,
            max_new_tokens=100,
            do_sample=True,
            temperature=0.6,
            top_p=0.9,
        )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        answer = response.split("Response:")[-1].strip()
        
        print(f"A: {answer}")
        print("-" * 60)

print("\n✅ TESTING COMPLETE!")