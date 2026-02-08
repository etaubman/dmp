"""Tests for data-concerns API: list by domain with optional filters."""

import pytest


def test_list_data_concerns_requires_domain_id(client):
    """GET /api/data-concerns without domain_id returns 422."""
    response = client.get("/api/data-concerns")
    assert response.status_code == 422


def test_list_data_concerns_empty(client):
    """GET /api/data-concerns with domain_id when no concerns returns empty list."""
    response = client.get("/api/data-concerns?domain_id=1")
    assert response.status_code == 200
    assert response.json() == []


def test_list_data_concerns_by_domain(client_with_seed):
    """GET /api/data-concerns?domain_id=1 returns concerns in domain 1."""
    response = client_with_seed.get("/api/data-concerns?domain_id=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(c["title"] == "Concern One" for c in data)
    assert all(c["domain_id"] == 1 for c in data)


def test_list_data_concerns_filter_by_application(client_with_seed):
    """GET /api/data-concerns?domain_id=1&application_id=1 returns concerns for that app."""
    response = client_with_seed.get("/api/data-concerns?domain_id=1&application_id=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(c["application_id"] == 1 for c in data)


def test_list_data_concerns_filter_by_data_element(client_with_seed):
    """GET /api/data-concerns?domain_id=1&data_element_id=1 returns concerns for that element."""
    response = client_with_seed.get("/api/data-concerns?domain_id=1&data_element_id=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(c["data_element_id"] == 1 for c in data)
