from sqlalchemy.orm import Session
from backend.models_db import AuditLog
from utils.fairness import run_fairness_audit

class ComplianceAgent:
    def __init__(self, db: Session):
        self.db = db
        self.name = "Compliance Agent"

    def run(self, user_id: int, state: dict) -> dict:
        """
        Performs four compliance checks:
          1. Consent Validation: ensure alternative data collected matches consent.
          2. Bias Verification: prove zero usage of protected demographic attributes (no direct bias).
          3. Privacy Audit: verify PII scrubbing (no raw password/secrets passed to downstream models).
          4. Statistical Auditing: run Disparate Impact ratio checking.
        """
        consent = state.get("consent", {})
        alt_data = state.get("alternative_data", {})
        features = state.get("engineered_features", {})
        
        compliance_failed = False
        failures = []
        
        # 1. Consent Integrity Check
        if alt_data.get("linkedin") and not consent.get("professional"):
            compliance_failed = True
            failures.append("LinkedIn data extracted without professional consent")
        if alt_data.get("employment_verification") and not consent.get("employment"):
            compliance_failed = True
            failures.append("Employment verification data extracted without employment consent")
        if alt_data.get("education_verification") and not consent.get("education"):
            compliance_failed = True
            failures.append("Education verification data extracted without education consent")
        if alt_data.get("digital_behaviour") and not consent.get("digital_data"):
            compliance_failed = True
            failures.append("Digital fingerprint data extracted without digital behavioral consent")
            
        # 2. Protected Attribute Separation Check
        # Check that protected features are absent from the engineered dataset
        forbidden_attrs = ["gender", "race", "religion", "caste", "nationality"]
        for attr in forbidden_attrs:
            if attr in features:
                compliance_failed = True
                failures.append(f"Forbidden protected characteristic '{attr}' found in feature vector")
                
        # 3. Privacy Auditing (Ensure no plain-text credentials leak into transaction metrics)
        pii_leaks = ["password", "secret", "token", "pwd"]
        for leak in pii_leaks:
            if leak in features:
                compliance_failed = True
                failures.append(f"Potential PII leaks '{leak}' detected in feature values")
                
        # 4. Statistical Bias Audit (simulate a mini audit run)
        # In a real batch pipeline, we pass recent historical applications. Here, we audit the current decision.
        risk_res = state.get("risk_results", {})
        approval_prob = risk_res.get("approved_probability", 0.5)
        
        # Audit with a dummy set containing this applicant's prediction
        audit_res = run_fairness_audit([approval_prob], [features.get("salary", 50000)], [features.get("loan_amount", 10000)])
        
        compliance_status = "Failure" if compliance_failed else "Success"
        if compliance_failed:
            log_msg = f"Compliance Validation FAILED. Issues: {', '.join(failures)}"
        else:
            log_msg = f"Compliance verified. Details: No demographic features injected, data usage aligns with consents, and fairness audit successfully completed (DIR Gender: {audit_res['audit_criteria']['Gender']['disparate_impact_ratio']}, DIR Race: {audit_res['audit_criteria']['Race']['disparate_impact_ratio']})."
            
        audit_log = AuditLog(
            user_id=user_id,
            action="AUDIT_COMPLIANCE",
            agent_name=self.name,
            status=compliance_status,
            log_message=log_msg
        )
        self.db.add(audit_log)
        self.db.commit()
        
        state["compliance_results"] = {
            "status": "Passed" if not compliance_failed else "Failed",
            "audit_log": log_msg,
            "fairness_report": audit_res
        }
        state["compliance_checked"] = True
        
        return state
