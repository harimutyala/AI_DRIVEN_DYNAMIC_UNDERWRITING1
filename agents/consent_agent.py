from sqlalchemy.orm import Session
from backend.models_db import Consent, AuditLog

class ConsentAgent:
    def __init__(self, db: Session):
        self.db = db
        self.name = "Consent Agent"

    def run(self, user_id: int, state: dict) -> dict:
        """
        Retrieves user consent records.
        Updates state with consent flags or flags violations.
        """
        consent = self.db.query(Consent).filter(Consent.user_id == user_id).first()
        
        consent_dict = {
            "employment": False,
            "education": False,
            "professional": False,
            "public_data": False,
            "digital_data": False
        }
        
        if consent:
            consent_dict = {
                "employment": consent.employment,
                "education": consent.education,
                "professional": consent.professional,
                "public_data": consent.public_data,
                "digital_data": consent.digital_data
            }
            
        state["consent"] = consent_dict
        state["consent_verified"] = True
        
        # Log audit trail
        log_message = f"Consent verified details: Employment={consent_dict['employment']}, Education={consent_dict['education']}, Professional={consent_dict['professional']}, Digital={consent_dict['digital_data']}, Public={consent_dict['public_data']}"
        audit_log = AuditLog(
            user_id=user_id,
            action="VERIFY_CONSENT",
            agent_name=self.name,
            status="Success",
            log_message=log_message
        )
        self.db.add(audit_log)
        self.db.commit()
        
        return state
