"""Applications API: list by domain."""
from typing import Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.api.domain_scope import domain_ids_for_scope
from app.models import Application
from app.schemas.application import ApplicationOut

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=list[ApplicationOut])
def list_applications(
    domain_id: int = Query(..., description="Filter by domain"),
    scope: Literal["owned", "upstream", "downstream"] = Query("owned", description="Owned by domain, upstream of domain, or downstream of domain"),
    db: Session = Depends(get_db_dep),
):
    """List applications: owned by domain, or in upstream/downstream domains."""
    domain_ids = domain_ids_for_scope(db, domain_id, scope)
    if not domain_ids:
        return []
    return (
        db.query(Application)
        .filter(Application.domain_id.in_(domain_ids))
        .order_by(Application.name)
        .all()
    )
