"""Tests for applications API: list by domain and scope."""

import pytest


def test_list_applications_requires_domain_id(client):
    """GET /api/applications without domain_id returns 422."""
    response = client.get("/api/applications")
    assert response.status_code == 422


def test_list_applications_empty_scope(client):
    """GET /api/applications with domain_id and no apps returns empty list."""
    # Empty DB has no domains; use domain_id=1 (might not exist) - scope owned returns [] if domain missing
    response = client.get("/api/applications?domain_id=1&scope=owned")
    assert response.status_code == 200
    assert response.json() == []


def test_list_applications_owned(client_with_seed):
    """GET /api/applications?domain_id=1&scope=owned returns apps in domain 1."""
    response = client_with_seed.get("/api/applications?domain_id=1&scope=owned")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(a["name"] == "App One" for a in data)
    assert all(a["domain_id"] == 1 for a in data)


def test_list_applications_upstream(client_with_seed):
    """GET /api/applications?domain_id=2&scope=upstream returns apps in parent (domain 1)."""
    response = client_with_seed.get("/api/applications?domain_id=2&scope=upstream")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(a["name"] == "App One" for a in data)


def test_list_applications_downstream(client_with_seed):
    """GET /api/applications?domain_id=1&scope=downstream returns apps in child domains."""
    response = client_with_seed.get("/api/applications?domain_id=1&scope=downstream")
    assert response.status_code == 200
    # Child domain 2 has no applications in seed
    data = response.json()
    assert isinstance(data, list)
