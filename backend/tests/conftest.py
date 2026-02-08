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

from app.config import get_settings
get_settings.cache_clear()

from app.database import get_db_dep
from app.models import Base, User
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
