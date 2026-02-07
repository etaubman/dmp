"""Critical Data Elements API: list by domain."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.models import DataElement
from app.schemas.data_element import DataElementOut

router = APIRouter(prefix="/data-elements", tags=["data-elements"])


@router.get("", response_model=list[DataElementOut])
def list_data_elements(
    domain_id: int = Query(..., description="Filter by domain"),
    db: Session = Depends(get_db_dep),
):
    """List all Critical Data Elements for a domain."""
    return (
        db.query(DataElement)
        .filter(DataElement.domain_id == domain_id)
        .order_by(DataElement.name)
        .all()
    )
