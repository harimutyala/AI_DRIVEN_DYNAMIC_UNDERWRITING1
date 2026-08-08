import json
from sqlalchemy.orm import Session
from backend.models_db import FraudReport, AuditLog
from models.fraud_model import fraud_engine

class FraudAgent:
    def __init__(self, db: Session):
        self.db = db
        self.name = "Fraud Agent"

    def run(self, user_id: int, application_id: int, state: dict) -> dict:
        """
        Runs the Isolation Forest anomaly detector on the digital behaviour metrics.
        Saves the resulting FraudReport to the database and logs status.
        """
        features = state.get("engineered_features", {})
        
        # Call Isolation Forest singleton engine
        res = fraud_engine.check_fraud(
            vpn_usage=features.get("vpn_usage", 0),
            multiple_devices=features.get("multiple_devices", 0),
            disposable_email=features.get("disposable_email", 0),
            impossible_login=features.get("impossible_login", 0),
            phone_verified=features.get("phone_verified", 1),
            device_age_days=features.get("device_age_days", 180),
            email_age_years=features.get("email_age_years", 3.0)
        )
        
        # Save Fraud Report to DB
        fraud_db = FraudReport(
            application_id=application_id,
            fraud_score=res["fraud_score"],
            fraud_probability=res["fraud_probability"],
            fraud_level=res["fraud_level"],
            details_json=json.dumps(res["anomalies"])
        )
        
        self.db.add(fraud_db)
        self.db.commit()
        
        # Update State
        state["fraud_report_id"] = fraud_db.id
        state["fraud_results"] = {
            "fraud_score": res["fraud_score"],
            "fraud_probability": res["fraud_probability"],
            "fraud_level": res["fraud_level"],
            "anomalies": res["anomalies"]
        }
        state["fraud_checked"] = True
        
        # Log Audit Trail
        status = "Success" if res["fraud_level"] == "Low" else "Warning"
        log_message = f"Fraud detection complete. Fraud level: {res['fraud_level']}. Anomalies found: {res['anomalies']}."
        audit_log = AuditLog(
            user_id=user_id,
            action="CHECK_FRAUD",
            agent_name=self.name,
            status=status,
            log_message=log_message
        )
        
        self.db.add(audit_log)
        self.db.commit()
        
        return state
