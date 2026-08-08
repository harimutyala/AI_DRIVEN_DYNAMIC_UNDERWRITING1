def calculate_dynamic_risk(base_score: int, 
                           salary_received_count: int, 
                           payments_ontime_count: int,
                           payments_late_count: int,
                           payments_missed_count: int,
                           fraud_level: str,
                           anomalies_count: int) -> dict:
    """
    Module 9: Dynamic Risk Score Engine.
    Formula: New Score = Base Score + Behaviour Adjustment + Fraud Adjustment + Payment Adjustment
    """
    
    # 1. Behaviour Adjustment (Salary received)
    # Each salary received boosts score slightly by +15 points, max +60
    behaviour_adj = min(salary_received_count * 15, 60)
    
    # 2. Payment Adjustment
    # On time: +20 points each, max +80
    # Late: -30 points each
    # Missed: -70 points each
    payment_adj = (payments_ontime_count * 20) - (payments_late_count * 30) - (payments_missed_count * 70)
    
    # 3. Fraud and Anomaly Adjustment
    # Anomalies deduct 15 points each
    # Fraud level deducts heavily: High -> -180, Medium -> -80, Low -> -0
    anomaly_deduction = - (anomalies_count * 20)
    
    fraud_deduction = 0
    if fraud_level == "High":
        fraud_deduction = -180
    elif fraud_level == "Medium":
        fraud_deduction = -80
        
    fraud_adj = anomaly_deduction + fraud_deduction
    
    # Calculate New Score (bounded in [300, 850] range)
    new_score = base_score + behaviour_adj + payment_adj + fraud_adj
    new_score = max(300, min(850, new_score))
    
    # Map back to risk category
    if new_score >= 700:
        new_category = "Low"
    elif new_score >= 550:
        new_category = "Medium"
    else:
        new_category = "High"
        
    return {
        "base_score": base_score,
        "behaviour_adjustment": behaviour_adj,
        "payment_adjustment": payment_adj,
        "fraud_adjustment": fraud_adj,
        "dynamic_score": new_score,
        "risk_category": new_category
    }
