"""Data concerns API: list by domain with optional filters."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.models import DataConcern
from app.schemas.data_concern import DataConcernOut

router = APIRouter(prefix="/data-concerns", tags=["data-concerns"])


@router.get("", response_model=list[DataConcernOut])
def list_data_concerns(
    domain_id: int = Query(..., description="Filter by domain"),
    application_id: int | None = Query(None, description="Filter by application"),
    euc_id: int | None = Query(None, description="Filter by EUC"),
    endpoint_id: int | None = Query(None, description="Filter by endpoint"),
    data_element_id: int | None = Query(None, description="Filter by data element"),
    db: Session = Depends(get_db_dep),
):
    """List data concerns for a domain; optionally filter by application, EUC, endpoint, or element."""
    q = db.query(DataConcern).filter(DataConcern.domain_id == domain_id)
    if application_id is not None:
        q = q.filter(DataConcern.application_id == application_id)
    if euc_id is not None:
        q = q.filter(DataConcern.euc_id == euc_id)
    if endpoint_id is not None:
        q = q.filter(DataConcern.endpoint_id == endpoint_id)
    if data_element_id is not None:
        q = q.filter(DataConcern.data_element_id == data_element_id)
    return q.order_by(DataConcern.title).all()
