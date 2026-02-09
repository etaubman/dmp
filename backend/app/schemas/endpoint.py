from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EndpointBase(BaseModel):
    domain_id: Optional[int] = None
    application_id: Optional[int] = None
    name: str
    description: Optional[str] = None


class EndpointCreate(EndpointBase):
    pass


class EndpointOut(EndpointBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
