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
