"""Tests for endpoints API: list with optional domain/application filter and scope."""

import pytest


def test_list_endpoints_no_filters(client):
    """GET /api/endpoints returns all endpoints (empty when none)."""
    response = client.get("/api/endpoints")
    assert response.status_code == 200
    assert response.json() == []


def test_list_endpoints_by_domain(client_with_seed):
    """GET /api/endpoints?domain_id=1 returns endpoints in domain 1."""
    response = client_with_seed.get("/api/endpoints?domain_id=1&scope=owned")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(e["name"] == "Report One" for e in data)
    assert all(e["domain_id"] == 1 for e in data)


def test_list_endpoints_by_application(client_with_seed):
    """GET /api/endpoints?application_id=1 returns endpoints for that application."""
    response = client_with_seed.get("/api/endpoints?application_id=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(e["application_id"] == 1 for e in data)


def test_list_endpoints_domain_scope_downstream(client_with_seed):
    """GET /api/endpoints?domain_id=1&scope=downstream returns endpoints in child domains."""
    response = client_with_seed.get("/api/endpoints?domain_id=1&scope=downstream")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
