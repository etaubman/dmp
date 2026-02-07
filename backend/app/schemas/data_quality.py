from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DataQualityRuleBase(BaseModel):
    domain_id: Optional[int] = None
    data_element_id: Optional[int] = None
    endpoint_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    rule_type: Optional[str] = None


class DataQualityRuleCreate(DataQualityRuleBase):
    pass


class DataQualityRuleOut(DataQualityRuleBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DataQualityExceptionBase(BaseModel):
    rule_id: int
    data_element_id: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None


class DataQualityExceptionCreate(DataQualityExceptionBase):
    pass


class DataQualityExceptionOut(DataQualityExceptionBase):
    id: int
    identified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
