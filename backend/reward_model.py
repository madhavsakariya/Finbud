"""
Lightweight Reward Model
Scores responses based on feedback
"""
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import rlhf_config as config

class RewardModel:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=100)
        self.good_examples = []
        self.bad_examples = []
        self.is_trained = False
        
    def load_feedback(self):
        """Load feedback from JSON"""
        try:
            with open(config.FEEDBACK_DATA_PATH, 'r') as f:
                data = json.load(f)
            
            self.good_examples = []
            self.bad_examples = []
            
            for item in data:
                if item['rating'] >= config.POSITIVE_THRESHOLD:
                    self.good_examples.append(item['response'])
                elif item['rating'] <= config.NEGATIVE_THRESHOLD:
                    self.bad_examples.append(item['response'])
            
            print(f"✅ Loaded {len(self.good_examples)} good, {len(self.bad_examples)} bad examples")
            return len(self.good_examples) + len(self.bad_examples)
            
        except FileNotFoundError:
            print("No feedback data found")
            return 0
    
    def train(self):
        """Train reward model on feedback"""
        count = self.load_feedback()
        
        if count < config.MIN_FEEDBACK_FOR_TRAINING:
            print(f"Need {config.MIN_FEEDBACK_FOR_TRAINING - count} more feedbacks")
            return False
        
        # Create training data
        all_texts = self.good_examples + self.bad_examples
        labels = [1] * len(self.good_examples) + [0] * len(self.bad_examples)
        
        # Fit vectorizer
        self.vectorizer.fit(all_texts)
        self.is_trained = True
        
        print("✅ Reward model trained")
        return True
    
    def score(self, response):
        """
        Score a response (0 = bad, 1 = good)
        """
        if not self.is_trained:
            return 0.5  # Neutral if not trained
        
        # Vectorize response
        response_vec = self.vectorizer.transform([response])
        
        # Compare to good examples
        if self.good_examples:
            good_vecs = self.vectorizer.transform(self.good_examples)
            good_similarity = cosine_similarity(response_vec, good_vecs).mean()
        else:
            good_similarity = 0
        
        # Compare to bad examples
        if self.bad_examples:
            bad_vecs = self.vectorizer.transform(self.bad_examples)
            bad_similarity = cosine_similarity(response_vec, bad_vecs).mean()
        else:
            bad_similarity = 0
        
        # Score: higher if similar to good, lower if similar to bad
        score = (good_similarity - bad_similarity + 1) / 2
        return np.clip(score, 0, 1)

if __name__ == "__main__":
    # Test
    rm = RewardModel()
    if rm.train():
        test_response = "Invest in diversified index funds for long-term growth."
        score = rm.score(test_response)
        print(f"Score: {score:.2f}")