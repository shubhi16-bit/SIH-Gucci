import unittest
import pandas as pd
import numpy as np
import os
import sys

# Add parent directory to path to resolve 'ml' module imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.features.extractor import extract_features
from ml.inference.predictor import predict_current_state

class TestRiskModelPipeline(unittest.TestCase):
    
    def setUp(self):
        self.model_dir = 'ml/models'
        # Context vector from Similarity Engine (mocked for demo)
        self.context_vector = {
            'formation_match': 0.85,
            'prox_to_hist_event': 12.5,
            'hist_event_freq': 2
        }
        
    def test_feature_extraction_missing_values(self):
        # Create telemetry with missing values and edge cases
        raw_data = {
            'ROP5': [10, np.nan, 12, 0, 15],
            'TQA': [1000, 1100, np.nan, 1200, 1300],
            'SWOB': [20, 22, 21, np.nan, 23],
            'SPPA': [3000, 3100, 3200, 3150, np.nan],
            'DMEA': [1000, 1010, 1020, 1030, 1040]
        }
        df = pd.DataFrame(raw_data)
        
        extracted = extract_features(df)
        
        # Verify no NaNs in output
        self.assertFalse(extracted.isna().any().any(), "Extracted features should not contain NaNs")
        
        # Verify required derived features exist
        self.assertIn('ROP_roll_mean_5', extracted.columns)
        self.assertIn('Delta_Torque', extracted.columns)

    def test_model_loads_successfully(self):
        model_path = os.path.join(self.model_dir, 'xgboost_risk_model.json')
        features_path = os.path.join(self.model_dir, 'xgboost_risk_model_features.json')
        
        self.assertTrue(os.path.exists(model_path), f"Model file missing at {model_path}")
        self.assertTrue(os.path.exists(features_path), f"Features file missing at {features_path}")

    def test_prediction_normal_sample(self):
        # Simulated normal stable drilling telemetry
        normal_data = {
            'ROP5': [20, 20, 21, 20, 20],
            'TQA': [1500, 1510, 1500, 1520, 1510],
            'SWOB': [25, 25, 24, 25, 25],
            'SPPA': [3000, 3010, 3000, 3020, 3010],
            'DMEA': [2000, 2010, 2020, 2030, 2040]
        }
        df = pd.DataFrame(normal_data)
        
        result = predict_current_state(df, self.context_vector, model_dir=self.model_dir)
        
        print("\n--- Normal State Prediction ---")
        print(result)
        
        self.assertIn('risk_score', result)
        self.assertIn('risk_level', result)
        self.assertIn('likelihood', result)
        self.assertIn('explanations', result)

    def test_prediction_abnormal_sample(self):
        # Simulated abnormal condition: torque spikes, ROP drops
        abnormal_data = {
            'ROP5': [20, 18, 10, 5, 0],
            'TQA': [1500, 1800, 2500, 3000, 3500],
            'SWOB': [25, 25, 25, 25, 25],
            'SPPA': [3000, 3200, 3500, 3800, 4000],
            'DMEA': [2000, 2005, 2010, 2012, 2015]
        }
        df = pd.DataFrame(abnormal_data)
        
        result = predict_current_state(df, self.context_vector, model_dir=self.model_dir)
        
        print("\n--- Abnormal State Prediction ---")
        print(result)
        
        self.assertIn('risk_score', result)
        self.assertIn('risk_level', result)
        self.assertIn('likelihood', result)
        self.assertIn('explanations', result)

if __name__ == '__main__':
    unittest.main(verbosity=2)

