from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="customer") # "customer" or "admin"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    applications = relationship("Application", back_populates="user")
    consent = relationship("Consent", uselist=False, back_populates="user")
    alternative_data = relationship("AlternativeData", back_populates="user")
    behaviour_logs = relationship("BehaviourLog", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Consent(Base):
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    employment = Column(Boolean, default=False)
    education = Column(Boolean, default=False)
    professional = Column(Boolean, default=False)
    public_data = Column(Boolean, default=False)
    digital_data = Column(Boolean, default=False)
    utility_telecom = Column(Boolean, default=False)
    bank_cashflow = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="consent")

class Application(Base):
    __tablename__ = "applications"

    application_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    loan_amount = Column(Float, nullable=False)
    salary = Column(Float, nullable=False)
    credit_score = Column(Integer, nullable=False)
    employment = Column(String, nullable=False) # e.g. "Self-Employed", "Salaried"
    education = Column(String, nullable=False)   # e.g. "Graduate", "Undergraduate"
    status = Column(String, default="Pending") # "Pending", "Approved", "Rejected"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="applications")
    risk_report = relationship("RiskReport", uselist=False, back_populates="application")
    fraud_report = relationship("FraudReport", uselist=False, back_populates="application")

class AlternativeData(Base):
    __tablename__ = "alternative_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    linkedin_json = Column(Text, nullable=True) # LinkedIn Mock Profile
    employment_json = Column(Text, nullable=True) # Employment verification profile
    education_json = Column(Text, nullable=True) # Education profile
    digital_json = Column(Text, nullable=True) # Digital behaviour metrics
    utility_json = Column(Text, nullable=True) # Utility & telecom bill metrics
    cashflow_json = Column(Text, nullable=True) # Bank cashflow metrics
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="alternative_data")

class RiskReport(Base):
    __tablename__ = "risk_reports"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.application_id"), unique=True)
    base_score = Column(Integer, nullable=False)
    dynamic_score = Column(Integer, nullable=False)
    risk_category = Column(String, nullable=False) # "Low", "Medium", "High"
    approved_probability = Column(Float, nullable=False)
    decision = Column(String, nullable=False) # "Approved", "Rejected"
    explanation_json = Column(Text, nullable=False) # SHAP values and text summary
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    application = relationship("Application", back_populates="risk_report")

class FraudReport(Base):
    __tablename__ = "fraud_reports"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.application_id"), unique=True)
    fraud_score = Column(Float, nullable=False)
    fraud_probability = Column(Float, nullable=False)
    fraud_level = Column(String, nullable=False) # "Low", "Medium", "High"
    details_json = Column(Text, nullable=False) # Reasons
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    application = relationship("Application", back_populates="fraud_report")

class BehaviourLog(Base):
    __tablename__ = "behaviour_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    month = Column(Integer, nullable=False)
    salary_received = Column(Boolean, default=True)
    repayment_history = Column(String, default="On-Time") # "On-Time", "Late", "Missed"
    abnormal_behavior_flag = Column(Boolean, default=False)
    amount_paid = Column(Float, nullable=True)
    event_description = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="behaviour_logs")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String, nullable=False)
    agent_name = Column(String, nullable=False) # e.g. "Consent Agent", "Compliance Agent"
    status = Column(String, nullable=False) # "Success", "Warning", "Failure"
    log_message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
