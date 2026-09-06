import pandas as pd
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix
import os

def evaluate_model(model, X_test, y_test, report_path='docs/model_evaluation.md'):
    y_pred = model.predict(X_test)
    
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)
    
    # Safely handle confusion matrix output
    cm_00 = cm[0][0] if cm.shape == (2,2) else (cm[0][0] if len(cm)>0 and len(cm[0])>0 else 'N/A')
    cm_01 = cm[0][1] if cm.shape == (2,2) else 'N/A'
    cm_10 = cm[1][0] if cm.shape == (2,2) else 'N/A'
    cm_11 = cm[1][1] if cm.shape == (2,2) else 'N/A'
    
    report = f"""# Model Evaluation Report

## Metrics (Focusing on Class Imbalance)
- **Precision**: {precision:.4f}
- **Recall**: {recall:.4f}
- **F1-Score**: {f1:.4f}

## Confusion Matrix
| | Predicted Normal | Predicted Abnormal |
|---|---|---|
| **Actual Normal** | {cm_00} | {cm_01} |
| **Actual Abnormal** | {cm_10} | {cm_11} |

*Note: Accuracy is omitted as the headline metric due to extreme class imbalance.*
"""
    
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, 'w') as f:
        f.write(report)
        
    return precision, recall, f1

