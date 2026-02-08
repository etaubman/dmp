"""Endpoints API: list with optional filter by domain or application."""
from typing import Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.models import Endpoint, Domain
from app.schemas.endpoint import EndpointOut

router = APIRouter(prefix="/endpoints", tags=["endpoints"])


def _domain_ids_for_scope(db: Session, domain_id: int, scope: str) -> list[int]:
    """Resolve domain IDs to filter by: owned (this domain), upstream (parent), downstream (children)."""
    if scope == "owned":
        return [domain_id]
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        return []
    if scope == "upstream":
        return [domain.parent_id] if domain.parent_id else []
    if scope == "downstream":
        return [row[0] for row in db.query(Domain.id).filter(Domain.parent_id == domain_id).all()]
    return [domain_id]


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
        domain_ids = _domain_ids_for_scope(db, domain_id, scope)
        if not domain_ids:
            return []
        q = q.filter(Endpoint.domain_id.in_(domain_ids))
    if application_id is not None:
        q = q.filter(Endpoint.application_id == application_id)
    return q.order_by(Endpoint.name).all()
