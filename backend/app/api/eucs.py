"""EUCs API: list by domain."""
from typing import Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.models import EUC, Domain
from app.schemas.euc import EUCOut

router = APIRouter(prefix="/eucs", tags=["eucs"])


def _domain_ids_for_scope(db: Session, domain_id: int, scope: str) -> list[int]:
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


@router.get("", response_model=list[EUCOut])
def list_eucs(
    domain_id: int = Query(..., description="Filter by domain"),
    scope: Literal["owned", "upstream", "downstream"] = Query("owned", description="Owned by domain, upstream of domain, or downstream of domain"),
    db: Session = Depends(get_db_dep),
):
    """List EUCs: owned by domain, or in upstream/downstream domains."""
    domain_ids = _domain_ids_for_scope(db, domain_id, scope)
    if not domain_ids:
        return []
    return (
        db.query(EUC)
        .filter(EUC.domain_id.in_(domain_ids))
        .order_by(EUC.name)
        .all()
    )
