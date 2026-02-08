"""Data quality rules, exceptions, instances, SQL versions, performance, and actions API."""
import sqlparse
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from app.database import get_db_dep
from app.api.helpers import get_or_404
from app.models import (
    DataQualityRule,
    DataQualityException,
    DataQualityRuleInstance,
    DataQualitySqlVersion,
    RuleModRequest,
    Application,
)
from app.schemas.data_quality import (
    DataQualityRuleOut,
    DataQualityRuleCreate,
    DataQualityRuleUpdate,
    DataQualityExceptionOut,
    DataQualityRuleInstanceCreate,
    DataQualityRuleInstanceOut,
    DataQualityRuleInstanceDetailOut,
    DataQualitySqlVersionCreate,
    DataQualitySqlVersionOut,
    DQPerformanceSummary,
    DQTrendPoint,
    DQTrendResponse,
    RuleModRequestOut,
    RuleInstanceCountOut,
    _instance_from_orm,
)

router = APIRouter(tags=["data-quality"])


def _prettify_sql(sql: str | None) -> str | None:
    if not sql or not sql.strip():
        return sql
    return sqlparse.format(
        sql.strip(),
        reindent=True,
        keyword_case="upper",
        strip_comments=False,
    )


# --- Rule instances (declare first so /instances is matched before /{rule_id}) ---
@router.get("/data-quality-rules/instances", response_model=list[DataQualityRuleInstanceOut])
def list_rule_instances(
    rule_id: int | None = Query(None),
    data_element_id: int | None = Query(None),
    application_id: int | None = Query(None),
    from_date: str | None = Query(None, alias="from"),
    to_date: str | None = Query(None, alias="to"),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db_dep),
):
    """List rule instances (runs) with optional filters."""
    q = db.query(DataQualityRuleInstance)
    if rule_id is not None:
        q = q.filter(DataQualityRuleInstance.rule_id == rule_id)
    if data_element_id is not None:
        q = q.filter(DataQualityRuleInstance.data_element_id == data_element_id)
    if application_id is not None:
        q = q.filter(DataQualityRuleInstance.application_id == application_id)
    if from_date:
        q = q.filter(DataQualityRuleInstance.run_at >= from_date)
    if to_date:
        q = q.filter(DataQualityRuleInstance.run_at <= to_date)
    rows = q.order_by(desc(DataQualityRuleInstance.run_at)).limit(limit).all()
    return [_instance_from_orm(r) for r in rows]


@router.post("/data-quality-rules/instances", response_model=DataQualityRuleInstanceOut)
def create_rule_instance(body: DataQualityRuleInstanceCreate, db: Session = Depends(get_db_dep)):
    """Create a rule instance (record a run)."""
    get_or_404(db, DataQualityRule, body.rule_id, "Rule not found")
    get_or_404(db, Application, body.application_id, "Application not found")
    inst = DataQualityRuleInstance(
        rule_id=body.rule_id,
        data_element_id=body.data_element_id,
        application_id=body.application_id,
        passed=1 if body.passed else 0,
        exception_count=body.exception_count,
        exception_pct=body.exception_pct,
        notes=body.notes,
        sql_version_id=body.sql_version_id,
    )
    db.add(inst)
    db.flush()
    return _instance_from_orm(inst)


@router.get(
    "/data-quality-rules/instances/{instance_id}",
    response_model=DataQualityRuleInstanceDetailOut,
)
def get_rule_instance(
    instance_id: int,
    prettify: bool = Query(True, description="Include prettified SQL"),
    db: Session = Depends(get_db_dep),
):
    """Get a rule instance with the SQL that was run (optionally prettified)."""
    inst = get_or_404(db, DataQualityRuleInstance, instance_id, "Rule instance not found")
    sql_text: str | None = None
    sql_text_prettified: str | None = None
    if inst.sql_version_id:
        sv = db.query(DataQualitySqlVersion).filter(
            DataQualitySqlVersion.id == inst.sql_version_id
        ).first()
        if sv:
            sql_text = sv.sql_text
            sql_text_prettified = _prettify_sql(sv.sql_text) if prettify else None
    else:
        live = (
            db.query(DataQualitySqlVersion)
            .filter(
                and_(
                    DataQualitySqlVersion.rule_id == inst.rule_id,
                    DataQualitySqlVersion.is_live == 1,
                )
            )
            .first()
        )
        if live:
            sql_text = live.sql_text
            sql_text_prettified = _prettify_sql(live.sql_text) if prettify else None
    out = _instance_from_orm(inst)
    return DataQualityRuleInstanceDetailOut(
        **out.model_dump(),
        sql_text=sql_text,
        sql_text_prettified=sql_text_prettified,
    )


