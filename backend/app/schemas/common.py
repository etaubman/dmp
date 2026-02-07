"""Common schemas: domain ref, pagination, etc."""
from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class DomainRef(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class TimestampsMixin(BaseModel):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
