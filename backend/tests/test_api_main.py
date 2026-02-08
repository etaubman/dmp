"""Tests for main app routes: health, ready, root, /api/domain-tree, /api/data-elements/sor."""

import pytest


def test_health(client):
    """GET /health returns 200 and status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ready(client):
    """GET /ready returns 200 and status ready when DB is available."""
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}


def test_root(client):
    """GET / returns API message and docs link."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "docs" in data
    assert data["docs"] == "/docs"


def test_domain_tree_empty(client):
    """GET /api/domain-tree returns empty list when no domains."""
    response = client.get("/api/domain-tree")
    assert response.status_code == 200
    assert response.json() == []


def test_domain_tree_with_seed(client_with_seed):
    """GET /api/domain-tree returns tree with root and child domain."""
    response = client_with_seed.get("/api/domain-tree")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Root Domain"
    assert data[0]["level"] == 0
    assert len(data[0]["children"]) == 1
    assert data[0]["children"][0]["name"] == "Child Domain"
    assert data[0]["children"][0]["level"] == 1


def test_data_elements_sor_requires_domain_id(client):
    """GET /api/data-elements/sor without domain_id returns 422."""
    response = client.get("/api/data-elements/sor")
    assert response.status_code == 422


def test_data_elements_sor_empty(client):
    """GET /api/data-elements/sor with domain_id returns empty when no data."""
    response = client.get("/api/data-elements/sor?domain_id=1")
    assert response.status_code == 200
    assert response.json() == []


def test_data_elements_sor_with_seed(client_with_seed):
    """GET /api/data-elements/sor returns SOR records for domain."""
    response = client_with_seed.get("/api/data-elements/sor?domain_id=1&scope=owned")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(
        item.get("physical_data_attribute") == "attr_one" and item.get("data_element_id") == 1
        for item in data
    )
