"""
Pytest fixtures for backend tests. In-memory SQLite with one auth user (no full seed).
"""
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["AUTH_DEV_ALWAYS_LOGGED_IN"] = "0"
os.environ["S3_USE_LOCAL"] = "1"

from app.config import get_settings
get_settings.cache_clear()

from app.database import get_db_dep
from app.models import (
    Base,
    User,
    Domain,
    Application,
    DataElement,
    EUC,
    Endpoint,
    DataQualityRule,
    DataQualityException,
    DataConcern,
    DataElementSOR,
)
from app.auth.local_provider import hash_password
from fastapi.testclient import TestClient

from main import app


def _make_test_db():
    """Create in-memory SQLite with tables and one user (Ethan Taubman / password)."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = Session()
    try:
        user = User(
            email="ethan.taubman@example.com",
            name="Ethan Taubman",
            role="admin",
            password_hash=hash_password("password"),
        )
        db.add(user)
        db.commit()
    finally:
        db.close()
    return engine, Session


def _add_api_seed(db):
    """Add domains and related entities for API route tests."""
    root = Domain(name="Root Domain", description="L0", parent_id=None)
    db.add(root)
    db.flush()
    child = Domain(name="Child Domain", description="L1", parent_id=root.id)
    db.add(child)
    db.flush()
    app1 = Application(domain_id=root.id, name="App One", description="First app")
    db.add(app1)
    db.flush()
    de1 = DataElement(domain_id=root.id, name="Element One", description="DE1", element_type="logical")
    db.add(de1)
    db.flush()
    euc1 = EUC(domain_id=root.id, name="EUC One", description="EUC", euc_type="euc")
    db.add(euc1)
    db.flush()
    ep1 = Endpoint(domain_id=root.id, application_id=app1.id, name="Report One", description="EP1")
    db.add(ep1)
    db.flush()
    rule1 = DataQualityRule(
        domain_id=root.id,
        data_element_id=de1.id,
        endpoint_id=ep1.id,
        name="Rule One",
        rule_type="validity",
    )
    db.add(rule1)
    db.flush()
    exc1 = DataQualityException(rule_id=rule1.id, data_element_id=de1.id, status="open")
    db.add(exc1)
    db.flush()
    concern1 = DataConcern(
        domain_id=root.id,
        title="Concern One",
        application_id=app1.id,
        data_element_id=de1.id,
        status="open",
    )
    db.add(concern1)
    db.flush()
    sor1 = DataElementSOR(
        data_element_id=de1.id,
        application_id=app1.id,
        physical_data_attribute="attr_one",
    )
    db.add(sor1)
    db.commit()


@pytest.fixture
def client():
    """TestClient with DB override: in-memory SQLite with one user."""
    engine, SessionLocal = _make_test_db()

    def override_get_db():
        db = SessionLocal()
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    app.dependency_overrides[get_db_dep] = override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def client_with_seed():
    """TestClient with DB override: in-memory SQLite with one user + domains, app, data elements, etc."""
    engine, SessionLocal = _make_test_db()
    db = SessionLocal()
    try:
        _add_api_seed(db)
    finally:
        db.close()

    def override_get_db():
        db = SessionLocal()
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    app.dependency_overrides[get_db_dep] = override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()
