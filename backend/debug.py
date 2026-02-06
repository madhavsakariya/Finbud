import os
import sys

print("✅ 1. Python is running...")
print(f"   Current Directory: {os.getcwd()}")

# Check Config
try:
    print("⏳ 2. Importing rlhf_config...")
    import rlhf_config
    print("   Config imported successfully.")
    print(f"   Model Path in Config: {rlhf_config.BASE_MODEL_PATH}")
    
    if os.path.exists(rlhf_config.BASE_MODEL_PATH):
        print("   ✅ Model folder FOUND.")
    else:
        print("   ❌ Model folder NOT FOUND. Check the path!")
except Exception as e:
    print(f"   ❌ Error importing config: {e}")

# Check Torch
print("⏳ 3. Importing Torch (this might take 30 seconds)...")
try:
    import torch
    print(f"   ✅ Torch imported. Version: {torch.__version__}")
    print(f"   CUDA Available: {torch.cuda.is_available()}")
except ImportError as e:
    print(f"   ❌ Torch NOT installed or broken: {e}")

# Check Transformers
print("⏳ 4. Importing Transformers...")
try:
    from transformers import AutoTokenizer
    print("   ✅ Transformers imported.")
except ImportError as e:
    print(f"   ❌ Transformers library missing: {e}")

print("✅ DIAGNOSTIC COMPLETE.")