@router.patch("/data-quality-rules/instances/{instance_id}/false-positive")
def mark_instance_false_positive(
    instance_id: int, db: Session = Depends(get_db_dep)
) -> dict:
    """Mark a rule instance as false positive."""
    inst = get_or_404(db, DataQualityRuleInstance, instance_id, "Rule instance not found")
    inst.marked_false_positive = 1
    return {"id": inst.id, "marked_false_positive": True}


# --- Rules list and CRUD ---
@router.get("/data-quality-rules", response_model=list[DataQualityRuleOut])
def list_data_quality_rules(
    domain_id: int | None = Query(None, description="Filter by domain"),
    data_element_id: int | None = Query(None, description="Filter by data element"),
    endpoint_id: int | None = Query(None, description="Filter by endpoint"),
    db: Session = Depends(get_db_dep),
):
    """List data quality rules; optionally filter by domain, data element, or endpoint."""
    q = db.query(DataQualityRule)
    if domain_id is not None:
        q = q.filter(DataQualityRule.domain_id == domain_id)
    if data_element_id is not None:
        q = q.filter(DataQualityRule.data_element_id == data_element_id)
    if endpoint_id is not None:
        q = q.filter(DataQualityRule.endpoint_id == endpoint_id)
    return q.order_by(DataQualityRule.name).all()


@router.get(
    "/data-quality-rules/instance-counts",
    response_model=list[RuleInstanceCountOut],
)
def list_rule_instance_counts(
    domain_id: int = Query(..., description="Filter by domain"),
    db: Session = Depends(get_db_dep),
):
    """Return instance count and last run pass/fail per rule in the domain (for grid badge and health)."""
    rules = (
        db.query(DataQualityRule.id)
        .filter(DataQualityRule.domain_id == domain_id)
        .all()
    )
    rule_ids = [r.id for r in rules]
    if not rule_ids:
        return []
    out = []
    for rid in rule_ids:
        latest = (
            db.query(DataQualityRuleInstance)
            .filter(DataQualityRuleInstance.rule_id == rid)
            .order_by(desc(DataQualityRuleInstance.run_at))
            .first()
        )
        count = (
            db.query(DataQualityRuleInstance)
            .filter(DataQualityRuleInstance.rule_id == rid)
            .count()
        )
        out.append(
            RuleInstanceCountOut(
                rule_id=rid,
                instance_count=count,
                last_passed=bool(latest.passed) if latest else None,
            )
        )
    return out


@router.post("/data-quality-rules", response_model=DataQualityRuleOut)
def create_data_quality_rule(body: DataQualityRuleCreate, db: Session = Depends(get_db_dep)):
    """Create a data quality rule."""
    r = DataQualityRule(
        domain_id=body.domain_id,
        data_element_id=body.data_element_id,
        endpoint_id=body.endpoint_id,
        name=body.name,
        description=body.description,
        rule_type=body.rule_type,
        exception_threshold_pct=body.exception_threshold_pct,
        flagged_for_monitoring=1 if body.flagged_for_monitoring else 0,
    )
    db.add(r)
    db.flush()
    return r


@router.patch("/data-quality-rules/{rule_id}", response_model=DataQualityRuleOut)
def update_data_quality_rule(
    rule_id: int, body: DataQualityRuleUpdate, db: Session = Depends(get_db_dep)
):
    """Update a data quality rule."""
    r = get_or_404(db, DataQualityRule, rule_id, "Data quality rule not found")
    if body.name is not None:
        r.name = body.name
    if body.description is not None:
        r.description = body.description
    if body.rule_type is not None:
        r.rule_type = body.rule_type
    if body.exception_threshold_pct is not None:
        r.exception_threshold_pct = body.exception_threshold_pct
    if body.flagged_for_monitoring is not None:
        r.flagged_for_monitoring = 1 if body.flagged_for_monitoring else 0
    return r


