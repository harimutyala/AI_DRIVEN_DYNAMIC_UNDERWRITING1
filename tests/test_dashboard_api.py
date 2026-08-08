from fastapi.testclient import TestClient

from backend.main import app
from backend.database import SessionLocal
from backend.models_db import User
from backend.auth import get_password_hash


def test_customer_dashboard_returns_serializable_payload():
    client = TestClient(app)
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == 'rahul@dynamic.com').first()
        if not user:
            user = User(
                name='Rahul Sharma',
                email='rahul@dynamic.com',
                password=get_password_hash('rahul123'),
                role='customer',
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        response = client.post('/api/auth/login', json={
            'email': 'rahul@dynamic.com',
            'password': 'rahul123',
        })
        assert response.status_code == 200, response.text
        token = response.json()['access_token']

        dashboard = client.get(
            '/api/dashboard',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert dashboard.status_code == 200, dashboard.text
        payload = dashboard.json()
        assert payload['role'] == 'customer'
        assert isinstance(payload.get('behaviour_logs', []), list)
        assert isinstance(payload.get('audit_logs', []), list)
    finally:
        db.close()
