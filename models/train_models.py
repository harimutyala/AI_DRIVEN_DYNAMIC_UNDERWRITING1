import os
import pickle
import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

def generate_mock_data(n_samples=5000):
    np.random.seed(42)
    
    # 1. Base inputs
    credit_score = np.random.randint(300, 850, size=n_samples)
    salary = np.random.randint(20000, 250000, size=n_samples)
    loan_amount = np.random.randint(5000, 100000, size=n_samples)
    
    experience_years = np.random.randint(0, 25, size=n_samples)
    company_stability = np.random.randint(1, 10, size=n_samples) # 1 low, 10 high
    education_level = np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.2, 0.4, 0.25, 0.1, 0.05]) # 1 HS, 5 PhD
    college_tier = np.random.choice([1, 2, 3], size=n_samples, p=[0.15, 0.35, 0.5]) # 1 top, 3 low
    
    device_age_days = np.random.randint(10, 1000, size=n_samples)
    email_age_years = np.random.randint(0, 15, size=n_samples)
    upi_usage = np.random.choice([0, 1, 2], size=n_samples, p=[0.1, 0.3, 0.6]) # 0 None, 2 Regular
    phone_verified = np.random.choice([0, 1], size=n_samples, p=[0.1, 0.9])
    linkedin_skills_count = np.random.randint(0, 50, size=n_samples)
    linkedin_verified = np.random.choice([0, 1], size=n_samples, p=[0.2, 0.8])
    
    # Anomaly/Fraud indicators (for Isolation Forest training)
    # We will inject some anomalies (about 5%)
    vpn_usage = np.random.choice([0, 1], size=n_samples, p=[0.95, 0.05])
    multiple_devices = np.random.choice([0, 1], size=n_samples, p=[0.94, 0.06])
    disposable_email = np.random.choice([0, 1], size=n_samples, p=[0.97, 0.03])
    impossible_login = np.random.choice([0, 1], size=n_samples, p=[0.98, 0.02])
    
    # 2. Engineer Features
    # Job stability score (1-10)
    job_stability = np.clip(experience_years * 0.4 + company_stability * 0.6, 1, 10)
    
    # Education score (1-10)
    education_score = np.clip(education_level * 1.5 + (4 - college_tier) * 1.0, 1, 10)
    
    # LinkedIn score (1-10)
    linkedin_score = np.clip(linkedin_skills_count * 0.15 + experience_years * 0.2 + linkedin_verified * 3.0, 1, 10)
    
    # Device trust score (1-10)
    device_trust = np.clip(device_age_days / 200.0 + phone_verified * 4.0, 1, 10)
    
    # Email trust score (1-10)
    email_trust = np.clip(email_age_years * 0.6 + (1 - disposable_email) * 4.0, 1, 10)
    
    # Risk calculation: Traditional + Alternative scores
    # Prob of default (Higher means riskier, i.e., 1 = risk, 0 = safe)
    # Scale variables for a logical probability formula
    norm_credit = (credit_score - 300) / 550.0  # 0 to 1
    norm_dti = (loan_amount / np.maximum(salary * 5.0, 1.0)) # low is good, high (>1.0) is bad
    
    # Default logit
    logit = (
        - 1.5
        - 4.0 * norm_credit
        - 1.5 * (job_stability / 10.0)
        - 1.0 * (education_score / 10.0)
        - 0.8 * (linkedin_score / 10.0)
        - 0.5 * (device_trust / 10.0)
        + 3.0 * norm_dti
        + 1.5 * vpn_usage
        + 1.5 * impossible_login
    )
    
    prob = 1 / (1 + np.exp(-logit))
    # Add noise
    prob = np.clip(prob + np.random.normal(0, 0.05, size=n_samples), 0, 1)
    
    # Target label: Default/High Risk = 1
    default = (prob > 0.45).astype(int)
    
    # Assembly
    df = pd.DataFrame({
        "credit_score": credit_score,
        "salary": salary,
        "loan_amount": loan_amount,
        "experience_years": experience_years,
        "company_stability": company_stability,
        "education_level": education_level,
        "college_tier": college_tier,
        "device_age_days": device_age_days,
        "email_age_years": email_age_years,
        "upi_usage": upi_usage,
        "phone_verified": phone_verified,
        "linkedin_skills_count": linkedin_skills_count,
        "linkedin_verified": linkedin_verified,
        "vpn_usage": vpn_usage,
        "multiple_devices": multiple_devices,
        "disposable_email": disposable_email,
        "impossible_login": impossible_login,
        # Engineered features
        "job_stability_score": job_stability,
        "education_score": education_score,
        "linkedin_score": linkedin_score,
        "device_trust_score": device_trust,
        "email_trust_score": email_trust,
        "default": default
    })
    return df

def train_and_save():
    print("Generating mock dataset...")
    df = generate_mock_data(n_samples=6000)
    
    # Save dataset
    os.makedirs("datasets", exist_ok=True)
    df.to_csv("datasets/mock_data.csv", index=False)
    print("Saved dataset to datasets/mock_data.csv")
    
    # 1. Train Risk Classifier (XGBoost)
    features_risk = [
        "credit_score", "salary", "loan_amount", 
        "job_stability_score", "education_score", 
        "linkedin_score", "device_trust_score", "email_trust_score"
    ]
    
    X = df[features_risk]
    y = df["default"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost Risk Model...")
    model_risk = XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        random_state=42,
        eval_metric="logloss"
    )
    model_risk.fit(X_train, y_train)
    
    accuracy = model_risk.score(X_test, y_test)
    print(f"XGBoost Model Test Accuracy: {accuracy:.4f}")
    
    # 2. Train Fraud Detector (Isolation Forest)
    # Features representing abnormal behavior
    features_fraud = [
        "vpn_usage", "multiple_devices", "disposable_email", "impossible_login",
        "phone_verified", "device_age_days", "email_age_years"
    ]
    
    X_fraud = df[features_fraud]
    
    print("Training Isolation Forest Fraud Model...")
    # anomaly fraction around 5%
    clf_fraud = IsolationForest(
        n_estimators=100,
        contamination=0.06,
        random_state=42
    )
    clf_fraud.fit(X_fraud)
    
    # Save models
    os.makedirs("models", exist_ok=True)
    with open("models/risk_classifier.pkl", "wb") as f:
        pickle.dump(model_risk, f)
    with open("models/fraud_detector.pkl", "wb") as f:
        pickle.dump(clf_fraud, f)
        
    print("Models trained and saved successfully in 'models/' directory!")

if __name__ == "__main__":
    train_and_save()
