"""Data quality rules and exceptions API."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.models import DataQualityRule, DataQualityException
from app.schemas.data_quality import DataQualityRuleOut, DataQualityExceptionOut

router = APIRouter(tags=["data-quality"])


@router.get("/data-quality-rules", response_model=list[DataQualityRuleOut])
def list_data_quality_rules(
    domain_id: int | None = Query(None, description="Filter by domain"),
    data_element_id: int | None = Query(None, description="Filter by data element"),
    db: Session = Depends(get_db_dep),
):
    """List data quality rules; optionally filter by domain or data element."""
    q = db.query(DataQualityRule)
    if domain_id is not None:
        q = q.filter(DataQualityRule.domain_id == domain_id)
    if data_element_id is not None:
        q = q.filter(DataQualityRule.data_element_id == data_element_id)
    return q.order_by(DataQualityRule.name).all()


@router.get("/data-quality-exceptions", response_model=list[DataQualityExceptionOut])
def list_data_quality_exceptions(
    domain_id: int | None = Query(None, description="Filter by domain (via rule)"),
    data_element_id: int | None = Query(None, description="Filter by data element"),
    db: Session = Depends(get_db_dep),
):
    """List data quality exceptions; optionally filter by domain or data element."""
    q = db.query(DataQualityException)
    if domain_id is not None:
        q = q.join(
            DataQualityRule, DataQualityException.rule_id == DataQualityRule.id
        ).filter(DataQualityRule.domain_id == domain_id)
    if data_element_id is not None:
        q = q.filter(DataQualityException.data_element_id == data_element_id)
    return q.order_by(DataQualityException.identified_at.desc()).all()
