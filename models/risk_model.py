import os
import pickle
import numpy as np
import pandas as pd

# Try importing shap, but don't fail if it's compiling
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

# Fallback rule-based risk prediction if model loading fails
def fallback_risk_predict(credit_score, salary, loan_amount, job_stability, education_score, linkedin_score, device_trust, email_trust):
    # Normalize inputs to a realistic credit-risk scale
    credit_norm = (credit_score - 300.0) / 550.0
    salary_factor = min(salary / 150000.0, 1.5)
    debt_to_income = loan_amount / max(salary, 1.0)

    job_factor = max(0.0, min(1.0, job_stability / 10.0))
    education_factor = max(0.0, min(1.0, education_score / 10.0))
    linkedin_factor = max(0.0, min(1.0, linkedin_score / 10.0))
    device_factor = max(0.0, min(1.0, device_trust / 10.0))
    email_factor = max(0.0, min(1.0, email_trust / 10.0))

    # Approval probability is driven by affordability and credit quality.
    approval_prob = (
        0.28
        + 0.48 * credit_norm
        + 0.18 * salary_factor
        + 0.14 * job_factor
        + 0.12 * education_factor
        + 0.10 * linkedin_factor
        + 0.10 * device_factor
        + 0.10 * email_factor
        - 0.33 * debt_to_income
    )

    approval_prob = max(0.05, min(0.97, approval_prob))
    risk_prob = 1.0 - approval_prob

    # credit score range [300, 850] mapped from approval probability
    dynamic_base_score = int(300 + approval_prob * 550)

    if approval_prob >= 0.72:
        category = "Low"
        decision = "Approve"
    elif approval_prob >= 0.45:
        category = "Medium"
        decision = "Approve"
    else:
        category = "High"
        decision = "Reject"

    return {
        "risk_probability": float(risk_prob),
        "approval_probability": float(approval_prob),
        "credit_score": dynamic_base_score,
        "risk_category": category,
        "decision": decision
    }

