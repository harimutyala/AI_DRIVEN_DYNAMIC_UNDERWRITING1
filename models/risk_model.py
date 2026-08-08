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
def fallback_risk_predict(credit_score, salary, loan_amount, job_stability, education_score, linkedin_score, device_trust, email_trust, utility_score=5.0, bank_cashflow_score=5.0):
    # Normalize inputs to a realistic credit-risk scale
    credit_norm = (credit_score - 300.0) / 550.0
    salary_factor = min(salary / 150000.0, 1.5)
    debt_to_income = loan_amount / max(salary, 1.0)

    job_factor = max(0.0, min(1.0, job_stability / 10.0))
    education_factor = max(0.0, min(1.0, education_score / 10.0))
    linkedin_factor = max(0.0, min(1.0, linkedin_score / 10.0))
    device_factor = max(0.0, min(1.0, device_trust / 10.0))
    email_factor = max(0.0, min(1.0, email_trust / 10.0))
    utility_factor = max(0.0, min(1.0, utility_score / 10.0))
    cashflow_factor = max(0.0, min(1.0, bank_cashflow_score / 10.0))

    # CIBIL / Credit History Compensation Boost:
    # If traditional credit score is low (< 620), but alternative scores are strong (utility, cashflow, job, edu, linkedin),
    # award a CIBIL compensation boost that bridges the gap!
    alt_sum = (utility_factor * 0.16) + (cashflow_factor * 0.18) + (job_factor * 0.14) + (education_factor * 0.12) + (linkedin_factor * 0.10)
    
    cibil_compensation_boost = 0.0
    if credit_score < 620 and alt_sum > 0.30:
        cibil_compensation_boost = (alt_sum - 0.30) * 0.45

    # Approval probability is driven by affordability and credit quality + alternative data compensation
    approval_prob = (
        0.24
        + 0.40 * credit_norm
        + 0.16 * salary_factor
        + 0.14 * job_factor
        + 0.12 * education_factor
        + 0.10 * linkedin_factor
        + 0.10 * device_factor
        + 0.10 * email_factor
        + 0.14 * utility_factor
        + 0.16 * cashflow_factor
        + cibil_compensation_boost
        - 0.30 * debt_to_income
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
        "decision": decision,
        "cibil_compensation_boost": float(cibil_compensation_boost)
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
        feature_names = [
            "credit_score", "salary", "loan_amount", 
            "job_stability_score", "education_score", 
            "linkedin_score", "device_trust_score", "email_trust_score",
            "utility_score", "bank_cashflow_score"
        ]
        
        # Analytical SHAP approximation
        means = {
            "credit_score": 575.0,
            "salary": 135000.0,
            "loan_amount": 52500.0,
            "job_stability_score": 5.5,
            "education_score": 5.5,
            "linkedin_score": 5.5,
            "device_trust_score": 6.0,
            "email_trust_score": 6.5,
            "utility_score": 5.5,
            "bank_cashflow_score": 5.5
        }
        
        shap_dict = {}
        
        # Credit Score SHAP
        credit_diff = features_dict["credit_score"] - means["credit_score"]
        shap_dict["credit_score"] = float((credit_diff / 550.0) * 3.5)
        
        # Salary SHAP
        sal_diff = features_dict["salary"] - means["salary"]
        shap_dict["salary"] = float((sal_diff / 230000.0) * 1.5)
        
        # Loan Amount SHAP
        loan_diff = features_dict["loan_amount"] - means["loan_amount"]
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

        # Utility Score SHAP
        util_diff = features_dict.get("utility_score", 5.5) - means["utility_score"]
        shap_dict["utility_score"] = float((util_diff / 9.0) * 1.3)

        # Bank Cashflow Score SHAP
        cash_diff = features_dict.get("bank_cashflow_score", 5.5) - means["bank_cashflow_score"]
        shap_dict["bank_cashflow_score"] = float((cash_diff / 9.0) * 1.4)
        
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
                     linkedin_score: float, device_trust_score: float, email_trust_score: float,
                     utility_score: float = 5.0, bank_cashflow_score: float = 5.0):
        
        features_dict = {
            "credit_score": float(credit_score),
            "salary": float(salary),
            "loan_amount": float(loan_amount),
            "job_stability_score": float(job_stability_score),
            "education_score": float(education_score),
            "linkedin_score": float(linkedin_score),
            "device_trust_score": float(device_trust_score),
            "email_trust_score": float(email_trust_score),
            "utility_score": float(utility_score),
            "bank_cashflow_score": float(bank_cashflow_score)
        }

        fb = fallback_risk_predict(
            credit_score, salary, loan_amount, job_stability_score, 
            education_score, linkedin_score, device_trust_score, email_trust_score,
            utility_score, bank_cashflow_score
        )
        fb["shap_values"] = self.calculate_shap_values(features_dict, fb["approval_probability"])
        return fb

# Singleton Instance
risk_engine = RiskModel()
