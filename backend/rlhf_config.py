# RLHF Configuration
import torch

# Paths
BASE_MODEL_PATH = "./models/finance_phi2_model"
RLHF_MODEL_PATH = "./models/finance_phi2_rlhf"
FEEDBACK_DATA_PATH = "./data/feedback_data.json"

# Training settings (optimized for RTX 4060 8GB)
BATCH_SIZE = 2
GRADIENT_ACCUMULATION_STEPS = 4
LEARNING_RATE = 1e-5
MAX_STEPS = 100
LORA_R = 8
LORA_ALPHA = 16

# Feedback thresholds
MIN_FEEDBACK_FOR_TRAINING = 20  # Start training after 20 feedbacks
POSITIVE_THRESHOLD = 4  # Rating >= 4 is good
NEGATIVE_THRESHOLD = 2  # Rating <= 2 is bad

# Device
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"