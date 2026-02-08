"""Tests for bulk API: upload CSV and download CSV per entity type."""

import io
import csv
import pytest


def test_bulk_upload_unknown_entity_type(client_with_seed):
    """POST /api/bulk/upload with unknown entity_type returns 400."""
    response = client_with_seed.post(
        "/api/bulk/upload",
        data={"entity_type": "unknown"},
        files={"file": ("x.csv", io.BytesIO(b"id,name\n1,a"), "text/csv")},
    )
    assert response.status_code == 400
    assert "entity_type" in response.json().get("detail", "").lower() or "unknown" in response.json().get("detail", "").lower()


def test_bulk_upload_domains(client):
    """POST /api/bulk/upload with entity_type=domains creates domains from CSV."""
    content = "name,description\nD1,Desc1\nD2,Desc2"
    response = client.post(
        "/api/bulk/upload",
        data={"entity_type": "domains"},
        files={"file": ("domains.csv", io.BytesIO(content.encode("utf-8")), "text/csv")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["created"] == 2
    assert data["updated"] == 0
    assert len(data["errors"]) == 0
    list_r = client.get("/api/domains")
    assert len(list_r.json()) >= 2
    names = [d["name"] for d in list_r.json()]
    assert "D1" in names and "D2" in names


def test_bulk_upload_domains_missing_required(client):
    """POST /api/bulk/upload with missing required column returns errors."""
    content = "description\nOnlyDesc"
    response = client.post(
        "/api/bulk/upload",
        data={"entity_type": "domains"},
        files={"file": ("domains.csv", io.BytesIO(content.encode("utf-8")), "text/csv")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["created"] == 0
    assert len(data["errors"]) >= 1
    assert "name" in data["errors"][0]["error"].lower() or "required" in data["errors"][0]["error"].lower()


def test_bulk_download_unknown_entity_type(client):
    """GET /api/bulk/download?entity_type=unknown returns 400."""
    response = client.get("/api/bulk/download?entity_type=unknown")
    assert response.status_code == 400


def test_bulk_download_domains_empty(client):
    """GET /api/bulk/download?entity_type=domains returns CSV with header only when empty."""
    response = client.get("/api/bulk/download?entity_type=domains")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8" or "text/csv" in response.headers["content-type"]
    assert "attachment" in response.headers.get("content-disposition", "").lower()
    content = response.text
    assert "id" in content
    assert "name" in content


def test_bulk_download_domains_with_data(client_with_seed):
    """GET /api/bulk/download?entity_type=domains returns CSV with rows."""
    response = client_with_seed.get("/api/bulk/download?entity_type=domains")
    assert response.status_code == 200
    reader = csv.DictReader(io.StringIO(response.text))
    rows = list(reader)
    assert len(rows) >= 2
    names = [r.get("name", "") for r in rows]
    assert "Root Domain" in names
    assert "Child Domain" in names


def test_bulk_download_with_domain_filter(client_with_seed):
    """GET /api/bulk/download?entity_type=data_elements&domain_id=1 returns filtered CSV."""
    response = client_with_seed.get("/api/bulk/download?entity_type=data_elements&domain_id=1")
    assert response.status_code == 200
    reader = csv.DictReader(io.StringIO(response.text))
    rows = list(reader)
    assert len(rows) >= 1
    assert all(int(r.get("domain_id", 0)) == 1 for r in rows)


def test_bulk_upload_data_elements(client_with_seed):
    """POST /api/bulk/upload with entity_type=data_elements creates rows."""
    content = "domain_id,name,description,element_type\n1,NewElement,New desc,logical"
    response = client_with_seed.post(
        "/api/bulk/upload",
        data={"entity_type": "data_elements"},
        files={"file": ("de.csv", io.BytesIO(content.encode("utf-8")), "text/csv")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["created"] >= 1
    assert len(data["errors"]) == 0