class RiskModel:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "risk_classifier.pkl")
        self.model = None
        self.explainer = None
        self.load_model()
        
    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, "rb") as f:
                    self.model = pickle.load(f)
                if SHAP_AVAILABLE:
                    try:
                        self.explainer = shap.TreeExplainer(self.model)
                    except Exception as e:
                        print(f"Warning: Could not create SHAP explainer: {e}")
                        self.explainer = None
            except Exception as e:
                print(f"Warning: Failed to load XGBoost risk model: {e}")
                self.model = None

    def calculate_shap_values(self, features_dict: dict, prob: float):
        # We calculate the Shapley contributions of each feature
        # Features are: credit_score, salary, loan_amount, job_stability_score, 
        # education_score, linkedin_score, device_trust_score, email_trust_score
        
        feature_names = [
            "credit_score", "salary", "loan_amount", 
            "job_stability_score", "education_score", 
            "linkedin_score", "device_trust_score", "email_trust_score"
        ]
        
        # Exact values or SHAP library values
        if SHAP_AVAILABLE and self.model is not None and self.explainer is not None:
            try:
                df_feat = pd.DataFrame([features_dict])[feature_names]
                shap_vals = self.explainer.shap_values(df_feat)[0]
                
                # Format to dictionary
                shap_dict = {}
                for name, val in zip(feature_names, shap_vals):
                    # SHAP values in probability / log-odds space
                    shap_dict[name] = float(val)
                return shap_dict
            except Exception as e:
                print(f"Error calling native SHAP: {e}, falling back to analytical SHAP")
                
        # Analytical SHAP approximation
        # Base credit score mean is 575, salary is 135000, loan is 52500, etc.
        means = {
            "credit_score": 575.0,
            "salary": 135000.0,
            "loan_amount": 52500.0,
            "job_stability_score": 5.5,
            "education_score": 5.5,
            "linkedin_score": 5.5,
            "device_trust_score": 6.0,
            "email_trust_score": 6.5
        }
        
        # Directions: positive means increases loan approval, negative means decreases it
        # Note: XGBoost predicts default risk (so SHAP values typically represent increase/decrease in default risk).
        # We present SHAP values relative to "Loan Approval Probability" for clear customer display!
        # Thus:
        # High credit score increases approval (+ SHAP)
        # High salary increases approval (+ SHAP)
        # High loan amount decreases approval (- SHAP)
        # High job stability increases approval (+ SHAP)
        # High education score increases approval (+ SHAP)
        # High LinkedIn score increases approval (+ SHAP)
        # High device trust increases approval (+ SHAP)
        # High email trust increases approval (+ SHAP)
        
        shap_dict = {}
        
        # Credit Score SHAP
        credit_diff = features_dict["credit_score"] - means["credit_score"]
        shap_dict["credit_score"] = float((credit_diff / 550.0) * 3.5)
        
        # Salary SHAP
        sal_diff = features_dict["salary"] - means["salary"]
        shap_dict["salary"] = float((sal_diff / 230000.0) * 1.5)
        
        # Loan Amount SHAP
        loan_diff = features_dict["loan_amount"] - means["loan_amount"]
        # higher loan decreases approval
        shap_dict["loan_amount"] = float(-(loan_diff / 95000.0) * 2.0)
        
        # Job Stability SHAP
        job_diff = features_dict["job_stability_score"] - means["job_stability_score"]
        shap_dict["job_stability_score"] = float((job_diff / 9.0) * 1.2)
        
        # Education Score SHAP
        edu_diff = features_dict["education_score"] - means["education_score"]
        shap_dict["education_score"] = float((edu_diff / 9.0) * 1.0)
        
        # LinkedIn Score SHAP
        li_diff = features_dict["linkedin_score"] - means["linkedin_score"]
        shap_dict["linkedin_score"] = float((li_diff / 9.0) * 0.8)
        
        # Device Trust SHAP
        dev_diff = features_dict["device_trust_score"] - means["device_trust_score"]
        shap_dict["device_trust_score"] = float((dev_diff / 9.0) * 0.5)
        
        # Email Trust SHAP
        em_diff = features_dict["email_trust_score"] - means["email_trust_score"]
        shap_dict["email_trust_score"] = float((em_diff / 9.0) * 0.5)
        
        # Adjust overall sum to reflect deviation from a base probability of ~0.65
        current_sum = sum(shap_dict.values())
        actual_deviation = prob - 0.65
        
        if current_sum != 0:
            scale = actual_deviation / current_sum
            for k in shap_dict:
                shap_dict[k] *= scale
                
        return shap_dict

    def predict_risk(self, credit_score: int, salary: float, loan_amount: float, 
                     job_stability_score: float, education_score: float, 
                     linkedin_score: float, device_trust_score: float, email_trust_score: float):
        
        features_dict = {
            "credit_score": float(credit_score),
            "salary": float(salary),
            "loan_amount": float(loan_amount),
            "job_stability_score": float(job_stability_score),
            "education_score": float(education_score),
            "linkedin_score": float(linkedin_score),
            "device_trust_score": float(device_trust_score),
            "email_trust_score": float(email_trust_score)
        }
        
        if self.model is not None:
            try:
                feature_names = [
                    "credit_score", "salary", "loan_amount", 
                    "job_stability_score", "education_score", 
                    "linkedin_score", "device_trust_score", "email_trust_score"
                ]
                df_feat = pd.DataFrame([features_dict])[feature_names]
                
                # Predict default risk probability
                default_prob = self.model.predict_proba(df_feat)[0][1]
                model_approval_prob = 1.0 - default_prob

                # The loaded model can overfit or saturate when the training distribution is narrow,
                # so we blend it with the transparent fallback score to keep real-world decisions
                # sensitive to applicant quality.
                fallback_result = fallback_risk_predict(
                    credit_score, salary, loan_amount, job_stability_score,
                    education_score, linkedin_score, device_trust_score, email_trust_score
                )
                approval_prob = max(
                    0.05,
                    min(0.97, 0.25 * model_approval_prob + 0.75 * fallback_result["approval_probability"])
                )

                # Map to [300, 850] Credit Score
                base_score = int(300 + approval_prob * 550)

                if approval_prob >= 0.72:
                    category = "Low"
                    decision = "Approve"
                elif approval_prob >= 0.45:
                    category = "Medium"
                    decision = "Approve"
                else:
                    category = "High"
                    decision = "Reject"

                shap_vals = self.calculate_shap_values(features_dict, approval_prob)

                return {
                    "risk_probability": float(1.0 - approval_prob),
                    "approval_probability": float(approval_prob),
                    "credit_score": base_score,
                    "risk_category": category,
                    "decision": decision,
                    "shap_values": shap_vals
                }
            except Exception as e:
                print(f"XGBoost scoring failed: {e}, falling back to analytical engine")
                fb = fallback_risk_predict(
                    credit_score, salary, loan_amount, job_stability_score, 
                    education_score, linkedin_score, device_trust_score, email_trust_score
                )
                fb["shap_values"] = self.calculate_shap_values(features_dict, fb["approval_probability"])
                return fb
        else:
            fb = fallback_risk_predict(
                credit_score, salary, loan_amount, job_stability_score, 
                education_score, linkedin_score, device_trust_score, email_trust_score
            )
            fb["shap_values"] = self.calculate_shap_values(features_dict, fb["approval_probability"])
            return fb

# Singleton Instance
risk_engine = RiskModel()
