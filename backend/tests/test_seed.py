"""
Tests for seed data loading from seed-data/*.json and run_seed().
Uses an in-memory SQLite DB created in the test (not the app-global engine).
"""
import os
import pytest
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["AUTH_DEV_ALWAYS_LOGGED_IN"] = "0"
os.environ["S3_USE_LOCAL"] = "1"

from app.config import get_settings
get_settings.cache_clear()

from app.models import (
    Base,
    SeedFlag,
    User,
    Domain,
    Application,
    DataElement,
    EUC,
    Endpoint,
    DataFeed,
    DataQualityRule,
    DataQualityException,
    DataConcern,
)
from app.seed_loader import (
    get_seed_data_dir,
    load_json,
    add_domains_from_file,
    add_users_from_file,
    add_domain_data_from_file,
    load_all_domain_data,
    DOMAIN_SEED_FILES,
)
from app.seed import run_seed, reset_and_reseed, SEED_DEFAULT_PASSWORD


def _make_fresh_db():
    """Create a new in-memory SQLite engine and session with tables; no seed data."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine, Session


def test_seed_data_dir_exists():
    """Seed-data directory exists and contains expected JSON files."""
    seed_dir = get_seed_data_dir()
    assert seed_dir.is_dir(), f"seed-data dir not found: {seed_dir}"
    assert (seed_dir / "domains.json").exists()
    assert (seed_dir / "users.json").exists()
    for f in DOMAIN_SEED_FILES:
        assert (seed_dir / f).exists(), f"Missing {f}"


def test_load_json_domains():
    """domains.json loads and has L0/L1/L2 structure."""
    data = load_json("domains.json")
    assert isinstance(data, list)
    names = [r["name"] for r in data]
    assert "L0 Markets" in names
    assert "L0 Banking" in names
    assert "L1 Equities" in names
    assert "L1 Commercial Banking" in names
    assert "L2 Equities Cash" in names


def test_load_json_users():
    """users.json loads and has default users."""
    data = load_json("users.json")
    assert isinstance(data, list)
    assert any(u["email"] == "ethan.taubman@example.com" for u in data)
    assert any(u["role"] == "admin" for u in data)


def test_add_domains_from_file():
    """add_domains_from_file creates domains and returns name -> id map."""
    _, Session = _make_fresh_db()
    db = Session()
    try:
        name_to_id = add_domains_from_file(db)
        db.commit()
        assert "L0 Markets" in name_to_id
        assert "L1 Equities" in name_to_id
        assert "L2 Agriculture" in name_to_id
        assert db.query(Domain).count() == 12
    finally:
        db.close()


def test_add_users_from_file():
    """add_users_from_file creates users when table is empty."""
    _, Session = _make_fresh_db()
    db = Session()
    try:
        add_users_from_file(db, SEED_DEFAULT_PASSWORD)
        db.commit()
        assert db.query(User).count() == 7
        u = db.query(User).filter(User.email == "ethan.taubman@example.com").first()
        assert u is not None
        assert u.role == "admin"
        assert u.password_hash is not None
    finally:
        db.close()


def test_add_users_from_file_skips_when_users_exist():
    """add_users_from_file does not add users if table already has rows."""
    _, Session = _make_fresh_db()
    db = Session()
    try:
        db.add(User(email="existing@example.com", name="Existing", role="viewer", password_hash="x"))
        db.commit()
        add_users_from_file(db, SEED_DEFAULT_PASSWORD)
        db.commit()
        assert db.query(User).count() == 1
    finally:
        db.close()


def test_load_all_domain_data():
    """load_all_domain_data creates applications, data elements, endpoints, rules, feeds."""
    _, Session = _make_fresh_db()
    db = Session()
    try:
        name_to_id = add_domains_from_file(db)
        db.commit()
        load_all_domain_data(db, name_to_id)
        db.commit()

        assert db.query(Application).count() > 0
        assert db.query(DataElement).count() > 0
        assert db.query(Endpoint).count() > 0
        assert db.query(DataQualityRule).count() > 0
        assert db.query(DataFeed).count() > 0
        assert db.query(DataConcern).count() > 0
        assert db.query(DataQualityException).count() > 0

        # L1 Equities has specific apps
        equities_domain_id = name_to_id["L1 Equities"]
        apps = db.query(Application).filter(Application.domain_id == equities_domain_id).all()
        app_names = [a.name for a in apps]
        assert "Equity Order Management System (OMS)" in app_names
    finally:
        db.close()


def test_run_seed_idempotent():
    """run_seed with app DB: use in-memory and reset module engine so run_seed uses it."""
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    get_settings.cache_clear()
    import app.database as db_module
    db_module._engine = None
    db_module._SessionLocal = None

    run_seed()
    engine, SessionLocal = db_module.get_engine_and_session()
    db = SessionLocal()
    try:
        assert db.query(SeedFlag).first() is not None
        assert db.query(Domain).count() == 12
        assert db.query(User).count() == 7
        assert db.query(Application).count() > 0
    finally:
        db.close()

    # Second run should be no-op (already seeded)
    run_seed()
    db2 = SessionLocal()
    try:
        assert db2.query(Domain).count() == 12
        assert db2.query(Application).count() == db.query(Application).count()
    finally:
        db2.close()


def test_reset_and_reseed():
    """reset_and_reseed wipes domain-related data and re-seeds from files."""
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    get_settings.cache_clear()
    import app.database as db_module
    db_module._engine = None
    db_module._SessionLocal = None

    run_seed()
    _, SessionLocal = db_module.get_engine_and_session()
    db = SessionLocal()
    try:
        domain_count = db.query(Domain).count()
        app_count = db.query(Application).count()
        assert domain_count == 12
        assert app_count > 0
    finally:
        db.close()

    reset_and_reseed()
    db2 = SessionLocal()
    try:
        assert db2.query(SeedFlag).first() is not None
        assert db2.query(Domain).count() == domain_count
        assert db2.query(Application).count() == app_count
    finally:
        db2.close()
