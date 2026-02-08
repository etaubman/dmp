"""EUCs API: list by domain."""
from typing import Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.api.domain_scope import domain_ids_for_scope
from app.models import EUC
from app.schemas.euc import EUCOut

router = APIRouter(prefix="/eucs", tags=["eucs"])


@router.get("", response_model=list[EUCOut])
def list_eucs(
    domain_id: int = Query(..., description="Filter by domain"),
    scope: Literal["owned", "upstream", "downstream"] = Query("owned", description="Owned by domain, upstream of domain, or downstream of domain"),
    db: Session = Depends(get_db_dep),
):
    """List EUCs: owned by domain, or in upstream/downstream domains."""
    domain_ids = domain_ids_for_scope(db, domain_id, scope)
    if not domain_ids:
        return []
    return (
        db.query(EUC)
        .filter(EUC.domain_id.in_(domain_ids))
        .order_by(EUC.name)
        .all()
    )
