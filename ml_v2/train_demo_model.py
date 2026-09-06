"""
Demo Risk Model Trainer for eRTMAC-NWIS (SIH 2026 Prototype)
Trains and saves data/processed/demo_risk_model.joblib
"""

import os
import sys
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score, average_precision_score, brier_score_loss

sys.path.append('.')

FEATURE_COLS = [
    'feat_depth',
    'feat_norm_depth',
    'feat_similar_well_count',
    'feat_best_similarity',
    'feat_mean_similarity',
    'feat_weighted_any_evidence',
    'feat_weighted_mud_loss_evidence',
    'feat_weighted_kick_evidence',
    'feat_weighted_stuck_pipe_evidence',
    'feat_high_confidence_event_count',
    'feat_closest_event_distance'
]

def train_demo_model(
    checkpoints_path: str = "data/processed/demo_risk_checkpoints.csv",
    output_model_path: str = "data/processed/demo_risk_model.joblib"
):
    print("==================================================")
    print("TRAINING DEMO RISK MODEL")
    print("==================================================")

    df = pd.read_csv(checkpoints_path)
    X = df[FEATURE_COLS].values
    y = df['target_25m'].values

    # Fit HistGradientBoostingClassifier with balanced class weighting for responsive hazard detection
    clf = HistGradientBoostingClassifier(
        max_iter=150,
        learning_rate=0.08,
        max_depth=5,
        class_weight='balanced',
        random_state=42
    )

    clf.fit(X, y)

    y_pred_proba = clf.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, y_pred_proba)
    pr_auc = average_precision_score(y, y_pred_proba)
    brier = brier_score_loss(y, y_pred_proba)

    print(f"Training Checkpoints: {len(df)} (Positives: {sum(y)}, Negatives: {len(y) - sum(y)})")
    print(f"Demo Model Fit Metrics: ROC-AUC={auc:.4f}, PR-AUC={pr_auc:.4f}, Brier={brier:.4f}")

    meta = {
        "features": FEATURE_COLS,
        "n_samples": int(len(df)),
        "n_positives": int(sum(y)),
        "train_auc": float(auc),
        "train_pr_auc": float(pr_auc)
    }

    payload = {
        "model": clf,
        "feature_names": FEATURE_COLS,
        "meta": meta
    }

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    joblib.dump(payload, output_model_path)
    print(f"Demo model saved successfully to: {output_model_path}")

    return payload

if __name__ == "__main__":
    train_demo_model()

