from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DataConcernBase(BaseModel):
    domain_id: int
    application_id: Optional[int] = None
    euc_id: Optional[int] = None
    endpoint_id: Optional[int] = None
    data_element_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    status: Optional[str] = None


class DataConcernCreate(DataConcernBase):
    pass


class DataConcernOut(DataConcernBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
