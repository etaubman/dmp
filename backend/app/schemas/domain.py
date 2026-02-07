from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DomainBase(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None


class DomainCreate(DomainBase):
    pass


class DomainUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None


class DomainOut(DomainBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
