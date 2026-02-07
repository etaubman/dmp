"""
Database session and engine for SQLAlchemy.
Creates tables on first use; use get_db() in route dependencies.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager

from app.config import get_settings
from app.models import Base  # noqa: F401 — register all models for create_all


def get_engine():
    """Create SQLAlchemy engine from config (one per process)."""
    settings = get_settings()
    return create_engine(
        settings.database_url,
        pool_pre_ping=True,
        echo=False,  # Set True for SQL logging during debug
    )


# Module-level engine and session factory (created when first imported after config is loaded)
_engine = None
_SessionLocal = None


def get_engine_and_session():
    """Lazy init of engine and SessionLocal so config is loaded first."""
    global _engine, _SessionLocal
    if _engine is None:
        _engine = get_engine()
        Base.metadata.create_all(_engine)
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    return _engine, _SessionLocal


@contextmanager
def get_db():
    """
    Context manager that yields a DB session and closes it when done.
    Use in routes: with get_db() as db: ...
    """
    _, SessionLocal = get_engine_and_session()
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_db_session() -> Session:
    """
    Return a session that the caller must close, or use get_db() for automatic commit/rollback.
    For dependency injection: FastAPI Depends(get_db_session) and close in a finally or use get_db.
    """
    _, SessionLocal = get_engine_and_session()
    return SessionLocal()


def get_db_dep():
    """
    FastAPI dependency: yield a session, commit on success, rollback on error, always close.
    Use as: def route(db: Session = Depends(get_db_dep)):
    """
    _, SessionLocal = get_engine_and_session()
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
