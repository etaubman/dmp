from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ApplicationBase(BaseModel):
    domain_id: int
    name: str
    description: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationOut(ApplicationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