# --- Rule by id (after /instances so path is not captured as rule_id) ---
@router.get("/data-quality-rules/{rule_id}", response_model=DataQualityRuleOut)
def get_data_quality_rule(rule_id: int, db: Session = Depends(get_db_dep)):
    """Get a single data quality rule by id."""
    return get_or_404(db, DataQualityRule, rule_id, "Data quality rule not found")


# --- Exceptions list and false-positive ---
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


@router.patch("/data-quality-exceptions/{exception_id}/false-positive")
def mark_exception_false_positive(
    exception_id: int, db: Session = Depends(get_db_dep)
) -> dict:
    """Mark a data quality exception as false positive."""
    exc = get_or_404(db, DataQualityException, exception_id, "Exception not found")
    exc.is_false_positive = 1
    from datetime import datetime, timezone
    exc.marked_at = datetime.now(timezone.utc)
    return {"id": exc.id, "is_false_positive": True}


# --- SQL versions ---
@router.get(
    "/data-quality-rules/{rule_id}/sql-versions",
    response_model=list[DataQualitySqlVersionOut],
)
def list_sql_versions(rule_id: int, db: Session = Depends(get_db_dep)):
    """List SQL versions for a rule (one can be live)."""
    get_or_404(db, DataQualityRule, rule_id, "Rule not found")
    return (
        db.query(DataQualitySqlVersion)
        .filter(DataQualitySqlVersion.rule_id == rule_id)
        .order_by(DataQualitySqlVersion.version.desc())
        .all()
    )


@router.post(
    "/data-quality-rules/{rule_id}/sql-versions",
    response_model=DataQualitySqlVersionOut,
)
def create_sql_version(
    rule_id: int,
    body: DataQualitySqlVersionCreate,
    db: Session = Depends(get_db_dep),
):
    """Add a new SQL version for a rule. If is_live=True, unset other live."""
    get_or_404(db, DataQualityRule, rule_id, "Rule not found")
    max_v = (
        db.query(DataQualitySqlVersion)
        .filter(DataQualitySqlVersion.rule_id == rule_id)
        .count()
    )
    version = body.version if body.version is not None else max_v + 1
    if body.is_live:
        db.query(DataQualitySqlVersion).filter(
            DataQualitySqlVersion.rule_id == rule_id
        ).update({DataQualitySqlVersion.is_live: 0})
    sv = DataQualitySqlVersion(
        rule_id=rule_id,
        sql_text=body.sql_text,
        version=version,
        is_live=1 if body.is_live else 0,
    )
    db.add(sv)
    db.flush()
    return sv


@router.patch("/data-quality-rules/{rule_id}/sql-versions/{version_id}/live")
def set_sql_version_live(
    rule_id: int, version_id: int, db: Session = Depends(get_db_dep)
) -> dict:
    """Set a SQL version as the live one (unsets others)."""
    get_or_404(db, DataQualityRule, rule_id, "Rule not found")
    sv = get_or_404(db, DataQualitySqlVersion, version_id, "SQL version not found")
    if sv.rule_id != rule_id:
        from fastapi import HTTPException
        raise HTTPException(400, "SQL version does not belong to this rule")
    db.query(DataQualitySqlVersion).filter(
        DataQualitySqlVersion.rule_id == rule_id
    ).update({DataQualitySqlVersion.is_live: 0})
    sv.is_live = 1
    return {"id": sv.id, "is_live": True}


