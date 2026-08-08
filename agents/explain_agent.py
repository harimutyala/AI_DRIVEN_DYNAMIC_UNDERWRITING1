from sqlalchemy.orm import Session
from backend.models_db import AuditLog

class ExplainAgent:
    def __init__(self, db: Session):
        self.db = db
        self.name = "Explainability Agent"

    def run(self, user_id: int, state: dict) -> dict:
        """
        Reads SHAP values and interprets them.
        Generates a human-readable list of positive and negative factors
        along with a plain English text narrative.
        """
        risk_res = state.get("risk_results", {})
        fraud_res = state.get("fraud_results", {})
        shap_vals = risk_res.get("shap_values", {})
        decision = risk_res.get("decision", "Reject")
        
        # Translate feature names for display
        feature_labels = {
            "credit_score": "Traditional credit score history",
            "salary": "Declared income level",
            "loan_amount": "Requested loan amount",
            "job_stability_score": "LinkedIn professional tenure and job longevity",
            "education_score": "College pedigree and academic performance",
            "linkedin_score": "LinkedIn profile integrity and verified skills",
            "device_trust_score": "Device metadata fingerprint and verification",
            "email_trust_score": "Email account creation history",
            "utility_score": "Utility & telecom bill payment compliance history",
            "bank_cashflow_score": "Bank account cashflow stability & average balance"
        }
        
        # Classify shap values into positive impacts and negative impacts on approval
        positive_factors = []
        negative_factors = []
        
        for feat, val in shap_vals.items():
            display_name = feature_labels.get(feat, feat)
            if val > 0.02: # Meaningful positive influence on approval
                positive_factors.append((display_name, val))
            elif val < -0.02: # Meaningful negative influence on approval
                negative_factors.append((display_name, val))
                
        # Sort factors by magnitude
        positive_factors.sort(key=lambda x: x[1], reverse=True)
        negative_factors.sort(key=lambda x: x[1])
        
        # Check if CIBIL compensation boost helped approve loan
        cibil_score = state.get("engineered_features", {}).get("credit_score", 500)
        
        # Construct plain text summary
        reasons = []
        if decision == "Approve":
            if cibil_score < 620:
                intro = "Loan Approved via Alternative Data Compensation! Although your traditional CIBIL credit score is limited, your consented alternative data provided a decisive score boost. Key drivers: "
            else:
                intro = "Congratulations! Your loan application has been approved based on a healthy credit risk profile. Key positive elements include: "
            
            # Add up to 3 positive items
            for item, _ in positive_factors[:3]:
                reasons.append(item)
            if fraud_res.get("fraud_level") == "Low":
                reasons.append("Secure verification details (Low Fraud Risk)")
            intro += ", ".join(reasons) + "."
            if negative_factors and cibil_score >= 620:
                intro += f" We noted slight negative impact from: {negative_factors[0][0]}, but it was offset by other parameters."
        else:
            intro = "Unfortunately, we are unable to approve your application at this time. The primary limiting factors were: "
            for item, _ in negative_factors[:3]:
                reasons.append(item)
            if fraud_res.get("fraud_level") in ["High", "Medium"]:
                reasons.append(f"Suspicious account activity flags ({fraud_res.get('fraud_level')} Fraud Risk)")
            intro += ". Tip: Granting additional Alternative Data Consents (such as Utility Bills and Bank Cashflow) can boost your score by up to +160 points!"
            
        explanation = {
            "decision": decision,
            "narrative": intro,
            "positive_attributions": [item[0] for item in positive_factors],
            "negative_attributions": [item[0] for item in negative_factors]
        }
        
        state["explanation"] = explanation
        state["explained"] = True
        
        # Log Audit Trail
        log_message = f"Explainability report generated. Decision: {decision}. Summary: {intro[:100]}..."
        audit_log = AuditLog(
            user_id=user_id,
            action="GENERATE_EXPLANATION",
            agent_name=self.name,
            status="Success",
            log_message=log_message
        )
        self.db.add(audit_log)
        self.db.commit()
        
        return state
