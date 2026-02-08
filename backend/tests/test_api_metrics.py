"""Tests for metrics API: counts with optional domain scope."""

import pytest


def test_get_metrics_global(client):
    """GET /api/metrics returns global counts when no domain_id."""
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "domain_id" in data
    assert data["domain_id"] is None
    assert "domains_count" in data
    assert "data_elements_count" in data
    assert "applications_count" in data
    assert "eucs_count" in data
    assert "endpoints_count" in data
    assert "data_quality_rules_count" in data
    assert "data_quality_exceptions_count" in data
    assert "data_concerns_count" in data
    assert data["domains_count"] == 0


def test_get_metrics_global_with_seed(client_with_seed):
    """GET /api/metrics returns non-zero global counts when data exists."""
    response = client_with_seed.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["domains_count"] >= 2
    assert data["data_elements_count"] >= 1
    assert data["applications_count"] >= 1
    assert data["eucs_count"] >= 1
    assert data["endpoints_count"] >= 1
    assert data["data_quality_rules_count"] >= 1
    assert data["data_quality_exceptions_count"] >= 1
    assert data["data_concerns_count"] >= 1


def test_get_metrics_by_domain(client_with_seed):
    """GET /api/metrics?domain_id=1 returns counts scoped to domain 1."""
    response = client_with_seed.get("/api/metrics?domain_id=1")
    assert response.status_code == 200
    data = response.json()
    assert data["domain_id"] == 1
    assert data["data_elements_count"] >= 1
    assert data["applications_count"] >= 1
    assert data["eucs_count"] >= 1
    assert data["endpoints_count"] >= 1
    assert data["data_quality_rules_count"] >= 1
    assert data["data_quality_exceptions_count"] >= 1
    assert data["data_concerns_count"] >= 1