# --- Performance and trend ---
@router.get(
    "/data-quality-rules/{rule_id}/performance",
    response_model=DQPerformanceSummary,
)
def get_rule_performance(
    rule_id: int,
    data_element_id: int | None = Query(None),
    application_id: int | None = Query(None),
    db: Session = Depends(get_db_dep),
):
    """Current performance for a rule (optionally scoped by element and application)."""
    r = get_or_404(db, DataQualityRule, rule_id, "Rule not found")
    q = (
        db.query(DataQualityRuleInstance)
        .filter(DataQualityRuleInstance.rule_id == rule_id)
        .order_by(desc(DataQualityRuleInstance.run_at))
    )
    if data_element_id is not None:
        q = q.filter(DataQualityRuleInstance.data_element_id == data_element_id)
    if application_id is not None:
        q = q.filter(DataQualityRuleInstance.application_id == application_id)
    instances = q.limit(10).all()
    last = instances[0] if instances else None
    app_id = application_id if application_id is not None else (last.application_id if last else None)
    if app_id is None and r.endpoint_id:
        from app.models import Endpoint
        ep = db.query(Endpoint).filter(Endpoint.id == r.endpoint_id).first()
        app_id = ep.application_id if ep else None
    return DQPerformanceSummary(
        rule_id=rule_id,
        data_element_id=data_element_id if data_element_id is not None else r.data_element_id,
        application_id=app_id or 0,
        last_run_at=last.run_at if last else None,
        last_passed=bool(last.passed) if last else None,
        last_exception_pct=last.exception_pct if last else None,
        threshold_pct=r.exception_threshold_pct,
        recent_runs=[_instance_from_orm(i) for i in instances],
    )


@router.get(
    "/data-quality-rules/{rule_id}/performance/trend",
    response_model=DQTrendResponse,
)
def get_rule_performance_trend(
    rule_id: int,
    data_element_id: int | None = Query(None),
    application_id: int | None = Query(None),
    from_date: str | None = Query(None, alias="from"),
    to_date: str | None = Query(None, alias="to"),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db_dep),
):
    """Trend of rule runs over time (for charts)."""
    get_or_404(db, DataQualityRule, rule_id, "Rule not found")
    q = (
        db.query(DataQualityRuleInstance)
        .filter(DataQualityRuleInstance.rule_id == rule_id)
        .order_by(DataQualityRuleInstance.run_at)
    )
    if data_element_id is not None:
        q = q.filter(DataQualityRuleInstance.data_element_id == data_element_id)
    if application_id is not None:
        q = q.filter(DataQualityRuleInstance.application_id == application_id)
    if from_date:
        q = q.filter(DataQualityRuleInstance.run_at >= from_date)
    if to_date:
        q = q.filter(DataQualityRuleInstance.run_at <= to_date)
    rows = q.order_by(desc(DataQualityRuleInstance.run_at)).limit(limit).all()
    points = [
        DQTrendPoint(
            run_at=r.run_at,
            passed=bool(r.passed),
            exception_pct=r.exception_pct,
            exception_count=r.exception_count or 0,
        )
        for r in reversed(rows)
    ]
    app_id = application_id if application_id is not None else (rows[0].application_id if rows else 0)
    de_id = data_element_id if data_element_id is not None else (rows[0].data_element_id if rows else None)
    return DQTrendResponse(
        rule_id=rule_id,
        data_element_id=de_id,
        application_id=app_id,
        points=points,
    )


# --- Request rule mod and flag for monitoring ---
@router.post("/data-quality-rules/{rule_id}/request-mod", response_model=RuleModRequestOut)
def request_rule_mod(
    rule_id: int,
    requested_by: int | None = Query(None),
    db: Session = Depends(get_db_dep),
):
    """Request a modification for a rule (e.g. when it fails regularly)."""
    r = get_or_404(db, DataQualityRule, rule_id, "Rule not found")
    req = RuleModRequest(rule_id=rule_id, status="requested", requested_by=requested_by)
    db.add(req)
    db.flush()
    return req


@router.get("/data-quality-rules/{rule_id}/mod-requests", response_model=list[RuleModRequestOut])
def list_rule_mod_requests(rule_id: int, db: Session = Depends(get_db_dep)):
    """List mod requests for a rule."""
    get_or_404(db, DataQualityRule, rule_id, "Rule not found")
    return (
        db.query(RuleModRequest)
        .filter(RuleModRequest.rule_id == rule_id)
        .order_by(desc(RuleModRequest.requested_at))
        .all()
    )


@router.patch("/data-quality-rules/{rule_id}/flag-monitoring")
def flag_rule_for_monitoring(
    rule_id: int,
    flagged: bool = Query(True),
    db: Session = Depends(get_db_dep),
) -> dict:
    """Flag (or unflag) a rule for monitoring."""
    r = get_or_404(db, DataQualityRule, rule_id, "Rule not found")
    r.flagged_for_monitoring = 1 if flagged else 0
    return {"id": r.id, "flagged_for_monitoring": bool(r.flagged_for_monitoring)}
