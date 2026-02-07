"""
Data Manager Portal — FastAPI app entrypoint.
Phase 2: config, DB, S3, routers, seed on startup, health/readiness.
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_engine_and_session, get_db_dep
from app.seed import run_seed
from app.api import domains, data_elements, applications, eucs, endpoints, data_quality, data_concerns, metrics, bulk
from app.api.domains import get_domains_tree_list
from app.schemas.domain import DomainTreeOut

app = FastAPI(
    title="Data Manager Portal API",
    description="Backend for the Data Manager Portal (data governance prototype).",
    version="0.1.0",
)

# CORS for frontend (Angular dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Domain tree at dedicated path so it is never matched by GET /api/domains/{domain_id} (avoids 422 when "tree" was parsed as int)
@app.get("/api/domain-tree", response_model=list[DomainTreeOut])
def api_domain_tree(db: Session = Depends(get_db_dep)):
    """Return domain hierarchy as a tree (L0→L1→L2→L3)."""
    return get_domains_tree_list(db)

# Include routers
app.include_router(domains.router, prefix="/api")
app.include_router(data_elements.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(eucs.router, prefix="/api")
app.include_router(endpoints.router, prefix="/api")
app.include_router(data_quality.router, prefix="/api")
app.include_router(data_concerns.router, prefix="/api")
app.include_router(metrics.router, prefix="/api")
app.include_router(bulk.router, prefix="/api")


@app.on_event("startup")
def startup():
    """Create tables, run seed if needed."""
    get_engine_and_session()  # create tables
    run_seed()


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
