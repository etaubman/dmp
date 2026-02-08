"""
Database session and engine for SQLAlchemy.
Creates tables on first use when get_engine_and_session() is called.

Which function to use:
- get_db_dep — Use in FastAPI routes: db: Session = Depends(get_db_dep). Injected session is
  committed on success, rolled back on error, and always closed. Prefer this for all route handlers.
- get_db — Context manager for non-FastAPI code: with get_db() as db: ... Same commit/rollback/close behavior.
- get_db_session — Returns a raw session; caller must commit/rollback and close. Use only when
  you need full control (e.g. long-lived or multi-step scripts); avoid in routes.
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager

from app.config import get_settings
from app.models import Base  # noqa: F401 — register all models for create_all


def ensure_auth_columns(engine):
    """Add password_hash to users if missing (existing DBs created before auth)."""
    try:
        with engine.connect() as conn:
            # PostgreSQL: IF NOT EXISTS; SQLite 3.35+: same. Older SQLite: column may already exist from create_all.
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)"))
            conn.commit()
    except Exception:
        # SQLite or other DBs may not support IF NOT EXISTS or column already exists
        pass


def get_engine():
    """Create SQLAlchemy engine from config (one per process)."""
    settings = get_settings()
    url = settings.database_url
    # SQLite :memory: needs StaticPool so all connections share the same DB (for tests)
    if url and "sqlite" in url:
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False,
        )
    return create_engine(
        url,
        pool_pre_ping=True,
        echo=False,  # Set True for SQL logging during debug
    )


# Module-level engine and session factory (created when first imported after config is loaded)
_engine = None
_SessionLocal = None


def get_engine_and_session():
    """Lazy init of engine and SessionLocal so config is loaded first. On connection failure, leaves state unset so callers can retry."""
    global _engine, _SessionLocal
    if _engine is None:
        try:
            _engine = get_engine()
            Base.metadata.create_all(_engine)
            _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
        except Exception:
            _engine = None
            _SessionLocal = None
            raise
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
