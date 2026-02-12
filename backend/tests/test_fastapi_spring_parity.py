"""
Parity tests: compare GET /api/domains output from FastAPI and Spring.
Requires both backends to be running (e.g. docker-compose up).

Run: pytest backend/tests/test_fastapi_spring_parity.py -v
Skips if FastAPI (8000) or Spring (8081) is unreachable.
"""
import pytest
import httpx
from dateutil import parser as date_parser

FASTAPI_URL = "http://localhost:8000"
SPRING_URL = "http://localhost:8081"


def _is_reachable(base_url: str, path: str = "/api/domains") -> bool:
    """Check if endpoint is reachable."""
    try:
        r = httpx.get(f"{base_url}{path}", timeout=2.0)
        return r.status_code in (200, 401, 404)
    except (httpx.ConnectError, httpx.TimeoutException):
        return False


@pytest.fixture(scope="module")
def both_backends_up():
    """Skip whole module if either backend is down."""
    if not _is_reachable(FASTAPI_URL):
        pytest.skip("FastAPI backend not reachable at localhost:8000")
    if not _is_reachable(SPRING_URL):
        pytest.skip("Spring backend not reachable at localhost:8081")


@pytest.fixture(scope="module")
def fastapi_domains(both_backends_up):
    r = httpx.get(f"{FASTAPI_URL}/api/domains", timeout=5.0)
    assert r.status_code == 200, f"FastAPI returned {r.status_code}"
    return r.json()


@pytest.fixture(scope="module")
def spring_domains(both_backends_up):
    r = httpx.get(f"{SPRING_URL}/api/domains", timeout=5.0)
    assert r.status_code == 200, f"Spring returned {r.status_code}"
    return r.json()


def _parse_optional_datetime(val):
    """Parse ISO datetime or return None. Used for comparison."""
    if val is None:
        return None
    try:
        return date_parser.isoparse(val)
    except (ValueError, TypeError):
        return val


def _datetimes_equal(dt1, dt2, tolerance_ms=1):
    """
    Compare two datetimes; allow for microsecond vs millisecond precision
    (FastAPI returns microseconds, Spring returns milliseconds).
    """
    if dt1 is None and dt2 is None:
        return True
    if dt1 is None or dt2 is None:
        return False
    delta = abs((dt1 - dt2).total_seconds() * 1000)
    return delta <= tolerance_ms


def test_domains_parity_count(fastapi_domains, spring_domains):
    """Both backends return the same number of domains."""
    assert len(fastapi_domains) == len(spring_domains), (
        f"Count mismatch: FastAPI={len(fastapi_domains)}, Spring={len(spring_domains)}"
    )


def test_domains_parity_content(fastapi_domains, spring_domains):
    """
    Both backends return identical domain data.
    Compares id, name, description, parent_id; datetimes compared as parsed instants.
    """
    fastapi_by_id = {d["id"]: d for d in fastapi_domains}
    spring_by_id = {d["id"]: d for d in spring_domains}

    assert set(fastapi_by_id.keys()) == set(spring_by_id.keys()), (
        f"Domain IDs differ: FastAPI ids={sorted(fastapi_by_id)}, Spring ids={sorted(spring_by_id)}"
    )

    for domain_id, fastapi_d in fastapi_by_id.items():
        spring_d = spring_by_id[domain_id]
        assert fastapi_d["id"] == spring_d["id"]
        assert fastapi_d["name"] == spring_d["name"], (
            f"Domain {domain_id} name: FastAPI={fastapi_d['name']!r}, Spring={spring_d['name']!r}"
        )
        assert fastapi_d.get("description") == spring_d.get("description"), (
            f"Domain {domain_id} description: FastAPI={fastapi_d.get('description')!r}, Spring={spring_d.get('description')!r}"
        )
        assert fastapi_d.get("parent_id") == spring_d.get("parent_id"), (
            f"Domain {domain_id} parent_id: FastAPI={fastapi_d.get('parent_id')!r}, Spring={spring_d.get('parent_id')!r}"
        )
        fa_created = _parse_optional_datetime(fastapi_d.get("created_at"))
        sp_created = _parse_optional_datetime(spring_d.get("created_at"))
        assert _datetimes_equal(fa_created, sp_created), (
            f"Domain {domain_id} created_at: FastAPI={fastapi_d.get('created_at')!r}, Spring={spring_d.get('created_at')!r}"
        )
        fa_updated = _parse_optional_datetime(fastapi_d.get("updated_at"))
        sp_updated = _parse_optional_datetime(spring_d.get("updated_at"))
        assert _datetimes_equal(fa_updated, sp_updated), (
            f"Domain {domain_id} updated_at: FastAPI={fastapi_d.get('updated_at')!r}, Spring={spring_d.get('updated_at')!r}"
        )


