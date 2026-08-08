from models.risk_model import risk_engine


def test_risk_model_changes_for_different_applicant_profiles():
    strong_profile = risk_engine.predict_risk(
        credit_score=750,
        salary=150000,
        loan_amount=25000,
        job_stability_score=8.5,
        education_score=8.5,
        linkedin_score=8.5,
        device_trust_score=8.5,
        email_trust_score=8.5,
    )

    weak_profile = risk_engine.predict_risk(
        credit_score=420,
        salary=35000,
        loan_amount=75000,
        job_stability_score=2.0,
        education_score=2.0,
        linkedin_score=2.0,
        device_trust_score=2.0,
        email_trust_score=2.0,
    )

    assert strong_profile["approval_probability"] > weak_profile["approval_probability"]
    assert strong_profile["decision"] != weak_profile["decision"] or abs(
        strong_profile["approval_probability"] - weak_profile["approval_probability"]
    ) > 0.2


def test_cibil_compensation_boost():
    low_cibil_no_alt_consents = risk_engine.predict_risk(
        credit_score=500,
        salary=65000,
        loan_amount=25000,
        job_stability_score=5.0,
        education_score=5.0,
        linkedin_score=5.0,
        device_trust_score=5.0,
        email_trust_score=5.0,
        utility_score=5.0,
        bank_cashflow_score=5.0
    )

    low_cibil_with_alt_consents = risk_engine.predict_risk(
        credit_score=500,
        salary=65000,
        loan_amount=25000,
        job_stability_score=8.5,
        education_score=8.5,
        linkedin_score=8.5,
        device_trust_score=8.0,
        email_trust_score=8.0,
        utility_score=9.2,
        bank_cashflow_score=9.0
    )

    assert low_cibil_with_alt_consents["approval_probability"] > low_cibil_no_alt_consents["approval_probability"]
    assert low_cibil_with_alt_consents["credit_score"] > low_cibil_no_alt_consents["credit_score"]
    assert low_cibil_with_alt_consents["decision"] == "Approve"

