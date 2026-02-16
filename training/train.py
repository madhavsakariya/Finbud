"""
FinBud Phi-2 - FINAL WORKING VERSION
Forces multiple layers + adds stability fixes
"""

import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    Trainer, 
    TrainingArguments,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model
from datasets import Dataset
import json

print("="*60)
print("FINBUD PHI-2 - FINAL FIX")
print("="*60)

assert torch.cuda.is_available(), "No GPU!"
print(f"✅ GPU: {torch.cuda.get_device_name(0)}")

# Data
print("\n[1/5] Loading data...")
try:
    with open("dataset.json", "r") as f:
        data = json.load(f)
except:
    with open("dataset.json", "r") as f:
        data = json.load(f)

print(f"✅ {len(data)} examples")

# Phi-2
print("\n[2/5] Loading Phi-2...")
model = AutoModelForCausalLM.from_pretrained(
    "microsoft/phi-2",
    torch_dtype=torch.float16,
    trust_remote_code=True
)
tokenizer = AutoTokenizer.from_pretrained("microsoft/phi-2", trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token

model = model.to("cuda")
print(f"✅ Loaded")

# Find ALL Linear layers
print("\n[3/5] Finding layers...")
layers = {}
for name, module in model.named_modules():
    if isinstance(module, torch.nn.Linear):
        layer_type = name.split('.')[-1]
        if layer_type not in layers:
            layers[layer_type] = 0
        layers[layer_type] += 1

print(f"   Available layers: {dict(sorted(layers.items(), key=lambda x: x[1], reverse=True))}")

# CRITICAL: Use MULTIPLE important layers, not just one!
# Priority: attention layers > MLP layers
if 'q_proj' in layers and 'v_proj' in layers:
    targets = ['q_proj', 'v_proj', 'k_proj', 'o_proj']  # All attention
elif 'Wqkv' in layers:
    targets = ['Wqkv', 'out_proj', 'fc1', 'fc2']  # Attention + MLP
else:
    # Fallback: use top 4 most common layers
    targets = sorted(layers.items(), key=lambda x: x[1], reverse=True)[:4]
    targets = [t[0] for t in targets]

print(f"✅ Using {len(targets)} layers: {targets}")

# LoRA with MORE capacity
print("\n[4/5] Adding LoRA...")
config = LoraConfig(
    r=16,  # Increased from 8
    lora_alpha=32,  # Increased from 16
    target_modules=targets,  # Multiple layers!
    lora_dropout=0.05,
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, config)
print("✅ LoRA applied")
model.print_trainable_parameters()

# Data prep
print("\n[5/5] Preparing data...")

def format_data(examples):
    if 'question' in examples:
        texts = [f"Q: {q}\nA: {a}" for q, a in zip(examples['instruction'], examples['output'])]
    else:
        texts = [f"Q: {i}\nA: {o}" for i, o in zip(examples['instruction'], examples['output'])]
    return {"text": texts}

dataset = Dataset.from_list(data)
dataset = dataset.map(format_data, batched=True, remove_columns=dataset.column_names)

def tokenize(examples):
    return tokenizer(examples["text"], truncation=True, max_length=200)  # Shorter for stability

tokenized = dataset.map(tokenize, batched=True, remove_columns=["text"])
print(f"✅ {len(tokenized)} examples ready")

# Data collator
data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

# Training with STABILITY settings
print("\n🚀 Training...")
print("="*60)

args = TrainingArguments(
    output_dir="./models/finance_phi2_final",
    num_train_epochs=5,  # More epochs
    per_device_train_batch_size=1,  # Smaller batch
    gradient_accumulation_steps=8,  # More accumulation
    learning_rate=1e-4,  # Lower LR for stability
    warmup_steps=20,  # More warmup
    max_grad_norm=0.5,  # Gradient clipping!
    logging_steps=2,
    save_strategy="no",
    fp16=False,
    report_to="none"
)

trainer = Trainer(
    model=model,
    args=args,
    train_dataset=tokenized,
    data_collator=data_collator
)

torch.cuda.empty_cache()
result = trainer.train()

print(f"\n✅ TRAINING DONE!")
print(f"   Final loss: {result.training_loss:.4f}")

# Save
model.save_pretrained("./models/finbud_stable")
tokenizer.save_pretrained("./models/finbud_stable")
print("✅ Saved: ./models/finbud_stable")

# Test with SAFE generation settings
print("\n🧪 Testing...")
model.eval()

for q in ["What is compound interest?", "Should I invest?"]:
    prompt = f"Q: {q}\nA:"
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    
    with torch.no_grad():
        try:
            out = model.generate(
                **inputs,
                max_new_tokens=50,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                top_k=50,  # Add top-k
                repetition_penalty=1.1,
                pad_token_id=tokenizer.eos_token_id,
                eos_token_id=tokenizer.eos_token_id
            )
            
            result = tokenizer.decode(out[0], skip_special_tokens=True)
            answer = result.split("A:")[-1].strip()
            print(f"\n❓ {q}")
            print(f"💬 {answer[:150]}")
            
        except RuntimeError as e:
            print(f"\n❓ {q}")
            print(f"⚠️  Generation error (model needs more training): {str(e)[:50]}")

print("\n" + "="*60)
print("🎉 COMPLETE!")
print("="*60)
print("\n💡 Tips:")
print("   - Model trained on multiple layers (not just 'dense')")
print("   - If still unstable, train for more epochs")
print("   - Loss should decrease consistently")
print("="*60)