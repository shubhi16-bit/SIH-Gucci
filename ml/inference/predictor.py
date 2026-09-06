import pandas as pd
import xgboost as xgb
import json
import os
import sys

# Add parent directory to path to allow relative imports if run as script
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from ml.features.extractor import extract_features, add_contextual_features
from ml.inference.risk_engine import calculate_risk
from ml.inference.explain import explain_prediction

def predict_current_state(telemetry_vector, context_dict, model_dir='ml/models'):
    model_path = os.path.join(model_dir, 'xgboost_risk_model.json')
    features_path = os.path.join(model_dir, 'xgboost_risk_model_features.json')
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Please train the model first.")
        
    model = xgb.XGBClassifier()
    model.load_model(model_path)
    
    with open(features_path, 'r') as f:
        feature_names = json.load(f)
        
    # Ensure telemetry_vector is a dataframe
    if isinstance(telemetry_vector, dict):
        telemetry_df = pd.DataFrame([telemetry_vector])
    elif isinstance(telemetry_vector, pd.Series):
        telemetry_df = telemetry_vector.to_frame().T
    else:
        telemetry_df = telemetry_vector.copy()
        
    # 1. Feature scaling/extraction
    features_df = extract_features(telemetry_df)
    features_df = add_contextual_features(features_df, context_dict)
    
    # Get the latest row for inference
    latest_features = features_df.iloc[[-1]].copy()
    
    # Ensure all required features are present
    for col in feature_names:
        if col not in latest_features.columns:
            latest_features[col] = 0.0
            
    X_infer = latest_features[feature_names].apply(pd.to_numeric, errors='coerce').fillna(0)
    
    # 2. Run model
    prob = model.predict_proba(X_infer)[0][1]
    
    # 3. Risk Engine
    risk_output = calculate_risk(prob)
    
    # 4. Explainability
    explanations = explain_prediction(model, X_infer, feature_names)
    risk_output['explanations'] = explanations
    
    return risk_output

