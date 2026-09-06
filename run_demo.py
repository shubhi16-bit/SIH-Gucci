import pandas as pd
import os
import json
from ml.features.extractor import extract_features
from ml.training.labels import generate_labels
from ml.training.train_xgboost import train_model
from ml.evaluation.metrics import evaluate_model
from ml.inference.predictor import predict_current_state

def run_demo():
    print("=== SIH26121 (eRTMAC-NWIS) Risk/Prediction Model Demo ===")
    
    # Paths
    demo_stream_path = 'data/processed/demo_active_well/demo_stream.csv'
    events_path = 'data/processed/events.csv'
    parquet_path = 'data/processed/model_features.parquet'
    
    # Load data
    print(f"\n[1] Loading telemetry from {demo_stream_path}...")
    telemetry_df = pd.read_csv(demo_stream_path, low_memory=False)
    print(f"Loaded {len(telemetry_df)} rows.")
    
    print(f"\n[2] Loading historical events from {events_path}...")
    try:
        events_df = pd.read_csv(events_path, low_memory=False)
        print(f"Loaded {len(events_df)} events.")
    except Exception as e:
        print(f"Could not load events: {e}. Using empty dataframe.")
        events_df = pd.DataFrame()
        
    # Feature extraction
    print("\n[3] Extracting features (Rolling windows, slopes)...")
    features_df = extract_features(telemetry_df)
    
    # Label generation
    print("\n[4] Generating labels from historical DDR events...")
    labeled_df = generate_labels(features_df, events_df, depth_col='Depth')
    
    # Save to parquet
    print(f"\n[5] Saving processed features to {parquet_path}...")
    labeled_df.to_parquet(parquet_path, index=False)
    
    # Train model
    print("\n[6] Training XGBoost Risk Model...")
    model, X_test, y_test = train_model(labeled_df)
    
    # Evaluation
    print("\n[7] Evaluating Model...")
    precision, recall, f1 = evaluate_model(model, X_test, y_test)
    print(f"Precision: {precision:.2f}, Recall: {recall:.2f}, F1: {f1:.2f}")
    
    # Inference Demo
    print("\n[8] Running Test Inference on live telemetry slice...")
    
    # Simulate a "current state" (e.g., last 15 rows of the demo stream)
    current_telemetry = telemetry_df.iloc[-15:].copy()
    
    # Context vector from Similarity Engine (mocked for demo)
    context_vector = {
        'formation_match': 0.85,
        'prox_to_hist_event': 12.5,
        'hist_event_freq': 2
    }
    
    risk_output = predict_current_state(current_telemetry, context_vector)
    
    print("\n==================================================")
    print("FINAL RISK ENGINE OUTPUT")
    print("==================================================")
    print(json.dumps(risk_output, indent=4))
    print("==================================================")

if __name__ == '__main__':
    run_demo()

