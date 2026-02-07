"""Applications API: list by domain."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.models import Application
from app.schemas.application import ApplicationOut

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=list[ApplicationOut])
def list_applications(
    domain_id: int = Query(..., description="Filter by domain"),
    db: Session = Depends(get_db_dep),
):
    """List all applications for a domain."""
    return (
        db.query(Application)
        .filter(Application.domain_id == domain_id)
        .order_by(Application.name)
        .all()
    )
