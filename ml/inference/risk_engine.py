def calculate_risk(likelihood, event_severity_multiplier=1.5, historical_evidence_score=1.2):
    """
    Convert model likelihood to an actionable severity score.
    Returns Risk Score (0-100) and Risk Level.
    """
    # Base risk score from probability
    base_score = float(likelihood) * 100
    
    # Transparent algorithm combining factors
    risk_score = base_score * event_severity_multiplier * historical_evidence_score
    
    # Cap at 100
    risk_score = min(100.0, max(0.0, risk_score))
    
    if risk_score >= 70:
        level = "HIGH"
    elif risk_score >= 30:
        level = "MEDIUM"
    else:
        level = "LOW"
        
    return {
        "risk_score": round(risk_score, 2),
        "risk_level": level,
        "likelihood": round(float(likelihood), 4)
    }

