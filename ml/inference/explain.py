import numpy as np

def explain_prediction(model, feature_vector, feature_names):
    """
    Extract top driving factors for a prediction using tree feature importances.
    """
    importances = model.feature_importances_
    
    # Weight importance by actual feature values to explain this specific instance
    contributions = importances * np.abs(feature_vector.values.flatten())
    
    # Get top 3 driving factors
    top_indices = np.argsort(contributions)[::-1][:3]
    
    reasons = []
    for idx in top_indices:
        feat_name = feature_names[idx]
        feat_val = feature_vector.values.flatten()[idx]
        
        # Human-readable generation
        if 'Delta' in feat_name:
            direction = "increased" if feat_val > 0 else "dropped"
            reasons.append(f"{feat_name.replace('Delta_', '')} {direction} (val: {feat_val:.2f})")
        elif 'roll_mean' in feat_name:
            reasons.append(f"Sustained activity in {feat_name.split('_')[0]} over recent window")
        elif 'prox_to_hist' in feat_name:
            reasons.append(f"Proximity to historical event depth is concerning")
        elif 'formation_match' in feat_name:
            reasons.append(f"Formation matches high-risk offset wells")
        else:
            reasons.append(f"{feat_name} is a key driving factor (val: {feat_val:.2f})")
            
    return reasons

