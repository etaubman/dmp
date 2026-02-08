"""Tests for data-quality API: rules, exceptions, instances, SQL versions, performance, actions."""

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


def test_list_rule_instance_counts(client_with_seed):
    """GET /api/data-quality-rules/instance-counts?domain_id=1 returns counts and last_passed per rule."""
    response = client_with_seed.get("/api/data-quality-rules/instance-counts?domain_id=1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(c["rule_id"] == 1 for c in data)
    for c in data:
        assert "instance_count" in c
        assert "last_passed" in c


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


def test_get_data_quality_rule(client_with_seed):
    """GET /api/data-quality-rules/1 returns the rule with threshold and flagged_for_monitoring."""
    response = client_with_seed.get("/api/data-quality-rules/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["name"] == "Rule One"
    assert data["rule_type"] == "validity"
    assert "exception_threshold_pct" in data
    assert "flagged_for_monitoring" in data


def test_get_data_quality_rule_not_found(client):
    """GET /api/data-quality-rules/999 returns 404."""
    response = client.get("/api/data-quality-rules/999")
    assert response.status_code == 404


def test_create_data_quality_rule(client_with_seed):
    """POST /api/data-quality-rules creates a rule with threshold and type."""
    response = client_with_seed.post(
        "/api/data-quality-rules",
        json={
            "domain_id": 1,
            "data_element_id": 1,
            "endpoint_id": 1,
            "name": "New Rule",
            "rule_type": "accuracy",
            "exception_threshold_pct": 10,
            "flagged_for_monitoring": True,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Rule"
    assert data["rule_type"] == "accuracy"
    assert data["exception_threshold_pct"] == 10
    assert data["flagged_for_monitoring"] is True


def test_update_data_quality_rule(client_with_seed):
    """PATCH /api/data-quality-rules/1 updates threshold and flag."""
    response = client_with_seed.patch(
        "/api/data-quality-rules/1",
        json={"exception_threshold_pct": 15, "flagged_for_monitoring": True},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["exception_threshold_pct"] == 15
    assert data["flagged_for_monitoring"] is True


def test_list_rule_instances(client_with_seed):
    """GET /api/data-quality-rules/instances?rule_id=1 returns instances."""
    response = client_with_seed.get("/api/data-quality-rules/instances?rule_id=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(i["rule_id"] == 1 for i in data)
    assert "run_at" in data[0]
    assert "passed" in data[0]


def test_get_rule_instance_with_sql(client_with_seed):
    """GET /api/data-quality-rules/instances/1 returns instance with sql_text and prettified."""
    response = client_with_seed.get("/api/data-quality-rules/instances/1?prettify=true")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["rule_id"] == 1
    assert "sql_text" in data
    assert data["sql_text"] is not None
    assert "sql_text_prettified" in data


def test_create_rule_instance(client_with_seed):
    """POST /api/data-quality-rules/instances creates a run record."""
    response = client_with_seed.post(
        "/api/data-quality-rules/instances",
        json={
            "rule_id": 1,
            "data_element_id": 1,
            "application_id": 1,
            "passed": False,
            "exception_count": 2,
            "exception_pct": 5,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["rule_id"] == 1
    assert data["application_id"] == 1
    assert data["passed"] is False
    assert data["exception_count"] == 2


def test_list_sql_versions(client_with_seed):
    """GET /api/data-quality-rules/1/sql-versions returns versions."""
    response = client_with_seed.get("/api/data-quality-rules/1/sql-versions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(v["is_live"] for v in data)
    assert "sql_text" in data[0]


def test_create_sql_version(client_with_seed):
    """POST /api/data-quality-rules/1/sql-versions adds a version."""
    response = client_with_seed.post(
        "/api/data-quality-rules/1/sql-versions",
        json={"sql_text": "SELECT * FROM t WHERE 1=1", "is_live": False},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["rule_id"] == 1
    assert "SELECT" in data["sql_text"]
    assert data["version"] >= 1


def test_set_sql_version_live(client_with_seed):
    """PATCH /api/data-quality-rules/1/sql-versions/2/live sets version 2 as live."""
    # Ensure we have at least 2 versions
    client_with_seed.post(
        "/api/data-quality-rules/1/sql-versions",
        json={"sql_text": "SELECT 2", "is_live": False},
    )
    response = client_with_seed.patch("/api/data-quality-rules/1/sql-versions/2/live")
    assert response.status_code == 200
    data = response.json()
    assert data["is_live"] is True


def test_get_rule_performance(client_with_seed):
    """GET /api/data-quality-rules/1/performance returns summary and recent runs."""
    response = client_with_seed.get("/api/data-quality-rules/1/performance")
    assert response.status_code == 200
    data = response.json()
    assert data["rule_id"] == 1
    assert "last_run_at" in data
    assert "recent_runs" in data
    assert "threshold_pct" in data


def test_get_rule_performance_trend(client_with_seed):
    """GET /api/data-quality-rules/1/performance/trend returns time series."""
    response = client_with_seed.get("/api/data-quality-rules/1/performance/trend")
    assert response.status_code == 200
    data = response.json()
    assert data["rule_id"] == 1
    assert "points" in data
    assert isinstance(data["points"], list)


def test_request_rule_mod(client_with_seed):
    """POST /api/data-quality-rules/1/request-mod creates a mod request."""
    response = client_with_seed.post("/api/data-quality-rules/1/request-mod")
    assert response.status_code == 200
    data = response.json()
    assert data["rule_id"] == 1
    assert data["status"] == "requested"


def test_list_rule_mod_requests(client_with_seed):
    """GET /api/data-quality-rules/1/mod-requests returns mod requests."""
    response = client_with_seed.get("/api/data-quality-rules/1/mod-requests")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_flag_rule_for_monitoring(client_with_seed):
    """PATCH /api/data-quality-rules/1/flag-monitoring sets flagged_for_monitoring."""
    response = client_with_seed.patch("/api/data-quality-rules/1/flag-monitoring?flagged=true")
    assert response.status_code == 200
    data = response.json()
    assert data["flagged_for_monitoring"] is True


def test_mark_exception_false_positive(client_with_seed):
    """PATCH /api/data-quality-exceptions/1/false-positive marks exception."""
    response = client_with_seed.patch("/api/data-quality-exceptions/1/false-positive")
    assert response.status_code == 200
    data = response.json()
    assert data["is_false_positive"] is True


def test_mark_instance_false_positive(client_with_seed):
    """PATCH /api/data-quality-rules/instances/1/false-positive marks instance."""
    response = client_with_seed.patch("/api/data-quality-rules/instances/1/false-positive")
    assert response.status_code == 200
    data = response.json()
    assert data["marked_false_positive"] is True