def test_domains_parity_order(fastapi_domains, spring_domains):
    """Both backends return domains in the same order (by name)."""
    fastapi_names = [d["name"] for d in fastapi_domains]
    spring_names = [d["name"] for d in spring_domains]
    assert fastapi_names == spring_names, (
        f"Order mismatch:\nFastAPI: {fastapi_names}\nSpring: {spring_names}"
    )


def _tree_to_list(nodes, out=None):
    """Flatten tree to list of (id, name, parent_id, level) for comparison."""
    if out is None:
        out = []
    for n in nodes:
        out.append((n["id"], n["name"], n.get("parent_id"), n.get("level", 0)))
        _tree_to_list(n.get("children", []), out)
    return out


def test_domain_tree_parity(both_backends_up):
    """Both backends return identical domain tree structure."""
    fa = httpx.get(f"{FASTAPI_URL}/api/domain-tree", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/domain-tree", timeout=5.0)
    assert fa.status_code == 200 and sp.status_code == 200
    fa_list = _tree_to_list(fa.json())
    sp_list = _tree_to_list(sp.json())
    assert fa_list == sp_list, f"Tree mismatch:\nFastAPI: {fa_list}\nSpring: {sp_list}"


def test_auth_login_parity(both_backends_up):
    """Both backends accept same credentials and return access_token."""
    # Use seed user ethan.taubman@example.com / password
    payload = {"email": "ethan.taubman@example.com", "password": "password"}
    fa = httpx.post(f"{FASTAPI_URL}/api/auth/login", json=payload, timeout=5.0)
    sp = httpx.post(f"{SPRING_URL}/api/auth/login", json=payload, timeout=5.0)
    assert fa.status_code == 200, f"FastAPI login failed: {fa.status_code} {fa.text}"
    assert sp.status_code == 200, f"Spring login failed: {sp.status_code} {sp.text}"
    fa_json = fa.json()
    sp_json = sp.json()
    assert "access_token" in fa_json and "access_token" in sp_json
    assert len(fa_json["access_token"]) > 0 and len(sp_json["access_token"]) > 0


def test_auth_me_parity(both_backends_up):
    """Both backends return same user for valid token from FastAPI login."""
    payload = {"email": "ethan.taubman@example.com", "password": "password"}
    login = httpx.post(f"{FASTAPI_URL}/api/auth/login", json=payload, timeout=5.0)
    assert login.status_code == 200
    token = login.json()["access_token"]
    fa = httpx.get(f"{FASTAPI_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=5.0)
    assert fa.status_code == 200, f"FastAPI /me failed: {fa.status_code}"
    assert sp.status_code == 200, f"Spring /me failed: {sp.status_code}"
    fa_user = fa.json()
    sp_user = sp.json()
    assert fa_user["id"] == sp_user["id"]
    assert fa_user["email"] == sp_user["email"]
    assert fa_user.get("name") == sp_user.get("name")
    assert fa_user.get("role") == sp_user.get("role")


def test_get_domain_parity(both_backends_up, fastapi_domains):
    """Both backends return identical domain for GET /api/domains/{id}."""
    if not fastapi_domains:
        pytest.skip("No domains in DB")
    domain_id = fastapi_domains[0]["id"]
    fa = httpx.get(f"{FASTAPI_URL}/api/domains/{domain_id}", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/domains/{domain_id}", timeout=5.0)
    assert fa.status_code == 200, f"FastAPI returned {fa.status_code}"
    assert sp.status_code == 200, f"Spring returned {sp.status_code}"
    fa_d = fa.json()
    sp_d = sp.json()
    assert fa_d["id"] == sp_d["id"] == domain_id
    assert fa_d["name"] == sp_d["name"]
    assert fa_d.get("description") == sp_d.get("description")
    assert fa_d.get("parent_id") == sp_d.get("parent_id")
    assert _datetimes_equal(_parse_optional_datetime(fa_d.get("created_at")), _parse_optional_datetime(sp_d.get("created_at")))
    assert _datetimes_equal(_parse_optional_datetime(fa_d.get("updated_at")), _parse_optional_datetime(sp_d.get("updated_at")))


def test_create_domain_parity(both_backends_up):
    """Both backends create domain with same structure and return DomainOut."""
    payload = {"name": "ParityTestCreate", "description": "parity test", "parent_id": None}
    fa = httpx.post(f"{FASTAPI_URL}/api/domains", json=payload, timeout=5.0)
    sp = httpx.post(f"{SPRING_URL}/api/domains", json=payload, timeout=5.0)
    assert fa.status_code == 201, f"FastAPI create failed: {fa.status_code} {fa.text}"
    assert sp.status_code == 201, f"Spring create failed: {sp.status_code} {sp.text}"
    fa_d = fa.json()
    sp_d = sp.json()
    # Same structure: id, name, description, parent_id, created_at, updated_at
    for key in ("id", "name", "description", "parent_id", "created_at", "updated_at"):
        assert key in fa_d and key in sp_d, f"Missing key {key}"
    assert fa_d["name"] == sp_d["name"] == payload["name"]
    assert fa_d.get("description") == sp_d.get("description") == payload["description"]
    assert fa_d.get("parent_id") == sp_d.get("parent_id") is None
    # Cleanup: delete both
    httpx.delete(f"{FASTAPI_URL}/api/domains/{fa_d['id']}", timeout=5.0)
    httpx.delete(f"{FASTAPI_URL}/api/domains/{sp_d['id']}", timeout=5.0)


def test_update_domain_parity(both_backends_up):
    """Both backends return identical domain after PATCH; cross-verify via GET."""
    # Create domain via FastAPI
    create = httpx.post(f"{FASTAPI_URL}/api/domains", json={"name": "ParityTestPatch", "parent_id": None}, timeout=5.0)
    assert create.status_code == 201
    domain_id = create.json()["id"]
    # PATCH via FastAPI
    patch_body = {"name": "ParityTestPatched", "description": "updated"}
    fa = httpx.patch(f"{FASTAPI_URL}/api/domains/{domain_id}", json=patch_body, timeout=5.0)
    assert fa.status_code == 200
    fa_d = fa.json()
    # GET via Spring (same DB) - should match
    sp = httpx.get(f"{SPRING_URL}/api/domains/{domain_id}", timeout=5.0)
    assert sp.status_code == 200
    sp_d = sp.json()
    assert fa_d["id"] == sp_d["id"]
    assert fa_d["name"] == sp_d["name"] == "ParityTestPatched"
    assert fa_d.get("description") == sp_d.get("description") == "updated"
    assert _datetimes_equal(_parse_optional_datetime(fa_d.get("updated_at")), _parse_optional_datetime(sp_d.get("updated_at")))
    # PATCH via Spring, GET via FastAPI
    patch_body2 = {"name": "ParityTestPatched2"}
    sp_patch = httpx.patch(f"{SPRING_URL}/api/domains/{domain_id}", json=patch_body2, timeout=5.0)
    assert sp_patch.status_code == 200
    fa_get = httpx.get(f"{FASTAPI_URL}/api/domains/{domain_id}", timeout=5.0)
    assert fa_get.status_code == 200
    assert fa_get.json()["name"] == sp_patch.json()["name"] == "ParityTestPatched2"
    # Cleanup
    httpx.delete(f"{FASTAPI_URL}/api/domains/{domain_id}", timeout=5.0)


def test_delete_domain_parity(both_backends_up):
    """Both backends return 204 on DELETE and domain is gone."""
    # Create two domains (no children)
    c1 = httpx.post(f"{FASTAPI_URL}/api/domains", json={"name": "ParityTestDel1", "parent_id": None}, timeout=5.0)
    c2 = httpx.post(f"{FASTAPI_URL}/api/domains", json={"name": "ParityTestDel2", "parent_id": None}, timeout=5.0)
    assert c1.status_code == 201 and c2.status_code == 201
    id1, id2 = c1.json()["id"], c2.json()["id"]
    # Delete via FastAPI, verify 204
    d1 = httpx.delete(f"{FASTAPI_URL}/api/domains/{id1}", timeout=5.0)
    assert d1.status_code == 204, f"FastAPI delete: {d1.status_code}"
    # Delete via Spring, verify 204
    d2 = httpx.delete(f"{SPRING_URL}/api/domains/{id2}", timeout=5.0)
    assert d2.status_code == 204, f"Spring delete: {d2.status_code}"
    # Both should 404 now
    assert httpx.get(f"{FASTAPI_URL}/api/domains/{id1}", timeout=5.0).status_code == 404
    assert httpx.get(f"{SPRING_URL}/api/domains/{id2}", timeout=5.0).status_code == 404


def test_logout_parity(both_backends_up):
    """Both backends return same logout response."""
    fa = httpx.post(f"{FASTAPI_URL}/api/auth/logout", timeout=5.0)
    sp = httpx.post(f"{SPRING_URL}/api/auth/logout", timeout=5.0)
    assert fa.status_code == 200 and sp.status_code == 200
    assert fa.json() == sp.json() == {"message": "Logged out"}


# --- Phase 4: Applications, EUCs, Endpoints parity ---


def test_applications_parity(both_backends_up, fastapi_domains):
    """Both backends return same applications list for domain_id + scope=owned."""
    if not fastapi_domains:
        pytest.skip("No domains in DB")
    domain_id = fastapi_domains[0]["id"]
    fa = httpx.get(f"{FASTAPI_URL}/api/applications?domain_id={domain_id}&scope=owned", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/applications?domain_id={domain_id}&scope=owned", timeout=5.0)
    assert fa.status_code == 200, f"FastAPI returned {fa.status_code}"
    assert sp.status_code == 200, f"Spring returned {sp.status_code}"
    fa_list = fa.json()
    sp_list = sp.json()
    assert len(fa_list) == len(sp_list), f"Count mismatch: FastAPI={len(fa_list)}, Spring={len(sp_list)}"
    fa_by_id = {a["id"]: a for a in fa_list}
    sp_by_id = {a["id"]: a for a in sp_list}
    assert set(fa_by_id.keys()) == set(sp_by_id.keys())
    for aid in fa_by_id:
        assert fa_by_id[aid]["name"] == sp_by_id[aid]["name"]
        assert fa_by_id[aid]["domain_id"] == sp_by_id[aid]["domain_id"]
        assert fa_by_id[aid].get("description") == sp_by_id[aid].get("description")


def test_eucs_parity(both_backends_up, fastapi_domains):
    """Both backends return same EUCs list for domain_id + scope=owned."""
    if not fastapi_domains:
        pytest.skip("No domains in DB")
    domain_id = fastapi_domains[0]["id"]
    fa = httpx.get(f"{FASTAPI_URL}/api/eucs?domain_id={domain_id}&scope=owned", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/eucs?domain_id={domain_id}&scope=owned", timeout=5.0)
    assert fa.status_code == 200, f"FastAPI returned {fa.status_code}"
    assert sp.status_code == 200, f"Spring returned {sp.status_code}"
    fa_list = fa.json()
    sp_list = sp.json()
    assert len(fa_list) == len(sp_list), f"Count mismatch: FastAPI={len(fa_list)}, Spring={len(sp_list)}"
    fa_by_id = {e["id"]: e for e in fa_list}
    sp_by_id = {e["id"]: e for e in sp_list}
    assert set(fa_by_id.keys()) == set(sp_by_id.keys())
    for eid in fa_by_id:
        assert fa_by_id[eid]["name"] == sp_by_id[eid]["name"]
        assert fa_by_id[eid]["domain_id"] == sp_by_id[eid]["domain_id"]
        assert fa_by_id[eid].get("euc_type") == sp_by_id[eid].get("euc_type")


def test_endpoints_parity(both_backends_up, fastapi_domains):
    """Both backends return same endpoints list (no filter and with domain_id)."""
    fa_all = httpx.get(f"{FASTAPI_URL}/api/endpoints", timeout=5.0)
    sp_all = httpx.get(f"{SPRING_URL}/api/endpoints", timeout=5.0)
    assert fa_all.status_code == 200 and sp_all.status_code == 200
    fa_list = fa_all.json()
    sp_list = sp_all.json()
    assert len(fa_list) == len(sp_list), f"Count mismatch (no filter): FastAPI={len(fa_list)}, Spring={len(sp_list)}"
    fa_by_id = {e["id"]: e for e in fa_list}
    sp_by_id = {e["id"]: e for e in sp_list}
    assert set(fa_by_id.keys()) == set(sp_by_id.keys())
    for eid in fa_by_id:
        assert fa_by_id[eid]["name"] == sp_by_id[eid]["name"]
        assert fa_by_id[eid].get("domain_id") == sp_by_id[eid].get("domain_id")
        assert fa_by_id[eid].get("application_id") == sp_by_id[eid].get("application_id")

    if fastapi_domains:
        domain_id = fastapi_domains[0]["id"]
        fa_dom = httpx.get(f"{FASTAPI_URL}/api/endpoints?domain_id={domain_id}&scope=owned", timeout=5.0)
        sp_dom = httpx.get(f"{SPRING_URL}/api/endpoints?domain_id={domain_id}&scope=owned", timeout=5.0)
        assert fa_dom.status_code == 200 and sp_dom.status_code == 200
        assert len(fa_dom.json()) == len(sp_dom.json())


# --- Phase 5: Users CRUD parity ---


def test_users_list_parity(both_backends_up):
    """Both backends return same users list."""
    fa = httpx.get(f"{FASTAPI_URL}/api/users", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/users", timeout=5.0)
    assert fa.status_code == 200 and sp.status_code == 200
    fa_list = fa.json()
    sp_list = sp.json()
    assert len(fa_list) == len(sp_list), f"Count mismatch: FastAPI={len(fa_list)}, Spring={len(sp_list)}"
    fa_by_id = {u["id"]: u for u in fa_list}
    sp_by_id = {u["id"]: u for u in sp_list}
    assert set(fa_by_id.keys()) == set(sp_by_id.keys())
    for uid in fa_by_id:
        assert fa_by_id[uid]["email"] == sp_by_id[uid]["email"]
        assert fa_by_id[uid].get("name") == sp_by_id[uid].get("name")
        assert fa_by_id[uid].get("role") == sp_by_id[uid].get("role")


def test_users_get_parity(both_backends_up, fastapi_domains):
    """Both backends return same user for GET /api/users/{id}."""
    # Get first user from list
    fa_list = httpx.get(f"{FASTAPI_URL}/api/users", timeout=5.0)
    assert fa_list.status_code == 200
    users = fa_list.json()
    if not users:
        pytest.skip("No users in DB")
    user_id = users[0]["id"]
    fa = httpx.get(f"{FASTAPI_URL}/api/users/{user_id}", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/users/{user_id}", timeout=5.0)
    assert fa.status_code == 200 and sp.status_code == 200
    assert fa.json()["email"] == sp.json()["email"]
    assert fa.json().get("name") == sp.json().get("name")
    assert fa.json().get("role") == sp.json().get("role")


def test_users_create_parity(both_backends_up):
    """Both backends create user with same structure."""
    payload_fa = {"email": "parity-create-fa@example.com", "name": "Parity FA", "role": "viewer"}
    payload_sp = {"email": "parity-create-sp@example.com", "name": "Parity SP", "role": "viewer"}
    fa = httpx.post(f"{FASTAPI_URL}/api/users", json=payload_fa, timeout=5.0)
    sp = httpx.post(f"{SPRING_URL}/api/users", json=payload_sp, timeout=5.0)
    assert fa.status_code == 201, f"FastAPI: {fa.status_code} {fa.text}"
    assert sp.status_code == 201, f"Spring: {sp.status_code} {sp.text}"
    fa_u = fa.json()
    sp_u = sp.json()
    for key in ("id", "email", "name", "role", "created_at", "updated_at"):
        assert key in fa_u and key in sp_u, f"Missing key {key}"
    assert fa_u["email"] == payload_fa["email"]
    assert sp_u["email"] == payload_sp["email"]
    # Cleanup: delete both
    httpx.delete(f"{FASTAPI_URL}/api/users/{fa_u['id']}", timeout=5.0)
    httpx.delete(f"{SPRING_URL}/api/users/{sp_u['id']}", timeout=5.0)


def test_users_update_parity(both_backends_up):
    """Both backends return identical user after PATCH."""
    # Create user via FastAPI
    create = httpx.post(f"{FASTAPI_URL}/api/users", json={"email": "parity-patch@example.com", "name": "Original", "role": "viewer"}, timeout=5.0)
    assert create.status_code == 201
    user_id = create.json()["id"]
    # PATCH via Spring
    patch_body = {"name": "Patched", "role": "editor"}
    sp = httpx.patch(f"{SPRING_URL}/api/users/{user_id}", json=patch_body, timeout=5.0)
    assert sp.status_code == 200
    # GET via FastAPI (same DB)
    fa = httpx.get(f"{FASTAPI_URL}/api/users/{user_id}", timeout=5.0)
    assert fa.status_code == 200
    assert fa.json()["name"] == sp.json()["name"] == "Patched"
    assert fa.json()["role"] == sp.json()["role"] == "editor"
    # Cleanup
    httpx.delete(f"{FASTAPI_URL}/api/users/{user_id}", timeout=5.0)


def test_users_delete_parity(both_backends_up):
    """Both backends return 204 on DELETE and user is gone."""
    create = httpx.post(f"{FASTAPI_URL}/api/users", json={"email": "parity-del@example.com", "name": "To Del", "role": "viewer"}, timeout=5.0)
    assert create.status_code == 201
    user_id = create.json()["id"]
    d = httpx.delete(f"{SPRING_URL}/api/users/{user_id}", timeout=5.0)
    assert d.status_code == 204
    assert httpx.get(f"{FASTAPI_URL}/api/users/{user_id}", timeout=5.0).status_code == 404


# --- Phase 6, 7, 8, 10: Data elements, data concerns, data feeds, metrics parity ---


def test_data_elements_parity(both_backends_up, fastapi_domains):
    """Both backends return same data elements list."""
    if not fastapi_domains:
        pytest.skip("No domains")
    domain_id = fastapi_domains[0]["id"]
    fa = httpx.get(f"{FASTAPI_URL}/api/data-elements?domain_id={domain_id}&scope=owned", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/data-elements?domain_id={domain_id}&scope=owned", timeout=5.0)
    assert fa.status_code == 200 and sp.status_code == 200
    assert len(fa.json()) == len(sp.json())


def test_data_concerns_parity(both_backends_up, fastapi_domains):
    """Both backends return same data concerns list."""
    if not fastapi_domains:
        pytest.skip("No domains")
    domain_id = fastapi_domains[0]["id"]
    fa = httpx.get(f"{FASTAPI_URL}/api/data-concerns?domain_id={domain_id}", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/data-concerns?domain_id={domain_id}", timeout=5.0)
    assert fa.status_code == 200 and sp.status_code == 200
    assert len(fa.json()) == len(sp.json())


def test_data_feeds_parity(both_backends_up, fastapi_domains):
    """Both backends return same data feeds list."""
    if not fastapi_domains:
        pytest.skip("No domains")
    domain_id = fastapi_domains[0]["id"]
    fa = httpx.get(f"{FASTAPI_URL}/api/data-feeds?domain_id={domain_id}&scope=owned", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/data-feeds?domain_id={domain_id}&scope=owned", timeout=5.0)
    assert fa.status_code == 200 and sp.status_code == 200
    assert len(fa.json()) == len(sp.json())


def test_metrics_parity(both_backends_up):
    """Both backends return same metrics structure."""
    fa = httpx.get(f"{FASTAPI_URL}/api/metrics", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/metrics", timeout=5.0)
    assert fa.status_code == 200 and sp.status_code == 200
    fa_m = fa.json()
    sp_m = sp.json()
    assert fa_m.get("domains_count") == sp_m.get("domains_count")
    assert fa_m.get("data_elements_count") == sp_m.get("data_elements_count")


# --- Phase 9: Data quality parity ---


def test_data_quality_rules_parity(both_backends_up, fastapi_domains):
    """Both backends return same data quality rules list."""
    if not fastapi_domains:
        pytest.skip("No domains")
    domain_id = fastapi_domains[0]["id"]
    fa = httpx.get(f"{FASTAPI_URL}/api/data-quality-rules?domain_id={domain_id}", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/data-quality-rules?domain_id={domain_id}", timeout=5.0)
    assert fa.status_code == 200 and sp.status_code == 200
    assert len(fa.json()) == len(sp.json())


def test_data_quality_exceptions_parity(both_backends_up, fastapi_domains):
    """Both backends return same data quality exceptions list."""
    if not fastapi_domains:
        pytest.skip("No domains")
    domain_id = fastapi_domains[0]["id"]
    fa = httpx.get(f"{FASTAPI_URL}/api/data-quality-exceptions?domain_id={domain_id}", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/data-quality-exceptions?domain_id={domain_id}", timeout=5.0)
    assert fa.status_code == 200 and sp.status_code == 200
    assert len(fa.json()) == len(sp.json())


def test_data_quality_instance_counts_parity(both_backends_up, fastapi_domains):
    """Both backends return same instance counts."""
    if not fastapi_domains:
        pytest.skip("No domains")
    domain_id = fastapi_domains[0]["id"]
    fa = httpx.get(f"{FASTAPI_URL}/api/data-quality-rules/instance-counts?domain_id={domain_id}", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/data-quality-rules/instance-counts?domain_id={domain_id}", timeout=5.0)
    assert fa.status_code == 200 and sp.status_code == 200
    fa_list = fa.json()
    sp_list = sp.json()
    assert len(fa_list) == len(sp_list)


# --- Phase 11: Bulk parity ---


def test_bulk_download_parity(both_backends_up):
    """Both backends return same CSV for bulk download."""
    fa = httpx.get(f"{FASTAPI_URL}/api/bulk/download?entity_type=domains", timeout=5.0)
    sp = httpx.get(f"{SPRING_URL}/api/bulk/download?entity_type=domains", timeout=5.0)
    assert fa.status_code == 200 and sp.status_code == 200
    fa_lines = [line.strip().rstrip("\r") for line in fa.text.strip().split("\n")]
    sp_lines = [line.strip().rstrip("\r") for line in sp.text.strip().split("\n")]
    fa_header = sorted(fa_lines[0].replace('"', "").split(","))
    sp_header = sorted(sp_lines[0].replace('"', "").split(","))
    assert fa_header == sp_header, f"CSV headers should match: FastAPI={fa_header}, Spring={sp_header}"
    assert len(fa_lines) == len(sp_lines), f"Row count should match: FastAPI={len(fa_lines)}, Spring={len(sp_lines)}"


def test_bulk_upload_parity(both_backends_up):
    """Both backends create domains from same CSV upload."""
    import io
    content = "name,description\nParityBulk1,Desc1\nParityBulk2,Desc2"
    fa = httpx.post(
        f"{FASTAPI_URL}/api/bulk/upload",
        data={"entity_type": "domains"},
        files={"file": ("domains.csv", io.BytesIO(content.encode("utf-8")), "text/csv")},
        timeout=5.0,
    )
    sp = httpx.post(
        f"{SPRING_URL}/api/bulk/upload",
        data={"entity_type": "domains"},
        files={"file": ("domains.csv", io.BytesIO(content.encode("utf-8")), "text/csv")},
        timeout=5.0,
    )
    assert fa.status_code == 200 and sp.status_code == 200
    fa_r = fa.json()
    sp_r = sp.json()
    assert fa_r.get("created", 0) + fa_r.get("updated", 0) == sp_r.get("created", 0) + sp_r.get("updated", 0)
