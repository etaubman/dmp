"""Endpoints API: list with optional filter by domain or application."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.models import Endpoint
from app.schemas.endpoint import EndpointOut

router = APIRouter(prefix="/endpoints", tags=["endpoints"])


@router.get("", response_model=list[EndpointOut])
def list_endpoints(
    domain_id: int | None = Query(None, description="Filter by domain"),
    application_id: int | None = Query(None, description="Filter by application"),
    db: Session = Depends(get_db_dep),
):
    """List endpoints; optionally filter by domain or application."""
    q = db.query(Endpoint)
    if domain_id is not None:
        q = q.filter(Endpoint.domain_id == domain_id)
    if application_id is not None:
        q = q.filter(Endpoint.application_id == application_id)
    return q.order_by(Endpoint.name).all()
