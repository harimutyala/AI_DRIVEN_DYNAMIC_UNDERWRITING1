from sqlalchemy.orm import Session
from backend.models_db import AuditLog

class FeatureAgent:
    def __init__(self, db: Session):
        self.db = db
        self.name = "Feature Engineering Agent"

    def run(self, user_id: int, state: dict) -> dict:
        """
        Processes traditional loan data and conditionally collected alternative data 
        into finalized numerical scores for the ML models.
        """
        alt_data = state.get("alternative_data", {})
        
        # 1. Base inputs from application
        credit_score = float(state.get("credit_score", 500))
        salary = float(state.get("salary", 30000))
        loan_amount = float(state.get("loan_amount", 10000))
        
        # 2. LinkedIn feature calculations
        linkedin = alt_data.get("linkedin")
        if linkedin:
            experience_years = float(linkedin.get("experience", 0))
            skills_count = float(linkedin.get("skills", 0))
            verified = 1.0 if linkedin.get("profile_verified", False) else 0.0
            
            # LinkedIn score out of 10
            linkedin_score = min(10.0, max(1.0, 
                experience_years * 0.4 + skills_count * 0.15 + verified * 3.0
            ))
        else:
            experience_years = 0.0
            linkedin_score = 3.0 # Neutral baseline score if unconsented

        # 3. Employment stability calculations
        employment_raw = alt_data.get("employment_verification")
        if employment_raw:
            years = float(employment_raw.get("years", 0))
            # company reputational weight (pretend Infosys=8, other=5)
            comp_rank = 8.0 if "infosys" in employment_raw.get("company", "").lower() else 5.0
            
            job_stability_score = min(10.0, max(1.0,
                years * 0.5 + comp_rank * 0.4
            ))
        else:
            # Traditional fallback
            emp_status = state.get("employment", "Salaried")
            job_stability_score = 6.0 if emp_status == "Salaried" else (4.0 if emp_status == "Self-Employed" else 2.0)
            
        # 4. Education score calculations
        education_raw = alt_data.get("education_verification")
        if education_raw:
            cgpa = float(education_raw.get("cgpa", 7.0))
            degree = education_raw.get("degree", "B.Tech")
            college = education_raw.get("college", "Other")
            
            # degree level
            deg_weight = 3.0
            if "ph" in degree.lower() or "doctor" in degree.lower():
                deg_weight = 5.0
            elif "m." in degree.lower() or "master" in degree.lower():
                deg_weight = 4.0
                
            # College tier weight
            tier_weight = 2.0
            if "iit" in college.lower() or "iisc" in college.lower():
                tier_weight = 4.0
            elif "bits" in college.lower():
                tier_weight = 3.0
                
            education_score = min(10.0, max(1.0,
                deg_weight * 1.0 + tier_weight * 0.8 + (cgpa - 5.0) * 0.5
            ))
        else:
            edu_tier = state.get("education", "Undergrad")
            education_score = 6.0 if edu_tier == "Graduate" else (8.0 if edu_tier == "Postgrad" else (9.0 if edu_tier == "Doctorate" else 4.0))

        # 5. Device & Digital behavior trust scores
        digital = alt_data.get("digital_behaviour")
        if digital:
            dev_age = float(digital.get("device_age", 100))
            email_age = float(digital.get("email_age", 1.0))
            phone_ver = 1.0 if digital.get("phone_verified", False) else 0.0
            
            # Device trust and Email trust
            device_trust_score = min(10.0, max(1.0,
                (dev_age / 250.0) + phone_ver * 4.0
            ))
            email_trust_score = min(10.0, max(1.0,
                email_age * 0.6 + 4.0
            ))
            
            # Binary anomaly markers for fraud model
            vpn = 1 if digital.get("vpn_usage", False) else 0
            multiple_devs = 1 if digital.get("multiple_devices", False) else 0
            disp_email = 1 if digital.get("disposable_email", False) else 0
            impl_login = 1 if digital.get("impossible_login", False) else 0
        else:
            device_trust_score = 5.0
            email_trust_score = 5.0
            vpn = 0
            multiple_devs = 0
            disp_email = 0
            impl_login = 0
            dev_age = 180.0
            email_age = 3.0
            phone_ver = 1
            
        features = {
            "credit_score": credit_score,
            "salary": salary,
            "loan_amount": loan_amount,
            "job_stability_score": round(job_stability_score, 2),
            "education_score": round(education_score, 2),
            "linkedin_score": round(linkedin_score, 2),
            "device_trust_score": round(device_trust_score, 2),
            "email_trust_score": round(email_trust_score, 2),
            # Raw fraud model parameters
            "vpn_usage": vpn,
            "multiple_devices": multiple_devs,
            "disposable_email": disp_email,
            "impossible_login": impl_login,
            "phone_verified": phone_ver,
            "device_age_days": dev_age,
            "email_age_years": email_age
        }
        
        state["engineered_features"] = features
        state["features_engineered"] = True
        
        # Log audit trail
        log_message = f"Feature engineering successfully completed. Outputs: Stability={features['job_stability_score']}, Education={features['education_score']}, LinkedIn={features['linkedin_score']}, DeviceTrust={features['device_trust_score']}, EmailTrust={features['email_trust_score']}."
        audit_log = AuditLog(
            user_id=user_id,
            action="ENGINEER_FEATURES",
            agent_name=self.name,
            status="Success",
            log_message=log_message
        )
        self.db.add(audit_log)
        self.db.commit()
        
        return state
