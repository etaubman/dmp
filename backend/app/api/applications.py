"""Applications API: list by domain."""
from typing import Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.models import Application, Domain
from app.schemas.application import ApplicationOut

router = APIRouter(prefix="/applications", tags=["applications"])


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


@router.get("", response_model=list[ApplicationOut])
def list_applications(
    domain_id: int = Query(..., description="Filter by domain"),
    scope: Literal["owned", "upstream", "downstream"] = Query("owned", description="Owned by domain, upstream of domain, or downstream of domain"),
    db: Session = Depends(get_db_dep),
):
    """List applications: owned by domain, or in upstream/downstream domains."""
    domain_ids = _domain_ids_for_scope(db, domain_id, scope)
    if not domain_ids:
        return []
    return (
        db.query(Application)
        .filter(Application.domain_id.in_(domain_ids))
        .order_by(Application.name)
        .all()
    )
