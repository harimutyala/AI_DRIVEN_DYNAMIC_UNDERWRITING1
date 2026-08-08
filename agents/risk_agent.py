import json
from sqlalchemy.orm import Session
from backend.models_db import RiskReport, AuditLog
from models.risk_model import risk_engine

class RiskAgent:
    def __init__(self, db: Session):
        self.db = db
        self.name = "Risk Agent"

    def run(self, user_id: int, application_id: int, state: dict) -> dict:
        """
        Submits engineered features to the XGBoost classifier, 
        evaluates baseline credit risk score and category, and logs reports.
        """
        features = state.get("engineered_features", {})
        
        # Query XGBoost Model / Analytical Risk Engine
        res = risk_engine.predict_risk(
            credit_score=features.get("credit_score", 500),
            salary=features.get("salary", 35000),
            loan_amount=features.get("loan_amount", 10000),
            job_stability_score=features.get("job_stability_score", 5.0),
            education_score=features.get("education_score", 5.0),
            linkedin_score=features.get("linkedin_score", 5.0),
            device_trust_score=features.get("device_trust_score", 5.0),
            email_trust_score=features.get("email_trust_score", 5.0),
            utility_score=features.get("utility_score", 5.0),
            bank_cashflow_score=features.get("bank_cashflow_score", 5.0)
        )
        
        # Save Risk Report to database
        risk_db = RiskReport(
            application_id=application_id,
            base_score=res["credit_score"],
            dynamic_score=res["credit_score"], # Initial dynamic score is standard base
            risk_category=res["risk_category"],
            approved_probability=res["approval_probability"],
            decision=res["decision"],
            explanation_json=json.dumps({
                "shap_values": res["shap_values"],
                "decision": res["decision"]
            })
        )
        
        self.db.add(risk_db)
        self.db.commit()
        
        # Update State
        state["risk_report_id"] = risk_db.id
        state["risk_results"] = {
            "base_score": res["credit_score"],
            "dynamic_score": res["credit_score"],
            "risk_category": res["risk_category"],
            "approved_probability": res["approval_probability"],
            "decision": res["decision"],
            "shap_values": res["shap_values"]
        }
        state["risk_predicted"] = True
        
        # Log Audit Trail
        log_message = f"XGBoost scoring completed. Credit score: {res['credit_score']}, Approval Likelihood: {res['approval_probability']:.2f}, Decision: {res['decision']}."
        audit_log = AuditLog(
            user_id=user_id,
            action="PREDICT_RISK",
            agent_name=self.name,
            status="Success",
            log_message=log_message
        )
        self.db.add(audit_log)
        self.db.commit()
        
        return state
