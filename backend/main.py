import json
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import datetime

from .database import get_db, engine, Base
from .models_db import User, Consent, Application, AlternativeData, RiskReport, FraudReport, BehaviourLog, AuditLog
from .schemas import (
    UserRegister, UserLogin, Token, UserResponse,
    ConsentUpdate, ConsentResponse,
    LoanApply, LoanResponse, LoanUpdate,
    CustomerDashboardStats, AdminDashboardStats
)
from .auth import get_password_hash, verify_password, create_access_token, get_current_user, get_current_admin
from agents.orchestrator import UnderwritingOrchestrator
from models.dynamic_risk import calculate_dynamic_risk
from utils.fairness import run_fairness_audit

# Initialize databases
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-Driven Dynamic Underwriting API", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- AUTHENTICATION -----------------

from sqlalchemy import func

@app.post("/api/auth/register", response_model=UserResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    db_user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = get_password_hash(user_in.password.strip())
    user = User(
        name=user_in.name.strip(),
        email=clean_email,
        password=hashed_pwd,
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Initialize consent record for the new user (default True for instant AI ingestion)
    consent = Consent(
        user_id=user.id,
        employment=True,
        education=True,
        professional=True,
        public_data=True,
        digital_data=True
    )
    db.add(consent)
    db.commit()
    
    # Audit log
    audit_log = AuditLog(
        user_id=user.id,
        action="USER_REGISTRATION",
        agent_name="Auth Module",
        status="Success",
        log_message=f"User {user.name} ({user.email}) registered successfully as {user.role}."
    )
    db.add(audit_log)
    db.commit()
    
    return user

@app.post("/api/auth/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not user or not verify_password(user_in.password.strip(), user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    access_token = create_access_token(data={"sub": user.email})
    
    # Audit log
    audit_log = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        agent_name="Auth Module",
        status="Success",
        log_message=f"User logged in successfully."
    )
    db.add(audit_log)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name,
        "email": user.email
    }


# ----------------- CONSENT MANAGEMENT -----------------

@app.get("/api/consent", response_model=ConsentResponse)
def get_user_consent(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    consent = db.query(Consent).filter(Consent.user_id == current_user.id).first()
    if not consent:
        # Create default empty consent
        consent = Consent(user_id=current_user.id)
        db.add(consent)
        db.commit()
        db.refresh(consent)
    return consent

@app.post("/api/consent", response_model=ConsentResponse)
def update_user_consent(consent_in: ConsentUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    consent = db.query(Consent).filter(Consent.user_id == current_user.id).first()
    if not consent:
        consent = Consent(user_id=current_user.id)
        db.add(consent)
        
    consent.employment = consent_in.employment
    consent.education = consent_in.education
    consent.professional = consent_in.professional
    consent.public_data = consent_in.public_data
    consent.digital_data = consent_in.digital_data
    consent.timestamp = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(consent)
    
    # Log audit
    audit = AuditLog(
        user_id=current_user.id,
        action="UPDATE_CONSENT",
        agent_name="Consent Agent",
        status="Success",
        log_message=f"Consent settings updated by user."
    )
    db.add(audit)
    db.commit()
    
    return consent


# ----------------- LOAN APPLICATIONS -----------------

@app.post("/api/loan/apply", response_model=Dict[str, Any])
def apply_loan(loan_in: LoanApply, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Restrict user to ONE active loan/application at a time
    active_app = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.status.in_(["Pending", "Approved"])
    ).first()
    
    if active_app:
        if active_app.status == "Pending":
            raise HTTPException(
                status_code=400,
                detail=f"You already have a pending loan application (#{active_app.application_id}) under review. Please wait for a decision."
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"You currently have an active loan (#{active_app.application_id}). You must clear/repay your active loan before applying for a new one."
            )
        
    # 1. Save Traditional Application Record
    app_db = Application(
        user_id=current_user.id,
        loan_amount=loan_in.loan_amount,
        salary=loan_in.salary,
        credit_score=loan_in.credit_score,
        employment=loan_in.employment,
        education=loan_in.education,
        status="Pending"
    )
    db.add(app_db)
    db.commit()
    db.refresh(app_db)
    
    # Audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="SUBMIT_LOAN_APPLICATION",
        agent_name="Loan Module",
        status="Success",
        log_message=f"Submitted loan application for ${loan_in.loan_amount:.2f}."
    )
    db.add(audit_log)
    db.commit()
    
    # 2. Trigger AI Agent Underwriting Orchestrator Workflow
    orchestrator = UnderwritingOrchestrator(db)
    try:
        agent_state = orchestrator.run_underwriting(current_user.id, app_db.application_id)
        
        # Read final status
        db.refresh(app_db)
        return {
            "application_id": app_db.application_id,
            "status": app_db.status,
            "agent_state": agent_state
        }
    except Exception as e:
        app_db.status = "Failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"AI Underwriting Orchestration failed: {str(e)}")

@app.post("/api/loan/{application_id}/clear", response_model=LoanResponse)
def clear_loan(application_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app_db = db.query(Application).filter(Application.application_id == application_id).first()
    if not app_db:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if current_user.role != "admin" and app_db.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to clear this application")
        
    old_status = app_db.status
    app_db.status = "Cleared"
    db.commit()
    db.refresh(app_db)
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="CLEAR_LOAN_REPAYMENT",
        agent_name="Loan Module",
        status="Success",
        log_message=f"Loan #{application_id} (${app_db.loan_amount:.2f}) was successfully paid off and cleared."
    )
    db.add(audit_log)
    db.commit()
    
    return app_db

@app.get("/api/loan/{application_id}", response_model=LoanResponse)
def get_loan(application_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app_db = db.query(Application).filter(Application.application_id == application_id).first()
    if not app_db:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # Check permissions
    if current_user.role != "admin" and app_db.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this application")
        
    return app_db

@app.put("/api/loan/{application_id}/status", response_model=LoanResponse)
def update_loan_status(application_id: int, update_in: LoanUpdate, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    app_db = db.query(Application).filter(Application.application_id == application_id).first()
    if not app_db:
        raise HTTPException(status_code=404, detail="Application not found")
        
    old_status = app_db.status
    app_db.status = update_in.status
    db.commit()
    db.refresh(app_db)
    
    # Audit log
    audit_log = AuditLog(
        user_id=current_admin.id,
        action="ADMIN_DECISION_OVERRIDE",
        agent_name="Compliance Agent",
        status="Success",
        log_message=f"Admin modified loan application status from {old_status} to {app_db.status}."
    )
    db.add(audit_log)
    db.commit()
    
    return app_db


# ----------------- UNDERWRITING REPORTS -----------------

@app.get("/api/risk/report/{application_id}")
def get_risk_report(application_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(RiskReport).filter(RiskReport.application_id == application_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Risk report not found for this application")
        
    app_db = db.query(Application).filter(Application.application_id == application_id).first()
    if current_user.role != "admin" and app_db.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    explanation = json.loads(report.explanation_json)
    
    return {
        "id": report.id,
        "application_id": report.application_id,
        "base_score": report.base_score,
        "dynamic_score": report.dynamic_score,
        "risk_category": report.risk_category,
        "approved_probability": report.approved_probability,
        "decision": report.decision,
        "explanation": explanation,
        "timestamp": report.timestamp
    }

@app.get("/api/fraud/report/{application_id}")
def get_fraud_report(application_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(FraudReport).filter(FraudReport.application_id == application_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Fraud report not found for this application")
        
    app_db = db.query(Application).filter(Application.application_id == application_id).first()
    if current_user.role != "admin" and app_db.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    anomalies = json.loads(report.details_json)
    
    return {
        "id": report.id,
        "application_id": report.application_id,
        "fraud_score": report.fraud_score,
        "fraud_probability": report.fraud_probability,
        "fraud_level": report.fraud_level,
        "anomalies": anomalies,
        "timestamp": report.timestamp
    }


# ----------------- DYNAMIC BEHAVIOUR SIMULATOR -----------------

@app.post("/api/behaviour/simulate")
def simulate_behaviour(month: int, salary_received: bool, repayment_history: str, 
                       abnormal_behavior_flag: bool, current_user: User = Depends(get_current_user), 
                       db: Session = Depends(get_db)):
    """
    Module 9: Dynamic Underwriting.
    Simulates new customer events (e.g. Month 1, 2, 3 payment histories)
    and uses the Dynamic Risk Score calculations to shift risk categories in real-time.
    """
    # 1. Fetch active application
    app_db = db.query(Application).filter(
        Application.user_id == current_user.id
    ).order_by(Application.created_at.desc()).first()
    
    if not app_db:
        raise HTTPException(
            status_code=400, 
            detail="You must have submitted a loan application to simulate behaviour history."
        )

    # 2. Add behavioural log
    evt_desc = f"Month {month}: Repayment is {repayment_history}. Salary received: {salary_received}. Anomalous event: {abnormal_behavior_flag}."
    log = BehaviourLog(
        user_id=current_user.id,
        month=month,
        salary_received=salary_received,
        repayment_history=repayment_history,
        abnormal_behavior_flag=abnormal_behavior_flag,
        amount_paid=1500.0,
        event_description=evt_desc
    )
    db.add(log)
    db.commit()
    
    # 3. Pull all behaviour log stats
    all_logs = db.query(BehaviourLog).filter(BehaviourLog.user_id == current_user.id).all()
    
    salary_received_count = sum(1 for l in all_logs if l.salary_received)
    payments_ontime = sum(1 for l in all_logs if l.repayment_history == "On-Time")
    payments_late = sum(1 for l in all_logs if l.repayment_history == "Late")
    payments_missed = sum(1 for l in all_logs if l.repayment_history == "Missed")
    anomalies_count = sum(1 for l in all_logs if l.abnormal_behavior_flag)
    
    # 4. Fetch Base Score
    risk_report = db.query(RiskReport).filter(RiskReport.application_id == app_db.application_id).first()
    if not risk_report:
        raise HTTPException(status_code=404, detail="Risk report details not initialized.")
        
    fraud_report = db.query(FraudReport).filter(FraudReport.application_id == app_db.application_id).first()
    fraud_level = fraud_report.fraud_level if fraud_report else "Low"
    
    # 5. Compute Dynamic Adjustments
    adj = calculate_dynamic_risk(
        base_score=risk_report.base_score,
        salary_received_count=salary_received_count,
        payments_ontime_count=payments_ontime,
        payments_late_count=payments_late,
        payments_missed_count=payments_missed,
        fraud_level=fraud_level,
        anomalies_count=anomalies_count
    )
    
    # 6. Save new dynamic score inside Risk Report
    risk_report.dynamic_score = adj["dynamic_score"]
    risk_report.risk_category = adj["risk_category"]
    db.commit()
    
    # 7. Audit Compliance change
    audit = AuditLog(
        user_id=current_user.id,
        action="DYNAMIC_RISK_ADJUST",
        agent_name="Dynamic Risk Engine",
        status="Success" if adj["dynamic_score"] >= 600 else "Warning",
        log_message=f"Dynamic risk score modified. Old Score: {adj['base_score']}, New Score: {adj['dynamic_score']}. Adjustments: Repayments={adj['payment_adjustment']}pts, Salary={adj['behaviour_adjustment']}pts, Fraud/Anomaly={adj['fraud_adjustment']}pts."
    )
    db.add(audit)
    db.commit()
    
    return adj


# ----------------- DASHBOARD ENDPOINTS -----------------

@app.get("/api/dashboard", response_model=Dict[str, Any])
def get_dashboard_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Module 12 & 13: Dashboards.
    Returns custom tailored statistics depending on the role.
    """
    if current_user.role == "admin":
        # ADMIN VIEW
        apps = db.query(Application).all()
        total_apps = len(apps)
        approved = sum(1 for a in apps if a.status == "Approved")
        rejected = sum(1 for a in apps if a.status == "Rejected")
        pending = sum(1 for a in apps if a.status == "Pending")
        cleared = sum(1 for a in apps if a.status == "Cleared")
        
        avg_loan = sum(a.loan_amount for a in apps) / max(total_apps, 1)
        
        # Average risk score
        risk_reports = db.query(RiskReport).all()
        avg_risk = sum(r.dynamic_score for r in risk_reports) / max(len(risk_reports), 1) if risk_reports else 600
        
        # High fraud risks
        fraud_reports = db.query(FraudReport).filter(FraudReport.fraud_level == "High").all()
        high_fraud = len(fraud_reports)
        
        # Recent applications summary
        recent_apps_summary = []
        for a in db.query(Application).order_by(Application.created_at.desc()).limit(15).all():
            u = db.query(User).filter(User.id == a.user_id).first()
            r_rep = db.query(RiskReport).filter(RiskReport.application_id == a.application_id).first()
            f_rep = db.query(FraudReport).filter(FraudReport.application_id == a.application_id).first()
            
            recent_apps_summary.append({
                "application_id": a.application_id,
                "user_name": u.name if u else "Unknown",
                "email": u.email if u else "",
                "loan_amount": a.loan_amount,
                "salary": a.salary,
                "credit_score": a.credit_score,
                "dynamic_score": r_rep.dynamic_score if r_rep else a.credit_score,
                "risk_category": r_rep.risk_category if r_rep else "Unknown",
                "fraud_level": f_rep.fraud_level if f_rep else "Unknown",
                "status": a.status,
                "created_at": a.created_at
            })
            
        # Overall compliance and bias metrics summary (for admin analytics chart)
        probabilities = [r.approved_probability for r in risk_reports] if risk_reports else []
        fairness_stats = run_fairness_audit(probabilities, [a.salary for a in apps], [a.loan_amount for a in apps])
            
        return {
            "role": "admin",
            "stats": {
                "total_applications": total_apps,
                "approved_count": approved,
                "rejected_count": rejected,
                "pending_count": pending,
                "cleared_count": cleared,
                "average_loan_amount": avg_loan,
                "average_risk_score": avg_risk,
                "high_fraud_risk_count": high_fraud
            },
            "recent_applications": recent_apps_summary,
            "fairness_audit": fairness_stats
        }
        
    else:
        # CUSTOMER VIEW
        # First query for an active application (Pending or Approved)
        active_app = db.query(Application).filter(
            Application.user_id == current_user.id,
            Application.status.in_(["Pending", "Approved"])
        ).order_by(Application.created_at.desc()).first()
        
        if active_app:
            app_db = active_app
        else:
            # Fallback to the latest application (Cleared or Rejected)
            app_db = db.query(Application).filter(Application.user_id == current_user.id).order_by(Application.created_at.desc()).first()
            
        has_active_loan = bool(app_db and app_db.status in ["Pending", "Approved"])
        can_apply = not has_active_loan

        consent = db.query(Consent).filter(Consent.user_id == current_user.id).first()
        alt_data_db = db.query(AlternativeData).filter(AlternativeData.user_id == current_user.id).order_by(AlternativeData.timestamp.desc()).first()
        
        risk_rep = None
        fraud_rep = None
        explanation = None
        alt_data_collected = None
        
        if app_db:
            risk_rep_db = db.query(RiskReport).filter(RiskReport.application_id == app_db.application_id).first()
            if risk_rep_db:
                explanation_data = json.loads(risk_rep_db.explanation_json)
                risk_rep = {
                    "id": risk_rep_db.id,
                    "application_id": risk_rep_db.application_id,
                    "base_score": risk_rep_db.base_score,
                    "dynamic_score": risk_rep_db.dynamic_score,
                    "risk_category": risk_rep_db.risk_category,
                    "approved_probability": risk_rep_db.approved_probability,
                    "decision": risk_rep_db.decision,
                    "timestamp": risk_rep_db.timestamp
                }
                explanation = {
                    "decision": risk_rep_db.decision,
                    "narrative": explanation_data.get("narrative", "Assessing profile..."),
                    "positive_attributions": explanation_data.get("positive_attributions", []),
                    "negative_attributions": explanation_data.get("negative_attributions", []),
                    "shap_values": explanation_data.get("shap_values", {})
                }
                
            fraud_rep_db = db.query(FraudReport).filter(FraudReport.application_id == app_db.application_id).first()
            if fraud_rep_db:
                fraud_rep = {
                    "id": fraud_rep_db.id,
                    "application_id": fraud_rep_db.application_id,
                    "fraud_score": fraud_rep_db.fraud_score,
                    "fraud_probability": fraud_rep_db.fraud_probability,
                    "fraud_level": fraud_rep_db.fraud_level,
                    "anomalies": json.loads(fraud_rep_db.details_json),
                    "timestamp": fraud_rep_db.timestamp
                }
                
        if alt_data_db:
            alt_data_collected = {
                "linkedin": json.loads(alt_data_db.linkedin_json) if alt_data_db.linkedin_json else None,
                "employment": json.loads(alt_data_db.employment_json) if alt_data_db.employment_json else None,
                "education": json.loads(alt_data_db.education_json) if alt_data_db.education_json else None,
                "digital": json.loads(alt_data_db.digital_json) if alt_data_db.digital_json else None,
                "utility_telecom": json.loads(alt_data_db.utility_json) if hasattr(alt_data_db, 'utility_json') and alt_data_db.utility_json else None,
                "bank_cashflow": json.loads(alt_data_db.cashflow_json) if hasattr(alt_data_db, 'cashflow_json') and alt_data_db.cashflow_json else None,
                "timestamp": alt_data_db.timestamp
            }
            
        logs_db = db.query(BehaviourLog).filter(BehaviourLog.user_id == current_user.id).order_by(BehaviourLog.month.asc()).all()
        audit_logs_db = db.query(AuditLog).filter(AuditLog.user_id == current_user.id).order_by(AuditLog.timestamp.desc()).all()

        serializable_behaviour_logs = [{
            "id": log.id,
            "user_id": log.user_id,
            "month": log.month,
            "salary_received": log.salary_received,
            "repayment_history": log.repayment_history,
            "abnormal_behavior_flag": log.abnormal_behavior_flag,
            "amount_paid": log.amount_paid,
            "event_description": log.event_description,
            "timestamp": log.timestamp,
        } for log in logs_db]

        serializable_audit_logs = [{
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "agent_name": log.agent_name,
            "status": log.status,
            "log_message": log.log_message,
            "timestamp": log.timestamp,
        } for log in audit_logs_db]
        
        # Build dynamic score history chart data
        dynamic_history = []
        if risk_rep:
            # Point 0 is baseline
            dynamic_history.append({"name": "Base Score", "score": risk_rep["base_score"]})
            running_score = risk_rep["base_score"]
            for l in logs_db:
                # Mock running scores for chart visualization based on monthly events
                salary_term = 15 if l.salary_received else 0
                pay_term = 20 if l.repayment_history == "On-Time" else (-30 if l.repayment_history == "Late" else -70)
                anomaly_term = -20 if l.abnormal_behavior_flag else 0
                running_score = max(300, min(850, running_score + salary_term + pay_term + anomaly_term))
                dynamic_history.append({"name": f"Month {l.month}", "score": running_score})
        
        app_details = None
        if app_db:
            app_details = {
                "application_id": app_db.application_id,
                "user_id": app_db.user_id,
                "loan_amount": app_db.loan_amount,
                "salary": app_db.salary,
                "credit_score": app_db.credit_score,
                "employment": app_db.employment,
                "education": app_db.education,
                "status": app_db.status,
                "created_at": app_db.created_at
            }

        consent_details = None
        if consent:
            consent_details = {
                "user_id": consent.user_id,
                "employment": consent.employment,
                "education": consent.education,
                "professional": consent.professional,
                "public_data": consent.public_data,
                "digital_data": consent.digital_data,
                "timestamp": consent.timestamp
            }

        return {
            "role": "customer",
            "user_name": current_user.name,
            "email": current_user.email,
            "loan_status": app_db.status if app_db else "NoApplication",
            "has_active_loan": has_active_loan,
            "can_apply": can_apply,
            "loan_details": app_details,
            "risk_report": risk_rep,
            "fraud_report": fraud_rep,
            "explanation": explanation,
            "consent": consent_details,
            "alternative_data_collected": alt_data_collected,
            "dynamic_history": dynamic_history,
            "behaviour_logs": serializable_behaviour_logs,
            "audit_logs": serializable_audit_logs
        }


# ----------------- PRODUCTION STATIC FILE SERVING -----------------
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

dist_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(dist_path):
    assets_path = os.path.join(dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        index_file = os.path.join(dist_path, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index.html not found")
