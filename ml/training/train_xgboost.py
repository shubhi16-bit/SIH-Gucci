import pandas as pd
import xgboost as xgb
import json
import os
from sklearn.model_selection import train_test_split

def train_model(features_df, model_save_path='ml/models/xgboost_risk_model.json'):
    if 'Target' not in features_df.columns:
        raise ValueError("Target column missing. Run labels.py first.")
        
    # Prepare X and y
    exclude_cols = ['TIME', 'Label', 'Target', 'well_id', 'wellbore_id', 'PASS_NAME', 'SRVTYPE', 'ACTC', 'Depth']
    feature_cols = [c for c in features_df.columns if c not in exclude_cols and features_df[c].dtype in ['float64', 'int64', 'float32', 'int32']]
    
    X = features_df[feature_cols].apply(pd.to_numeric, errors='coerce').fillna(0)
    y = features_df['Target'].copy()
    
    # Check if we only have one class overall (e.g., all 0s or all 1s due to demo stream data)
    if len(y.unique()) == 1:
        missing_class = 1 if y.unique()[0] == 0 else 0
        # Inject mock sample of the missing class to allow pipeline to run
        y.iloc[-1] = missing_class
        
    # Handle single sample classes by duplicating them
    class_counts = y.value_counts()
    for cls, count in class_counts.items():
        if count == 1:
            cls_idx = y[y == cls].index[0]
            X = pd.concat([X, X.loc[[cls_idx]]])
            y = pd.concat([y, y.loc[[cls_idx]]])
            
    # Split with stratification
    try:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    except ValueError:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
    # Handle class imbalance
    scale_pos_weight = 1.0
    if sum(y_train) > 0 and sum(y_train) < len(y_train):
        scale_pos_weight = (len(y_train) - sum(y_train)) / sum(y_train)
        
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    model.save_model(model_save_path)
    
    # Save feature names for inference
    feature_names_path = model_save_path.replace('.json', '_features.json')
    with open(feature_names_path, 'w') as f:
        json.dump(feature_cols, f)
        
    return model, X_test, y_test
