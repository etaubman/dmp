"""Data feed schemas: list and detail (feed contains data elements and has controls)."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DataFeedControlOut(BaseModel):
    id: int
    data_feed_id: int
    control_type: Optional[str] = None
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class DataFeedDataElementRefOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class DataFeedBase(BaseModel):
    domain_id: int
    name: str
    description: Optional[str] = None
    source_type: Optional[str] = None
    format: Optional[str] = None
    transmission_method: Optional[str] = None
    producer_application_id: Optional[int] = None
    consumer_application_id: Optional[int] = None


class DataFeedOut(DataFeedBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    data_element_count: int = 0
    control_count: int = 0
    producer_application_name: Optional[str] = None
    consumer_application_name: Optional[str] = None

    class Config:
        from_attributes = True


class DataFeedDetailOut(DataFeedOut):
    """Detail view with embedded data elements and controls."""
    data_elements: list[DataFeedDataElementRefOut] = []
    controls: list[DataFeedControlOut] = []
