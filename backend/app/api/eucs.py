"""EUCs API: list by domain."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.models import EUC
from app.schemas.euc import EUCOut

router = APIRouter(prefix="/eucs", tags=["eucs"])


@router.get("", response_model=list[EUCOut])
def list_eucs(
    domain_id: int = Query(..., description="Filter by domain"),
    db: Session = Depends(get_db_dep),
):
    """List all EUCs (End User Computing / ITESS) for a domain."""
    return (
        db.query(EUC)
        .filter(EUC.domain_id == domain_id)
        .order_by(EUC.name)
        .all()
    )
