"""
Phi-2 Finance Model Training - RTX 4060 8GB
"""

import torch
import json
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, TaskType

print("="*70)
print("PHI-2 FINANCE TRAINING - RTX 4060 8GB")
print("="*70)

# GPU Check
if not torch.cuda.is_available():
    raise SystemError("❌ No CUDA GPU found!")

print(f"✅ GPU: {torch.cuda.get_device_name(0)}")
print(f"   Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
print("="*70)

# Configuration
CONFIG = {
    "model_name": "microsoft/phi-2",
    "dataset_path": "dataset.json",
    "output_dir": "./models/finance_phi2_model",
    "max_length": 256,
    "epochs": 3,
    "batch_size": 1,
    "gradient_accumulation": 8,
    "learning_rate": 2e-4,
}

print("\n📋 Configuration:")
for key, value in CONFIG.items():
    print(f"   {key}: {value}")

# Load Dataset
print("\n📊 Loading dataset...")
with open(CONFIG["dataset_path"], 'r', encoding='utf-8') as f:
    data = json.load(f)

dataset = Dataset.from_list(data)
print(f"✅ Loaded {len(data)} examples")
print(f"   Sample: {data[0]['instruction'][:50]}...")

# Load Tokenizer
print("\n🔤 Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(
    CONFIG["model_name"],
    trust_remote_code=True
)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.pad_token_id = tokenizer.eos_token_id
tokenizer.padding_side = "right"
print(f"✅ Tokenizer loaded ({len(tokenizer):,} tokens)")

# Load Model
print("\n🤖 Loading Phi-2 model...")
print("   Downloading ~5GB (first time only)...")

import gc
gc.collect()
torch.cuda.empty_cache()

model = AutoModelForCausalLM.from_pretrained(
    CONFIG["model_name"],
    torch_dtype=torch.float16,
    trust_remote_code=True,
    low_cpu_mem_usage=True
)

print("   Moving to GPU...")
model = model.to("cuda")

print(f"✅ Model loaded!")
print(f"   Parameters: {model.num_parameters() / 1e9:.2f}B")
print(f"   GPU Memory: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")

# Configure LoRA
print("\n🔧 Configuring LoRA...")
lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM
)

model = get_peft_model(model, lora_config)
print("✅ LoRA applied!")
model.print_trainable_parameters()

# Tokenize Dataset
print("\n🔄 Tokenizing dataset...")

def format_prompt(example):
    instruction = example['instruction']
    input_text = example.get('input', '')
    output = example['output']
    
    if input_text:
        return f"Instruct: {instruction}\nInput: {input_text}\nOutput: {output}"
    else:
        return f"Instruct: {instruction}\nOutput: {output}"

def tokenize_function(example):
    text = format_prompt(example)
    tokenized = tokenizer(
        text,
        max_length=CONFIG["max_length"],
        truncation=True,
        padding="max_length",
        return_tensors=None
    )
    tokenized["labels"] = tokenized["input_ids"].copy()
    return tokenized

tokenized_dataset = dataset.map(
    tokenize_function,
    remove_columns=dataset.column_names,
    desc="Tokenizing"
)
print(f"✅ Dataset ready ({len(tokenized_dataset)} examples)")

# Setup Trainer
print("\n⚙️ Setting up trainer...")

training_args = TrainingArguments(
    output_dir=CONFIG["output_dir"],
    num_train_epochs=CONFIG["epochs"],
    per_device_train_batch_size=CONFIG["batch_size"],
    gradient_accumulation_steps=CONFIG["gradient_accumulation"],
    learning_rate=CONFIG["learning_rate"],
    lr_scheduler_type="cosine",
    warmup_steps=50,
    weight_decay=0.01,
    fp16=True,
    logging_steps=5,
    logging_first_step=True,
    save_strategy="epoch",
    save_total_limit=2,
    report_to="none",
)

data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer,
    mlm=False
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=data_collator,
)

print("✅ Trainer ready!")
print(f"   Effective batch size: {CONFIG['batch_size'] * CONFIG['gradient_accumulation']}")

# Train
print("\n" + "="*70)
print("🚀 STARTING TRAINING")
print("="*70)
print(f"📊 Examples: {len(dataset)}")
print(f"🔄 Epochs: {CONFIG['epochs']}")
print(f"⏱️  Estimated: 15-20 minutes")
print(f"🎯 Target: Loss < 1.0")
print("="*70 + "\n")

gc.collect()
torch.cuda.empty_cache()

trainer.train()

print("\n" + "="*70)
print("✅ TRAINING COMPLETE!")
print("="*70)

# Save Model
print("\n💾 Saving model...")
model.save_pretrained(CONFIG["output_dir"])
tokenizer.save_pretrained(CONFIG["output_dir"])

print(f"✅ Model saved to: {CONFIG['output_dir']}")
print("\n🎉 Training successful!")
print(f"   • Trained on {len(dataset)} finance examples")
print(f"   • {CONFIG['epochs']} epochs completed")
print(f"   • Model ready for inference")
print("="*70)
