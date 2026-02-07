"""Metrics view: counts/summaries for attestation, concerns, DQ rules, DQ exceptions."""
from pydantic import BaseModel
from typing import Optional


class MetricsOut(BaseModel):
    domain_id: Optional[int] = None
    domains_count: int = 0
    data_elements_count: int = 0
    applications_count: int = 0
    eucs_count: int = 0
    endpoints_count: int = 0
    data_quality_rules_count: int = 0
    data_quality_exceptions_count: int = 0
    data_concerns_count: int = 0
    # Placeholder for attestation when we add it
    attestation_count: Optional[int] = None
