from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EUCBase(BaseModel):
    domain_id: int
    name: str
    description: Optional[str] = None
    euc_type: Optional[str] = None


class EUCCreate(EUCBase):
    pass


class EUCOut(EUCBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
