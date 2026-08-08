import json
from sqlalchemy.orm import Session
from backend.models_db import AlternativeData, AuditLog, User

class DataAgent:
    def __init__(self, db: Session):
        self.db = db
        self.name = "Data Collection Agent"

    def get_mock_linkedin(self, name: str):
        # Default name Rahul or custom from applicant name
        first_name = name.split()[0] if name else "Applicant"
        return {
            "name": first_name,
            "experience": 5,
            "company": "Infosys",
            "skills": 14,
            "profile_verified": True
        }

    def get_mock_employment(self):
        return {
            "company": "Infosys",
            "years": 5,
            "salary": 950000
        }

    def get_mock_education(self, applicant_edu_tier: str):
        # Determine college/cgpa based on UI input or default
        college = "IIT Hyderabad"
        cgpa = 8.7
        degree = "B.Tech"
        
        if applicant_edu_tier == "Postgrad":
            degree = "M.Tech"
            college = "BITS Pilani"
            cgpa = 9.1
        elif applicant_edu_tier == "Doctorate":
            degree = "Ph.D"
            college = "IISc Bangalore"
            cgpa = 9.5
        elif applicant_edu_tier == "Undergrad":
            degree = "B.Sc"
            college = "Osmania University"
            cgpa = 7.2
            
        return {
            "degree": degree,
            "college": college,
            "cgpa": cgpa
        }

    def get_mock_digital(self, is_anomalous=False):
        # If we want to simulate suspicious behavior
        if is_anomalous:
            return {
                "device_age": 14,
                "email_age": 0.2, # brand new email
                "upi_usage": "None",
                "phone_verified": False,
                "vpn_usage": True,
                "multiple_devices": True,
                "disposable_email": True,
                "impossible_login": True
            }
        else:
            return {
                "device_age": 540,
                "email_age": 5.0, # 5 years old
                "upi_usage": "Regular",
                "phone_verified": True,
                "vpn_usage": False,
                "multiple_devices": False,
                "disposable_email": False,
                "impossible_login": False
            }

    def run(self, user_id: int, application_id: int, traditional_data: dict) -> dict:
        """
        Gathers mock alternative data based on the user's consent flags.
        Merges it into state and updates the database.
        """
        # Retrieve consent from parent orchestrator state activation
        # Check database directly if needed
        consent = traditional_data.get("consent", {})
        
        user = self.db.query(User).filter(User.id == user_id).first()
        user_name = user.name if user else "Customer"
        
        # Check if the user applied with an anomalous profile (for testing fraud)
        # We can look at traditional data: e.g., if salary is abnormally high compared to loan amount,
        # or we just randomly assign it to simulate a test case, or check user email (e.g. test_fraud@gmail.com)
        is_anomalous = False
        if user and ("fraud" in user.email.lower() or "anomaly" in user.email.lower()):
            is_anomalous = True
            
        # Collect mock data conditionally based on consents
        linkedin_data = self.get_mock_linkedin(user_name) if consent.get("professional") else None
        employment_data = self.get_mock_employment() if consent.get("employment") else None
        
        edu_tier = traditional_data.get("education", "Undergrad")
        education_data = self.get_mock_education(edu_tier) if consent.get("education") else None
        
        digital_data = self.get_mock_digital(is_anomalous) if consent.get("digital_data") else None
        
        # Save alternative data snapshot to DB
        alt_db = AlternativeData(
            user_id=user_id,
            linkedin_json=json.dumps(linkedin_data) if linkedin_data else None,
            employment_json=json.dumps(employment_data) if employment_data else None,
            education_json=json.dumps(education_data) if education_data else None,
            digital_json=json.dumps(digital_data) if digital_data else None
        )
        
        self.db.add(alt_db)
        self.db.commit()
        
        # Add to state output
        collected_data = {
            "linkedin": linkedin_data,
            "employment_verification": employment_data,
            "education_verification": education_data,
            "digital_behaviour": digital_data
        }
        
        traditional_data["alternative_data"] = collected_data
        
        # Log to audit trail
        consented_keys = [k for k, v in consent.items() if v]
        log_message = f"Collected alternative data sections: {consented_keys}. Saved snapshot id: {alt_db.id}."
        audit_log = AuditLog(
            user_id=user_id,
            action="COLLECT_ALTERNATIVE_DATA",
            agent_name=self.name,
            status="Success",
            log_message=log_message
        )
        
        self.db.add(audit_log)
        self.db.commit()
        
        return traditional_data
