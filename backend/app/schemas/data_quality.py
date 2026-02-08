"""Schemas for data quality rules, exceptions, instances, SQL versions, performance, and actions."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal, Any
from datetime import datetime


# --- Rule type enum for validation ---
RuleTypeEnum = Literal["accuracy", "validity", "timeliness"]


class DataQualityRuleBase(BaseModel):
    domain_id: Optional[int] = None
    data_element_id: Optional[int] = None
    endpoint_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    rule_type: Optional[RuleTypeEnum] = None
    exception_threshold_pct: Optional[int] = Field(None, ge=0, le=100)
    flagged_for_monitoring: bool = False


class DataQualityRuleCreate(DataQualityRuleBase):
    pass


class DataQualityRuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    rule_type: Optional[RuleTypeEnum] = None
    exception_threshold_pct: Optional[int] = Field(None, ge=0, le=100)
    flagged_for_monitoring: Optional[bool] = None


class DataQualityRuleOut(DataQualityRuleBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_validator("flagged_for_monitoring", mode="before")
    @classmethod
    def coerce_flag(cls, v: Any) -> bool:
        if v is None:
            return False
        return bool(v)

    class Config:
        from_attributes = True


# --- Exception ---
class DataQualityExceptionBase(BaseModel):
    rule_id: int
    data_element_id: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None


class DataQualityExceptionCreate(DataQualityExceptionBase):
    pass


class DataQualityExceptionOut(DataQualityExceptionBase):
    id: int
    is_false_positive: bool = False
    marked_at: Optional[datetime] = None
    marked_by: Optional[int] = None
    identified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    @field_validator("is_false_positive", mode="before")
    @classmethod
    def coerce_fp(cls, v: Any) -> bool:
        if v is None:
            return False
        return bool(v)

    class Config:
        from_attributes = True


def _exception_from_orm(obj) -> DataQualityExceptionOut:
    return DataQualityExceptionOut(
        id=obj.id,
        rule_id=obj.rule_id,
        data_element_id=obj.data_element_id,
        description=obj.description,
        status=obj.status,
        is_false_positive=bool(getattr(obj, "is_false_positive", 0)),
        marked_at=getattr(obj, "marked_at", None),
        marked_by=getattr(obj, "marked_by", None),
        identified_at=obj.identified_at,
        created_at=obj.created_at,
    )


# --- Rule Instance ---
class DataQualityRuleInstanceCreate(BaseModel):
    rule_id: int
    data_element_id: Optional[int] = None
    application_id: int
    passed: bool = True
    exception_count: int = 0
    exception_pct: Optional[int] = Field(None, ge=0, le=100)
    notes: Optional[str] = None
    sql_version_id: Optional[int] = None


class DataQualityRuleInstanceOut(BaseModel):
    id: int
    rule_id: int
    data_element_id: Optional[int] = None
    application_id: int
    run_at: datetime
    passed: bool
    exception_count: int
    exception_pct: Optional[int] = None
    notes: Optional[str] = None
    sql_version_id: Optional[int] = None
    marked_false_positive: bool = False

    @field_validator("passed", "marked_false_positive", mode="before")
    @classmethod
    def coerce_bool(cls, v: Any) -> bool:
        if v is None:
            return False
        return bool(v)

    class Config:
        from_attributes = True


class DataQualityRuleInstanceDetailOut(DataQualityRuleInstanceOut):
    sql_text: Optional[str] = None
    sql_text_prettified: Optional[str] = None


def _instance_from_orm(obj) -> DataQualityRuleInstanceOut:
    return DataQualityRuleInstanceOut(
        id=obj.id,
        rule_id=obj.rule_id,
        data_element_id=obj.data_element_id,
        application_id=obj.application_id,
        run_at=obj.run_at,
        passed=bool(getattr(obj, "passed", 1)),
        exception_count=getattr(obj, "exception_count", 0) or 0,
        exception_pct=obj.exception_pct,
        notes=obj.notes,
        sql_version_id=obj.sql_version_id,
        marked_false_positive=bool(getattr(obj, "marked_false_positive", 0)),
    )


# --- SQL Version ---
class DataQualitySqlVersionCreate(BaseModel):
    sql_text: str
    version: Optional[int] = None
    is_live: bool = False


class DataQualitySqlVersionOut(BaseModel):
    id: int
    rule_id: int
    sql_text: str
    version: int
    is_live: bool
    created_at: Optional[datetime] = None

    @field_validator("is_live", mode="before")
    @classmethod
    def coerce_live(cls, v: Any) -> bool:
        if v is None:
            return False
        return bool(v)

    class Config:
        from_attributes = True


# --- Performance ---
class DQPerformanceSummary(BaseModel):
    rule_id: int
    data_element_id: Optional[int] = None
    application_id: int
    last_run_at: Optional[datetime] = None
    last_passed: Optional[bool] = None
    last_exception_pct: Optional[int] = None
    threshold_pct: Optional[int] = None
    recent_runs: list[DataQualityRuleInstanceOut] = []


class DQTrendPoint(BaseModel):
    run_at: datetime
    passed: bool
    exception_pct: Optional[int] = None
    exception_count: int


class DQTrendResponse(BaseModel):
    rule_id: int
    data_element_id: Optional[int] = None
    application_id: int
    points: list[DQTrendPoint]


# --- Rule mod request ---
class RuleModRequestOut(BaseModel):
    id: int
    rule_id: int
    status: str
    requested_at: Optional[datetime] = None
    requested_by: Optional[int] = None

    class Config:
        from_attributes = True


# --- Rule instance counts (for grid badge and health) ---
class RuleInstanceCountOut(BaseModel):
    rule_id: int
    instance_count: int
    last_passed: Optional[bool] = None  # from most recent run


# --- Lineage applications (for data elements) ---
class LineageApplicationOut(BaseModel):
    application_id: int
    application_name: str
    source: str  # "sor" | "endpoint"
