import os
import pickle
import numpy as np

# Fallback fraud checking if model loading fails
def fallback_fraud_check(vpn_usage, multiple_devices, disposable_email, impossible_login, phone_verified, device_age_days, email_age_years):
    # Rule-based fallback score calculation
    score = 0.0
    flags = []
    
    if vpn_usage:
        score += 0.35
        flags.append("VPN connection detected")
    if multiple_devices:
        score += 0.20
        flags.append("Login attempts from multiple unrecognized devices")
    if disposable_email:
        score += 0.25
        flags.append("Disposable/Temporary email address domain used")
    if impossible_login:
        score += 0.40
        flags.append("Impossible concurrent login locations")
    if not phone_verified:
        score += 0.15
        flags.append("Unverified mobile number")
    if device_age_days < 30:
        score += 0.10
        flags.append("Very new device fingerprint (less than 30 days)")
    if email_age_years < 1:
        score += 0.10
        flags.append("Very new email account (less than 1 year)")
        
    score = min(score, 1.0)
    
    # Classify severity
    if score >= 0.6:
        level = "High"
    elif score >= 0.25:
        level = "Medium"
    else:
        level = "Low"
        
    return {
        "fraud_score": float(score),
        "fraud_probability": float(score),
        "fraud_level": level,
        "anomalies": flags
    }

class FraudModel:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fraud_detector.pkl")
        self.model = None
        self.load_model()
        
    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, "rb") as f:
                    self.model = pickle.load(f)
            except Exception as e:
                print(f"Warning: Failed to load Isolation Forest model: {e}")
                self.model = None

    def check_fraud(self, vpn_usage: int, multiple_devices: int, disposable_email: int, 
                    impossible_login: int, phone_verified: int, device_age_days: int, 
                    email_age_years: int):
        
        # If model is loaded, we use it for decision scores.
        # Isolation Forest outputs -1 for anomalies, 1 for normal data.
        if self.model is not None:
            try:
                # Prepare features in the exact matching column order as training
                features = np.array([[
                    vpn_usage, multiple_devices, disposable_email, impossible_login,
                    phone_verified, device_age_days, email_age_years
                ]])
                
                # Decision function: lower values mean more anomalous
                decision_val = self.model.decision_function(features)[0]
                
                # Convert decision function score to a normalized [0, 1] probability of fraud
                # Typically, Isolation forest decision function is within [-0.5, 0.5]
                # Lower values (negative) are anomalies.
                fraud_prob = 1.0 / (1.0 + np.exp(decision_val * 8.0)) # mapping logit-like scale
                
                # We can refine using rules to make the explanations rich
                fallback_res = fallback_fraud_check(
                    vpn_usage, multiple_devices, disposable_email, impossible_login,
                    phone_verified, device_age_days, email_age_years
                )
                
                # Dynamic blending: combine ML output with explicit rule flags
                combined_prob = max(fraud_prob, fallback_res["fraud_probability"])
                
                if combined_prob >= 0.55:
                    level = "High"
                elif combined_prob >= 0.25:
                    level = "Medium"
                else:
                    level = "Low"
                    
                return {
                    "fraud_score": float(combined_prob),
                    "fraud_probability": float(combined_prob),
                    "fraud_level": level,
                    "anomalies": fallback_res["anomalies"]
                }
                
            except Exception as e:
                print(f"Inference error in Isolation Forest: {e}, falling back to rule-based engine")
                return fallback_fraud_check(
                    vpn_usage, multiple_devices, disposable_email, impossible_login,
                    phone_verified, device_age_days, email_age_years
                )
        else:
            return fallback_fraud_check(
                vpn_usage, multiple_devices, disposable_email, impossible_login,
                phone_verified, device_age_days, email_age_years
            )

# Singleton Instance
fraud_engine = FraudModel()
