"""
Lightweight RLHF Trainer
Fine-tunes Phi-2 with LoRA based on feedback
"""
import json
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import PPOTrainer, PPOConfig, AutoModelForCausalLMWithValueHead
from reward_model import RewardModel
import rlhf_config as config

class RLHFTrainer:
    def __init__(self):
        self.reward_model = RewardModel()
        self.model = None
        self.tokenizer = None
        
    def prepare_data(self):
        """Prepare training data from feedback"""
        with open(config.FEEDBACK_DATA_PATH, 'r') as f:
            data = json.load(f)
        
        # Filter good examples for training
        training_data = [
            {"prompt": item['question'], "response": item['response']}
            for item in data
            if item['rating'] >= config.POSITIVE_THRESHOLD
        ]
        
        print(f"📊 Training samples: {len(training_data)}")
        return training_data
    
    def simple_rlhf_training(self):
        """
        Simplified RLHF: Fine-tune on high-rated responses
        (More practical for prototype than full PPO)
        """
        print("\n🚀 Starting RLHF Training...")
        
        # 1. Train reward model
        if not self.reward_model.train():
            print("❌ Not enough feedback data")
            return False
        
        # 2. Load model
        print("📥 Loading base model...")
        self.tokenizer = AutoTokenizer.from_pretrained(config.BASE_MODEL_PATH)
        self.model = AutoModelForCausalLM.from_pretrained(
            config.BASE_MODEL_PATH,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        
        # 3. Add LoRA adapters
        print("🔧 Adding LoRA adapters...")
        lora_config = LoraConfig(
            r=config.LORA_R,
            lora_alpha=config.LORA_ALPHA,
            target_modules=["q_proj", "v_proj"],
            lora_dropout=0.05,
            bias="none",
            task_type="CAUSAL_LM"
        )
        self.model = get_peft_model(self.model, lora_config)
        
        # 4. Prepare training data
        training_data = self.prepare_data()
        
        if len(training_data) < 10:
            print("❌ Need at least 10 good examples")
            return False
        
        # 5. Fine-tune on high-reward examples
        print("🎓 Fine-tuning model...")
        self.model.train()
        optimizer = torch.optim.AdamW(self.model.parameters(), lr=config.LEARNING_RATE)
        
        for step in range(config.MAX_STEPS):
            # Sample random example
            sample = training_data[step % len(training_data)]
            
            # Create training example
            text = f"Question: {sample['prompt']}\nAnswer: {sample['response']}"
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
            inputs = {k: v.to(self.model.device) for k, v in inputs.items()}
            
            # Forward pass
            outputs = self.model(**inputs, labels=inputs["input_ids"])
            loss = outputs.loss
            
            # Backward pass
            loss.backward()
            
            if (step + 1) % config.GRADIENT_ACCUMULATION_STEPS == 0:
                optimizer.step()
                optimizer.zero_grad()
            
            if step % 10 == 0:
                print(f"Step {step}/{config.MAX_STEPS}, Loss: {loss.item():.4f}")
        
        # 6. Save model
        print("💾 Saving RLHF model...")
        self.model.save_pretrained(config.RLHF_MODEL_PATH)
        self.tokenizer.save_pretrained(config.RLHF_MODEL_PATH)
        
        print("✅ RLHF training complete!")
        return True
    
    def evaluate(self):
        """Test improvement"""
        print("\n🧪 Evaluating RLHF model...")
        
        test_questions = [
            "Should I invest in stocks?",
            "How to save for retirement?",
            "What's a good emergency fund?"
        ]
        
        for question in test_questions:
            prompt = f"Question: {question}\nAnswer:"
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
            
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=100,
                temperature=0.7,
                do_sample=True
            )
            
            response = self.tokenizer.decode(outputs[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True)
            score = self.reward_model.score(response)
            
            print(f"\nQ: {question}")
            print(f"A: {response[:100]}...")
            print(f"Score: {score:.2f}")

if __name__ == "__main__":
    trainer = RLHFTrainer()
    if trainer.simple_rlhf_training():
        trainer.evaluate()