"""Metrics API: counts/summaries for the metrics view."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db_dep
from app.models import (
    Domain,
    DataElement,
    Application,
    EUC,
    Endpoint,
    DataQualityRule,
    DataQualityException,
    DataConcern,
)
from app.schemas.metrics import MetricsOut

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("", response_model=MetricsOut)
def get_metrics(
    domain_id: int | None = Query(None, description="Scope to domain; if omitted, global counts"),
    db: Session = Depends(get_db_dep),
):
    """Return counts for attestation, concerns, DQ rules, DQ exceptions, and entity counts."""
    out = MetricsOut(domain_id=domain_id)

    if domain_id is None:
        out.domains_count = db.query(func.count(Domain.id)).scalar() or 0
        out.data_elements_count = db.query(func.count(DataElement.id)).scalar() or 0
        out.applications_count = db.query(func.count(Application.id)).scalar() or 0
        out.eucs_count = db.query(func.count(EUC.id)).scalar() or 0
        out.endpoints_count = db.query(func.count(Endpoint.id)).scalar() or 0
        out.data_quality_rules_count = db.query(func.count(DataQualityRule.id)).scalar() or 0
        out.data_quality_exceptions_count = (
            db.query(func.count(DataQualityException.id)).scalar() or 0
        )
        out.data_concerns_count = db.query(func.count(DataConcern.id)).scalar() or 0
    else:
        out.data_elements_count = (
            db.query(func.count(DataElement.id)).filter(DataElement.domain_id == domain_id).scalar() or 0
        )
        out.applications_count = (
            db.query(func.count(Application.id)).filter(Application.domain_id == domain_id).scalar() or 0
        )
        out.eucs_count = (
            db.query(func.count(EUC.id)).filter(EUC.domain_id == domain_id).scalar() or 0
        )
        out.endpoints_count = (
            db.query(func.count(Endpoint.id)).filter(Endpoint.domain_id == domain_id).scalar() or 0
        )
        out.data_quality_rules_count = (
            db.query(func.count(DataQualityRule.id))
            .filter(DataQualityRule.domain_id == domain_id)
            .scalar() or 0
        )
        out.data_quality_exceptions_count = (
            db.query(func.count(DataQualityException.id))
            .join(
                DataQualityRule, DataQualityException.rule_id == DataQualityRule.id
            )
            .filter(DataQualityRule.domain_id == domain_id)
            .scalar() or 0
        )
        out.data_concerns_count = (
            db.query(func.count(DataConcern.id)).filter(DataConcern.domain_id == domain_id).scalar() or 0
        )

    return out
