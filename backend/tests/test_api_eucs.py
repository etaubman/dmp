"""Tests for EUCs API: list by domain and scope."""

import pytest


def test_list_eucs_requires_domain_id(client):
    """GET /api/eucs without domain_id returns 422."""
    response = client.get("/api/eucs")
    assert response.status_code == 422


def test_list_eucs_empty(client):
    """GET /api/eucs with domain_id when no EUCs returns empty list."""
    response = client.get("/api/eucs?domain_id=1&scope=owned")
    assert response.status_code == 200
    assert response.json() == []


def test_list_eucs_owned(client_with_seed):
    """GET /api/eucs?domain_id=1&scope=owned returns EUCs in domain 1."""
    response = client_with_seed.get("/api/eucs?domain_id=1&scope=owned")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(e["name"] == "EUC One" for e in data)
    assert all(e["domain_id"] == 1 for e in data)


def test_list_eucs_upstream(client_with_seed):
    """GET /api/eucs?domain_id=2&scope=upstream returns EUCs in parent domain."""
    response = client_with_seed.get("/api/eucs?domain_id=2&scope=upstream")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(e["name"] == "EUC One" for e in data)
