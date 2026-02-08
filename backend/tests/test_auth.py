"""
Tests for auth: login (success + failure), /me (with/without token), logout.
Uses in-memory SQLite and seed data (Ethan Taubman with password "password").
"""
import pytest


def test_login_success(client):
    """POST /api/auth/login with valid credentials returns 200 and access_token."""
    response = client.post(
        "/api/auth/login",
        json={"email": "ethan.taubman@example.com", "password": "password"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data.get("token_type") == "bearer"
    assert len(data["access_token"]) > 0


def test_login_wrong_password_returns_401(client):
    """POST /api/auth/login with wrong password returns 401."""
    response = client.post(
        "/api/auth/login",
        json={"email": "ethan.taubman@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json().get("detail") == "Invalid email or password"


def test_login_wrong_email_returns_401(client):
    """POST /api/auth/login with unknown email returns 401."""
    response = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "password"},
    )
    assert response.status_code == 401
    assert response.json().get("detail") == "Invalid email or password"


def test_login_empty_password_returns_401(client):
    """POST /api/auth/login with empty password returns 401."""
    response = client.post(
        "/api/auth/login",
        json={"email": "ethan.taubman@example.com", "password": ""},
    )
    assert response.status_code == 401


def test_me_without_token_returns_401(client):
    """GET /api/auth/me without Authorization header returns 401."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_with_valid_token_returns_user(client):
    """GET /api/auth/me with valid Bearer token returns current user."""
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "ethan.taubman@example.com", "password": "password"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "ethan.taubman@example.com"
    assert data["name"] == "Ethan Taubman"
    assert data["role"] == "admin"
    assert "id" in data


def test_logout_returns_200(client):
    """POST /api/auth/logout returns 200 (client discards token)."""
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    assert response.json().get("message") == "Logged out"


def test_login_then_me_then_logout_flow(client):
    """Full flow: login -> /me -> logout."""
    login = client.post(
        "/api/auth/login",
        json={"email": "ethan.taubman@example.com", "password": "password"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["name"] == "Ethan Taubman"

    logout = client.post("/api/auth/logout")
    assert logout.status_code == 200
