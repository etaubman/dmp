from pydantic import BaseModel
from typing import Optional


class DataElementSOROut(BaseModel):
    """One system-of-record record: application that sources this data element and the physical attribute name."""
    application_id: int
    application_name: str
    physical_data_attribute: Optional[str] = None

    class Config:
        from_attributes = True


class DataElementSORSummaryOut(BaseModel):
    """SOR record with data_element_id for bulk listing by domain."""
    data_element_id: int
    application_id: int
    application_name: str
    physical_data_attribute: Optional[str] = None

    class Config:
        from_attributes = True
