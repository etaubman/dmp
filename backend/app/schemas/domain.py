from pydantic import BaseModel
from typing import Optional, List
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


class DomainTreeOut(BaseModel):
    """Recursive tree node for L0→L1→L2→L3 hierarchy."""
    id: int
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    level: int = 0
    children: List["DomainTreeOut"] = []

    class Config:
        from_attributes = True


DomainTreeOut.model_rebuild()
