"""
Data Manager Portal — FastAPI app entrypoint.
Phase 1: minimal app so the backend container runs; health endpoint for Docker.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/health")
def health():
    """Health check for Docker and load balancers."""
    return {"status": "ok"}


@app.get("/")
def root():
    """API root; docs at /docs."""
    return {"message": "Data Manager Portal API", "docs": "/docs"}
