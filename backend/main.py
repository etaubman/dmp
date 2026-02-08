"""
Data Manager Portal — FastAPI app entrypoint.
App composition: middleware, router inclusion, health/readiness. Route handlers live in app.api routers.
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import get_engine_and_session, ensure_dq_schema
from app.api import domains, users, data_elements, applications, eucs, endpoints, data_feeds, data_quality, data_concerns, metrics, bulk
from app.auth import router as auth_router

app = FastAPI(
    title="Data Manager Portal API",
    description="Backend for the Data Manager Portal (data governance prototype).",
    version="0.1.0",
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers: all API routes live in their modules (no inline routes here)
app.include_router(auth_router, prefix="/api")
app.include_router(domains.domain_tree_router, prefix="/api")
app.include_router(domains.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(data_elements.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(eucs.router, prefix="/api")
app.include_router(endpoints.router, prefix="/api")
app.include_router(data_feeds.router, prefix="/api")
app.include_router(data_quality.router, prefix="/api")
app.include_router(data_concerns.router, prefix="/api")
app.include_router(metrics.router, prefix="/api")
app.include_router(bulk.router, prefix="/api")


@app.on_event("startup")
def startup():
    """Create tables, add auth columns if missing; optionally run seed (see config.seed_on_startup)."""
    from app.database import ensure_auth_columns
    from app.seed import run_seed, ensure_all_users_have_passwords
    try:
        engine, _ = get_engine_and_session()
        ensure_auth_columns(engine)
        ensure_dq_schema(engine)
        if settings.seed_on_startup:
            run_seed()
            ensure_all_users_have_passwords()
    except Exception as e:
        logging.getLogger("uvicorn.error").warning(
            "Startup: DB unavailable (%s). Server will run; /ready will be 503 until Postgres is up.",
            e,
        )


@app.get("/health")
def health():
    """Health check for Docker and load balancers."""
    return {"status": "ok"}


@app.get("/ready")
def ready():
    """Readiness: DB connectivity (and optionally S3)."""
    from sqlalchemy import text
    from fastapi.responses import JSONResponse
    try:
        engine, _ = get_engine_and_session()
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        return JSONResponse(
            content={"status": "not ready", "error": str(e)},
            status_code=503,
        )
    return {"status": "ready"}


@app.get("/")
def root():
    """API root; docs at /docs."""
    return {"message": "Data Manager Portal API", "docs": "/docs"}
