"""Endpoints API: list with optional filter by domain or application."""
from typing import Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.api.domain_scope import domain_ids_for_scope
from app.models import Endpoint
from app.schemas.endpoint import EndpointOut

router = APIRouter(prefix="/endpoints", tags=["endpoints"])


@router.get("", response_model=list[EndpointOut])
def list_endpoints(
    domain_id: int | None = Query(None, description="Filter by domain"),
    application_id: int | None = Query(None, description="Filter by application"),
    scope: Literal["owned", "upstream", "downstream"] = Query("owned", description="Owned by domain, upstream of domain, or downstream of domain"),
    db: Session = Depends(get_db_dep),
):
    """List endpoints; optionally filter by domain/application and scope."""
    q = db.query(Endpoint)
    if domain_id is not None:
        domain_ids = domain_ids_for_scope(db, domain_id, scope)
        if not domain_ids:
            return []
        q = q.filter(Endpoint.domain_id.in_(domain_ids))
    if application_id is not None:
        q = q.filter(Endpoint.application_id == application_id)
    return q.order_by(Endpoint.name).all()
