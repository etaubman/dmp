"""Tests for data-quality API: rules and exceptions list with optional filters."""

import pytest


def test_list_data_quality_rules_no_filter(client):
    """GET /api/data-quality-rules returns all rules (empty when none)."""
    response = client.get("/api/data-quality-rules")
    assert response.status_code == 200
    assert response.json() == []


def test_list_data_quality_rules_by_domain(client_with_seed):
    """GET /api/data-quality-rules?domain_id=1 returns rules in domain 1."""
    response = client_with_seed.get("/api/data-quality-rules?domain_id=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(r["name"] == "Rule One" for r in data)
    assert all(r["domain_id"] == 1 for r in data)


def test_list_data_quality_rules_by_data_element(client_with_seed):
    """GET /api/data-quality-rules?data_element_id=1 returns rules for that element."""
    response = client_with_seed.get("/api/data-quality-rules?data_element_id=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(r["data_element_id"] == 1 for r in data)


def test_list_data_quality_exceptions_no_filter(client):
    """GET /api/data-quality-exceptions returns all exceptions (empty when none)."""
    response = client.get("/api/data-quality-exceptions")
    assert response.status_code == 200
    assert response.json() == []


def test_list_data_quality_exceptions_by_domain(client_with_seed):
    """GET /api/data-quality-exceptions?domain_id=1 returns exceptions for rules in domain 1."""
    response = client_with_seed.get("/api/data-quality-exceptions?domain_id=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(e.get("status") == "open" for e in data)


def test_list_data_quality_exceptions_by_data_element(client_with_seed):
    """GET /api/data-quality-exceptions?data_element_id=1 returns exceptions for that element."""
    response = client_with_seed.get("/api/data-quality-exceptions?data_element_id=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
