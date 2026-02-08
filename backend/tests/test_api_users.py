"""Tests for users API: list, get, create, update, delete."""

import pytest


def test_list_users(client):
    """GET /api/users returns at least the seeded user."""
    response = client.get("/api/users")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    emails = [u["email"] for u in data]
    assert "ethan.taubman@example.com" in emails


def test_get_user(client):
    """GET /api/users/1 returns the seeded user."""
    response = client.get("/api/users/1")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "ethan.taubman@example.com"
    assert data["name"] == "Ethan Taubman"
    assert data["role"] == "admin"


def test_get_user_not_found(client):
    """GET /api/users/999 returns 404."""
    response = client.get("/api/users/999")
    assert response.status_code == 404
    assert "not found" in response.json().get("detail", "").lower()


def test_create_user(client):
    """POST /api/users creates a new user."""
    response = client.post(
        "/api/users",
        json={"email": "new@example.com", "name": "New User", "role": "viewer"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new@example.com"
    assert data["name"] == "New User"
    assert data["role"] == "viewer"
    assert "id" in data


def test_create_user_duplicate_email_409(client):
    """POST /api/users with existing email returns 409."""
    response = client.post(
        "/api/users",
        json={"email": "ethan.taubman@example.com", "name": "Other", "role": "viewer"},
    )
    assert response.status_code == 409
    assert "email" in response.json().get("detail", "").lower()


def test_create_user_empty_email_400(client):
    """POST /api/users with empty email returns 400."""
    response = client.post(
        "/api/users",
        json={"email": "  ", "name": "X", "role": "viewer"},
    )
    assert response.status_code == 400
    assert "email" in response.json().get("detail", "").lower()


def test_update_user(client):
    """PATCH /api/users/1 updates name and role."""
    response = client.patch(
        "/api/users/1",
        json={"name": "Ethan Updated", "role": "editor"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Ethan Updated"
    assert data["role"] == "editor"
    assert data["email"] == "ethan.taubman@example.com"


def test_update_user_not_found(client):
    """PATCH /api/users/999 returns 404."""
    response = client.patch("/api/users/999", json={"name": "X"})
    assert response.status_code == 404


def test_update_user_duplicate_email_409(client):
    """PATCH /api/users with another user's email returns 409."""
    client.post("/api/users", json={"email": "second@example.com", "name": "Second", "role": "viewer"})
    response = client.patch("/api/users/1", json={"email": "second@example.com"})
    assert response.status_code == 409


def test_delete_user(client):
    """DELETE /api/users/{id} removes user (use non-seed user)."""
    create_r = client.post(
        "/api/users",
        json={"email": "todelete@example.com", "name": "To Delete", "role": "viewer"},
    )
    assert create_r.status_code == 201
    uid = create_r.json()["id"]
    response = client.delete(f"/api/users/{uid}")
    assert response.status_code == 204
    get_r = client.get(f"/api/users/{uid}")
    assert get_r.status_code == 404


def test_delete_user_not_found(client):
    """DELETE /api/users/999 returns 404."""
    response = client.delete("/api/users/999")
    assert response.status_code == 404
