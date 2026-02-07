from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DataElementBase(BaseModel):
    domain_id: int
    name: str
    description: Optional[str] = None
    element_type: Optional[str] = None


class DataElementCreate(DataElementBase):
    pass


class DataElementUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    element_type: Optional[str] = None


class DataElementOut(DataElementBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
