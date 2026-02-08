"""Tests for data-elements API: list, lineage, SOR."""

import pytest


def test_list_data_elements_requires_domain_id(client):
    """GET /api/data-elements without domain_id returns 422."""
    response = client.get("/api/data-elements")
    assert response.status_code == 422


def test_list_data_elements_empty(client):
    """GET /api/data-elements with domain_id when no elements returns empty list."""
    response = client.get("/api/data-elements?domain_id=1&scope=owned")
    assert response.status_code == 200
    assert response.json() == []


def test_list_data_elements_owned(client_with_seed):
    """GET /api/data-elements?domain_id=1&scope=owned returns elements in domain 1."""
    response = client_with_seed.get("/api/data-elements?domain_id=1&scope=owned")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(e["name"] == "Element One" for e in data)
    assert all(e["domain_id"] == 1 for e in data)


def test_list_data_elements_upstream(client_with_seed):
    """GET /api/data-elements?domain_id=2&scope=upstream returns elements in parent domain."""
    response = client_with_seed.get("/api/data-elements?domain_id=2&scope=upstream")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(e["name"] == "Element One" for e in data)


def test_get_data_element_lineage_not_found(client):
    """GET /api/data-elements/999/lineage returns 404."""
    response = client.get("/api/data-elements/999/lineage")
    assert response.status_code == 404


def test_get_data_element_lineage(client_with_seed):
    """GET /api/data-elements/1/lineage returns nodes and edges."""
    response = client_with_seed.get("/api/data-elements/1/lineage")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert isinstance(data["nodes"], list)
    assert isinstance(data["edges"], list)
    node_ids = [n["id"] for n in data["nodes"]]
    assert any("de-1" in id for id in node_ids)
    assert any("domain" in n["type"] for n in data["nodes"])


def test_get_data_element_sor_not_found(client):
    """GET /api/data-elements/999/sor returns 404."""
    response = client.get("/api/data-elements/999/sor")
    assert response.status_code == 404


def test_get_data_element_sor(client_with_seed):
    """GET /api/data-elements/1/sor returns SOR records for the element."""
    response = client_with_seed.get("/api/data-elements/1/sor")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(s.get("application_name") == "App One" and s.get("physical_data_attribute") == "attr_one" for s in data)


def test_get_data_element_lineage_applications_not_found(client):
    """GET /api/data-elements/999/lineage-applications returns 404."""
    response = client.get("/api/data-elements/999/lineage-applications")
    assert response.status_code == 404


def test_get_data_element_lineage_applications(client_with_seed):
    """GET /api/data-elements/1/lineage-applications returns apps from SOR and endpoints."""
    response = client_with_seed.get("/api/data-elements/1/lineage-applications")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(a.get("source") == "sor" and a.get("application_name") == "App One" for a in data)
