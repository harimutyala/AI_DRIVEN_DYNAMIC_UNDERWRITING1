from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Authentication Schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "customer" # "customer" or "admin"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    email: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

# Consent Schemas
class ConsentUpdate(BaseModel):
    employment: bool = False
    education: bool = False
    professional: bool = False
    public_data: bool = False
    digital_data: bool = False

class ConsentResponse(BaseModel):
    user_id: int
    employment: bool
    education: bool
    professional: bool
    public_data: bool
    digital_data: bool
    timestamp: datetime
    class Config:
        from_attributes = True

# Loan Application Schemas
class LoanApply(BaseModel):
    loan_amount: float = Field(..., gt=0)
    salary: float = Field(..., gt=0)
    credit_score: int = Field(..., ge=300, le=850)
    employment: str = Field(..., description="e.g. Salaried, Self-Employed, Unemployed")
    education: str = Field(..., description="e.g. Undergrad, Graduate, Postgrad, Doctorate")

class LoanResponse(BaseModel):
    application_id: int
    user_id: int
    loan_amount: float
    salary: float
    credit_score: int
    employment: str
    education: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class LoanUpdate(BaseModel):
    status: str = Field(..., pattern="^(Approved|Rejected|Pending)$")

# Audit Schema
class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    agent_name: str
    status: str
    log_message: str
    timestamp: datetime
    class Config:
        from_attributes = True

# Behaviour Log Schema
class BehaviourLogResponse(BaseModel):
    id: int
    user_id: int
    month: int
    salary_received: bool
    repayment_history: str
    abnormal_behavior_flag: bool
    amount_paid: Optional[float] = None
    event_description: Optional[str] = None
    timestamp: datetime
    class Config:
        from_attributes = True

# Underwriting Reports
class RiskReportResponse(BaseModel):
    id: int
    application_id: int
    base_score: int
    dynamic_score: int
    risk_category: str
    approved_probability: float
    decision: str
    explanation_json: str
    timestamp: datetime
    class Config:
        from_attributes = True

class FraudReportResponse(BaseModel):
    id: int
    application_id: int
    fraud_score: float
    fraud_probability: float
    fraud_level: str
    details_json: str
    timestamp: datetime
    class Config:
        from_attributes = True

# Dashboard Response Schemas
class CustomerDashboardStats(BaseModel):
    loan_status: str
    loan_details: Optional[LoanResponse] = None
    risk_report: Optional[RiskReportResponse] = None
    fraud_report: Optional[FraudReportResponse] = None
    consent: Optional[ConsentResponse] = None
    alternative_data_collected: Optional[Dict[str, Any]] = None
    dynamic_history: List[Dict[str, Any]] = []
    behaviour_logs: List[BehaviourLogResponse] = []
    audit_logs: List[AuditLogResponse] = []

class AdminDashboardStats(BaseModel):
    total_applications: int
    approved_count: int
    rejected_count: int
    pending_count: int
    average_loan_amount: float
    average_risk_score: float
    high_fraud_risk_count: int
    recent_applications: List[Dict[str, Any]] = []
