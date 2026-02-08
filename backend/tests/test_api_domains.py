"""Tests for domains API: list, get, create, update, delete, domain-tree."""

import pytest


def test_list_domains_empty(client):
    """GET /api/domains returns empty list when no domains."""
    response = client.get("/api/domains")
    assert response.status_code == 200
    assert response.json() == []


def test_list_domains_with_seed(client_with_seed):
    """GET /api/domains returns all domains ordered by name."""
    response = client_with_seed.get("/api/domains")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    names = [d["name"] for d in data]
    assert "Child Domain" in names
    assert "Root Domain" in names
    assert names == sorted(names)


def test_get_domain_not_found(client):
    """GET /api/domains/999 returns 404."""
    response = client.get("/api/domains/999")
    assert response.status_code == 404
    assert "not found" in response.json().get("detail", "").lower()


def test_get_domain(client_with_seed):
    """GET /api/domains/{id} returns domain."""
    response = client_with_seed.get("/api/domains/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["name"] == "Root Domain"
    assert data["description"] == "L0"
    assert data["parent_id"] is None


def test_create_domain_root(client):
    """POST /api/domains creates L0 domain with no parent."""
    response = client.post(
        "/api/domains",
        json={"name": "New Root", "description": "A root domain", "parent_id": None},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Root"
    assert data["description"] == "A root domain"
    assert data["parent_id"] is None
    assert "id" in data


def test_create_domain_child(client_with_seed):
    """POST /api/domains creates child domain under existing parent."""
    response = client_with_seed.post(
        "/api/domains",
        json={"name": "L2 Domain", "description": "Level 2", "parent_id": 2},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "L2 Domain"
    assert data["parent_id"] == 2


def test_create_domain_parent_not_found(client):
    """POST /api/domains with invalid parent_id returns 400."""
    response = client.post(
        "/api/domains",
        json={"name": "Orphan", "parent_id": 999},
    )
    assert response.status_code == 400
    assert "parent" in response.json().get("detail", "").lower()


def test_create_domain_max_depth(client_with_seed):
    """POST /api/domains fails when exceeding L0-L3 depth."""
    # Seed has Root(1), Child(2). Add L2 under Child, then L3, then L4 should fail.
    client_with_seed.post("/api/domains", json={"name": "L2", "parent_id": 2})
    r2 = client_with_seed.post("/api/domains", json={"name": "L3", "parent_id": 3})
    assert r2.status_code == 201
    r3 = client_with_seed.post("/api/domains", json={"name": "L4", "parent_id": 4})
    assert r3.status_code == 400
    assert "depth" in r3.json().get("detail", "").lower() or "L0" in r3.json().get("detail", "")


def test_update_domain(client_with_seed):
    """PATCH /api/domains/{id} updates name and description."""
    response = client_with_seed.patch(
        "/api/domains/2",
        json={"name": "Updated Child", "description": "Updated desc"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Child"
    assert data["description"] == "Updated desc"


def test_update_domain_not_found(client):
    """PATCH /api/domains/999 returns 404."""
    response = client.patch("/api/domains/999", json={"name": "X"})
    assert response.status_code == 404


def test_update_domain_self_parent_rejected(client_with_seed):
    """PATCH /api/domains/{id} with parent_id=self returns 400."""
    response = client_with_seed.patch("/api/domains/1", json={"parent_id": 1})
    assert response.status_code == 400
    assert "own parent" in response.json().get("detail", "").lower()


def test_update_domain_circular_parent_rejected(client_with_seed):
    """PATCH /api/domains with parent=descendant returns 400."""
    # Domain 1 is root, 2 is child of 1. Set 1's parent to 2 => circular.
    response = client_with_seed.patch("/api/domains/1", json={"parent_id": 2})
    assert response.status_code == 400
    assert "circular" in response.json().get("detail", "").lower()


def test_delete_domain_not_found(client):
    """DELETE /api/domains/999 returns 404."""
    response = client.delete("/api/domains/999")
    assert response.status_code == 404


def test_delete_domain_with_children_rejected(client_with_seed):
    """DELETE /api/domains with children returns 409."""
    response = client_with_seed.delete("/api/domains/1")
    assert response.status_code == 409
    assert "child" in response.json().get("detail", "").lower()


def test_delete_domain_with_related_data_rejected(client_with_seed):
    """DELETE /api/domains with data elements/apps etc returns 409."""
    # Domain 1 has applications, data elements, etc.
    response = client_with_seed.delete("/api/domains/1")
    assert response.status_code == 409
    assert "related" in response.json().get("detail", "").lower() or "child" in response.json().get("detail", "").lower()


def test_delete_domain_leaf_success(client_with_seed):
    """DELETE /api/domains/{id} succeeds for leaf domain with no related data."""
    # Domain 2 (Child) has no children and no related data in our seed
    response = client_with_seed.delete("/api/domains/2")
    assert response.status_code == 204
    get_r = client_with_seed.get("/api/domains/2")
    assert get_r.status_code == 404
