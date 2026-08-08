from sqlalchemy.orm import Session
from backend.models_db import Application, AuditLog
from .consent_agent import ConsentAgent
from .data_agent import DataAgent
from .feature_agent import FeatureAgent
from .fraud_agent import FraudAgent
from .risk_agent import RiskAgent
from .explain_agent import ExplainAgent
from .compliance_agent import ComplianceAgent

class UnderwritingOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        self.consent_agent = ConsentAgent(db)
        self.data_agent = DataAgent(db)
        self.feature_agent = FeatureAgent(db)
        self.fraud_agent = FraudAgent(db)
        self.risk_agent = RiskAgent(db)
        self.explain_agent = ExplainAgent(db)
        self.compliance_agent = ComplianceAgent(db)

    def run_underwriting(self, user_id: int, application_id: int) -> dict:
        """
        Runs the full multi-agent underwriting workflow sequentially.
        Updates model outputs and changes application status.
        """
        # Fetch traditional loan application
        app = self.db.query(Application).filter(Application.application_id == application_id).first()
        if not app:
            raise ValueError(f"Application id {application_id} not found")

        # Initial workflow state
        state = {
            "user_id": user_id,
            "application_id": application_id,
            "loan_amount": app.loan_amount,
            "salary": app.salary,
            "credit_score": app.credit_score,
            "employment": app.employment,
            "education": app.education,
            "status": app.status,
            
            # Agents progress trackers
            "consent_verified": False,
            "data_collected": False,
            "features_engineered": False,
            "fraud_checked": False,
            "risk_predicted": False,
            "explained": False,
            "compliance_checked": False
        }

        # Step 1: Consent Agent Checks Permissions
        state = self.consent_agent.run(user_id, state)
        
        # Step 2: Data Collection Agent Extracts Mock Profiles
        state = self.data_agent.run(user_id, application_id, state)
        
        # Step 3: Feature Engineering Agent Evaluates Scores
        state = self.feature_agent.run(user_id, state)
        
        # Step 4: Fraud Agent Audits Digital Footprint (Isolation Forest)
        state = self.fraud_agent.run(user_id, application_id, state)
        
        # Step 5: Risk Agent Scores the Vector (XGBoost)
        state = self.risk_agent.run(user_id, application_id, state)
        
        # Step 6: Explainability Agent Interprets SHAP Values
        state = self.explain_agent.run(user_id, state)
        
        # Step 7: Compliance Agent Audits Decision & Fairness
        state = self.compliance_agent.run(user_id, state)
        
        # Final Decision Ingestion
        decision = state["risk_results"]["decision"] # "Approve" or "Reject"
        compliance_failed = state["compliance_results"]["status"] == "Failed"
        fraud_high = state["fraud_results"]["fraud_level"] == "High"
        
        final_status = "Approved"
        if decision == "Reject" or compliance_failed or fraud_high:
            final_status = "Rejected"
            
        # Update Application DB Status
        app.status = final_status
        self.db.commit()
        
        # Audit overall agent workflow completion
        workflow_log = f"Underwriting completed. Base Risk Decision: {decision}, Fraud Risk: {state['fraud_results']['fraud_level']}, Compliance Status: {state['compliance_results']['status']}. Final status assigned: {final_status}."
        audit_log = AuditLog(
            user_id=user_id,
            action="RUN_WORKFLOW_COMPLETE",
            agent_name="Agent Orchestrator",
            status="Success" if final_status == "Approved" else "Warning",
            log_message=workflow_log
        )
        self.db.add(audit_log)
        self.db.commit()
        
        state["final_status"] = final_status
        return state
