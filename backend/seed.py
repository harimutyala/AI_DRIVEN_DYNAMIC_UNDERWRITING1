import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, Base, engine
from backend.models_db import User, Consent, Application, BehaviourLog
from backend.auth import get_password_hash

def seed_db():
    print("Initializing Database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Check if users already exist
        admin = db.query(User).filter(User.email == "admin@dynamic.com").first()
        if not admin:
            print("Creating Admin User...")
            admin = User(
                name="System Administrator",
                email="admin@dynamic.com",
                password=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            
        customer = db.query(User).filter(User.email == "rahul@dynamic.com").first()
        if not customer:
            print("Creating Customer User Rahul...")
            customer = User(
                name="Rahul Sharma",
                email="rahul@dynamic.com",
                password=get_password_hash("rahul123"),
                role="customer"
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)
            
            # Create Rahul's Consents (default to True for easy demo)
            print("Seeding Rahul's Consent Record...")
            consent = Consent(
                user_id=customer.id,
                employment=True,
                education=True,
                professional=True,
                public_data=True,
                digital_data=True,
                utility_telecom=True,
                bank_cashflow=True
            )
            db.add(consent)
            
            # Create a pending loan application for Rahul
            print("Seeding Rahul's Initial Pending Loan Application...")
            app = Application(
                user_id=customer.id,
                loan_amount=45000.0,
                salary=85000.0,
                credit_score=680,
                employment="Salaried",
                education="Graduate",
                status="Pending"
            )
            db.add(app)
            db.commit()
            
            # Create repayment logs for Dynamic Risk Score demonstration
            print("Seeding Mock Payment/Behaviour Logs...")
            # We add 3 sequential monthly updates
            logs = [
                BehaviourLog(
                    user_id=customer.id,
                    month=1,
                    salary_received=True,
                    repayment_history="On-Time",
                    abnormal_behavior_flag=False,
                    amount_paid=1200.0,
                    event_description="Month 1: Received salary on time, completed payment of $1,200."
                ),
                BehaviourLog(
                    user_id=customer.id,
                    month=2,
                    salary_received=True,
                    repayment_history="On-Time",
                    abnormal_behavior_flag=False,
                    amount_paid=1200.0,
                    event_description="Month 2: Received salary on time, completed payment of $1,200."
                ),
                BehaviourLog(
                    user_id=customer.id,
                    month=3,
                    salary_received=True,
                    repayment_history="Late",
                    abnormal_behavior_flag=False,
                    amount_paid=1200.0,
                    event_description="Month 3: Received salary, payment delayed by 5 days (Late)."
                )
            ]
            for log in logs:
                db.add(log)
            db.commit()
            
        print("Database successfully seeded! Seed Accounts:")
        print(" -> Admin:    admin@dynamic.com / admin123")
        print(" -> Customer: rahul@dynamic.com / rahul123")
        
    except Exception as e:
        print(f"Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
