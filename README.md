*****DEPLOYEMENT LINKE: https://dynamic-underwriting-engine.onrender.com/


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

# 🏦 AI-Driven Dynamic Underwriting Using Alternative Data

> **An Explainable AI-powered underwriting platform that leverages customer-consented alternative data to generate dynamic risk scores, detect fraud, ensure fairness, and provide transparent loan decisions.**

---

# 📌 Problem Statement

Traditional loan underwriting relies heavily on credit bureau scores and financial history. This approach often excludes first-time borrowers, young professionals, freelancers, and individuals with limited credit history despite their financial reliability.

Our solution introduces an **AI-powered Dynamic Underwriting Engine** that combines traditional financial information with customer-consented alternative data to make smarter, fairer, and more transparent lending decisions.

---

# 🎯 Project Objective

Build an intelligent underwriting system capable of:

* Predicting customer loan risk using alternative data.
* Continuously updating customer risk profiles.
* Detecting fraud and anomalous behaviour.
* Explaining every lending decision in plain language.
* Maintaining fairness, privacy, and regulatory compliance.

---

# 🚀 Key Features

### ✅ Dynamic Risk Scoring

Generate an AI-based risk score using both traditional and alternative customer information.

---

### 🔍 Alternative Data Analysis

Analyze customer-consented data such as:

* Employment Stability
* Education History
* Professional Profile
* Digital Behaviour
* Public Information
* Traditional Credit Score

---

### 🤖 AI Multi-Agent Architecture

The system uses specialized AI agents instead of one large AI model.

Agents include:

* Consent Agent
* Data Collection Agent
* Feature Engineering Agent
* Risk Prediction Agent
* Fraud Detection Agent
* Explainability Agent
* Compliance Agent

---

### 🛡 Fraud Detection

Detect suspicious applications using anomaly detection.

Examples include:

* Fake profiles
* Multiple device usage
* Disposable email addresses
* Unusual application patterns
* Suspicious behavioural signals

---

### 💡 Explainable AI

Every loan decision includes a human-readable explanation.

Example:

> **Loan Approved**
>
> * Stable employment history
> * Verified professional profile
> * Low fraud probability
> * Good repayment potential

---

### ⚖ Fairness & Compliance

The model avoids using protected attributes such as:

* Religion
* Gender
* Caste
* Race
* Political Views

The platform also includes fairness checks and bias reporting.

---

# 🏗 System Architecture

```text
                         React Frontend

                               │

                          FastAPI Backend

                               │

                     Authentication Module

                               │

                    Consent Management Module

                               │

                      AI Agent Orchestrator

                               │

 ┌────────────┬────────────┬─────────────┬────────────┐

 Consent      Data         Risk         Fraud

 Agent        Agent        Agent        Agent

 └────────────┴────────────┴─────────────┴────────────┘

                               │

                     Feature Engineering

                               │

                     Machine Learning Model

                               │

                    Explainability Engine

                               │

                    Dynamic Risk Engine

                               │

                        PostgreSQL Database
```

---

# 🧠 AI Workflow

```text
Customer Loan Application

↓

Consent Verification

↓

Alternative Data Collection

↓

Feature Engineering

↓

Fraud Detection

↓

Risk Prediction

↓

Explainability Generation

↓

Compliance Verification

↓

Dynamic Risk Score

↓

Loan Recommendation
```

---

# 📂 Project Structure

```text
dynamic-underwriting/

│

├── frontend/

│

├── backend/

│

├── agents/

│

├── models/

│

├── database/

│

├── datasets/

│

├── utils/

│

├── docs/

│

└── README.md
```

---

# 🛠 Technology Stack

## Frontend

* React.js
* Tailwind CSS
* React Router
* Axios
* Recharts

---

## Backend

* FastAPI
* Python

---

## Machine Learning

* Scikit-Learn
* XGBoost
* SHAP
* Isolation Forest

---

## Database

* PostgreSQL

---

## Authentication

* JWT Authentication

---

## AI Framework

* LangGraph

---

# 📊 Machine Learning Pipeline

```text
Alternative Data

↓

Data Cleaning

↓

Feature Engineering

↓

Feature Selection

↓

Risk Prediction Model (XGBoost)

↓

Fraud Detection (Isolation Forest)

↓

SHAP Explainability

↓

Dynamic Risk Score
```

---

# 🧩 Modules

* Authentication
* Consent Management
* Loan Application
* Alternative Data Collection
* Feature Engineering
* Risk Prediction
* Fraud Detection
* Explainable AI
* Dynamic Risk Engine
* AI Agent Orchestration
* Customer Dashboard
* Admin Dashboard
* Fairness Testing
* Compliance Reporting

---

# 📈 Expected Workflow

1. Customer registers and logs in.
2. Customer grants consent for alternative data usage.
3. Customer submits a loan application.
4. The platform gathers customer-consented alternative data.
5. Features are engineered from collected information.
6. AI predicts customer repayment risk.
7. Fraud detection checks for suspicious behaviour.
8. Explainability engine generates human-readable reasons.
9. Compliance agent validates fairness and privacy.
10. Dashboard displays the final risk score and recommendation.

---

# 🔐 Privacy & Security

* Explicit customer consent before data collection.
* Only customer-approved data sources are accessed.
* Sensitive information is securely stored.
* Fairness and compliance checks are integrated.
* Transparent AI decisions for customers and regulators.

---

# 📊 Dashboard Features

### Customer Dashboard

* Dynamic Risk Score
* Approval Probability
* Fraud Score
* Alternative Data Summary
* AI Explanation
* Risk Trend

### Admin Dashboard

* Customer Applications
* Approval/Rejection
* Risk Analytics
* Fraud Reports
* Fairness Reports
* Overall Statistics

---

# 🎯 Business Value

This platform enables financial institutions to:

* Increase financial inclusion.
* Improve loan approval accuracy.
* Reduce fraudulent applications.
* Lower default rates.
* Provide transparent AI-driven decisions.
* Build customer trust with explainable underwriting.

---

# 🔮 Future Enhancements

* Real-time banking API integration.
* Open Banking support.
* Aadhaar-based verification.
* UPI transaction analysis.
* Continuous behavioural monitoring.
* Federated learning for privacy-preserving model updates.
* Voice-based customer interaction.
* Multi-language explainability.

---

# 👨‍💻 Team

Developed as part of an AI Hackathon focused on **Dynamic Underwriting Using Alternative Data**.

---

# 📜 License

This project is intended for educational and hackathon purposes.
