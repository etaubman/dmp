"""
SQLAlchemy domain models for the Data Manager Portal.
Relationships: Domain -> CDEs, Applications, EUCs, Endpoints; CDE <-> DQ rules, exceptions, concerns.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.models.base import Base

__all__ = [
    "Base",
    "Domain",
    "DataElement",
    "DataElementSOR",
    "Application",
    "EUC",
    "Endpoint",
    "DataQualityRule",
    "DataQualityException",
    "DataConcern",
    "SeedFlag",
    "User",
]


# --- Enums for clarity (stored as strings in DB) ---
class DQRuleType(str, enum.Enum):
    ACCURACY = "accuracy"
    VALIDITY = "validity"
    TIMELENESS = "timeliness"


class EUCType(str, enum.Enum):
    EUC = "euc"  # End User Computing (Excel, Power BI, etc.)
    ITESS = "itess"  # IT Enabled Smart Solution (SharePoint, etc.)


# --- Domain: hierarchy of data domains ---
class Domain(Base):
    __tablename__ = "domains"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey("domains.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    parent = relationship("Domain", remote_side=[id], back_populates="children")
    children = relationship("Domain", back_populates="parent", foreign_keys=[parent_id])
    data_elements = relationship("DataElement", back_populates="domain")
    applications = relationship("Application", back_populates="domain")
    eucs = relationship("EUC", back_populates="domain")
    endpoints = relationship("Endpoint", back_populates="domain")
    data_quality_rules = relationship("DataQualityRule", back_populates="domain")
    data_concerns = relationship("DataConcern", back_populates="domain")


# --- Critical Data Element ---
class DataElement(Base):
    __tablename__ = "data_elements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    element_type = Column(String(64), nullable=True)  # logical, physical, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    domain = relationship("Domain", back_populates="data_elements")
    data_quality_rules = relationship("DataQualityRule", back_populates="data_element")
    data_quality_exceptions = relationship(
        "DataQualityException", back_populates="data_element"
    )
    data_concerns = relationship("DataConcern", back_populates="data_element")
    systems_of_record = relationship("DataElementSOR", back_populates="data_element")


# --- Data Element System of Record: which application sources this element and the physical attribute name ---
class DataElementSOR(Base):
    __tablename__ = "data_element_sor"

    id = Column(Integer, primary_key=True, autoincrement=True)
    data_element_id = Column(Integer, ForeignKey("data_elements.id"), nullable=False, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False, index=True)
    physical_data_attribute = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    data_element = relationship("DataElement", back_populates="systems_of_record")
    application = relationship("Application", back_populates="systems_of_record")


# --- Application (system used in the business) ---
class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    domain = relationship("Domain", back_populates="applications")
    endpoints = relationship("Endpoint", back_populates="application")
    data_concerns = relationship("DataConcern", back_populates="application")
    systems_of_record = relationship("DataElementSOR", back_populates="application")


# --- EUC: End User Computing / ITESS ---
class EUC(Base):
    __tablename__ = "eucs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    euc_type = Column(String(32), nullable=True)  # euc, itess
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    domain = relationship("Domain", back_populates="eucs")
    data_concerns = relationship("DataConcern", back_populates="euc")


# --- Endpoint: use case for data (report, process) ---
class Endpoint(Base):
    __tablename__ = "endpoints"

    id = Column(Integer, primary_key=True, autoincrement=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    domain = relationship("Domain", back_populates="endpoints")
    application = relationship("Application", back_populates="endpoints")
    data_quality_rules = relationship("DataQualityRule", back_populates="endpoint")
    data_concerns = relationship("DataConcern", back_populates="endpoint")


# --- Data Quality Rule ---
class DataQualityRule(Base):
    __tablename__ = "data_quality_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=True, index=True)
    data_element_id = Column(Integer, ForeignKey("data_elements.id"), nullable=True, index=True)
    endpoint_id = Column(Integer, ForeignKey("endpoints.id"), nullable=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    rule_type = Column(String(64), nullable=True)  # accuracy, validity, timeliness
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    domain = relationship("Domain", back_populates="data_quality_rules")
    data_element = relationship("DataElement", back_populates="data_quality_rules")
    endpoint = relationship("Endpoint", back_populates="data_quality_rules")
    exceptions = relationship("DataQualityException", back_populates="rule")


# --- Data Quality Exception (record that fails a rule) ---
class DataQualityException(Base):
    __tablename__ = "data_quality_exceptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    rule_id = Column(Integer, ForeignKey("data_quality_rules.id"), nullable=False, index=True)
    data_element_id = Column(Integer, ForeignKey("data_elements.id"), nullable=True, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(64), nullable=True)  # open, closed, etc.
    identified_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    rule = relationship("DataQualityRule", back_populates="exceptions")
    data_element = relationship("DataElement", back_populates="data_quality_exceptions")


# --- Data Concern (governance concern; can link to app, euc, endpoint, element) ---
class DataConcern(Base):
    __tablename__ = "data_concerns"

    id = Column(Integer, primary_key=True, autoincrement=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True, index=True)
    euc_id = Column(Integer, ForeignKey("eucs.id"), nullable=True, index=True)
    endpoint_id = Column(Integer, ForeignKey("endpoints.id"), nullable=True, index=True)
    data_element_id = Column(Integer, ForeignKey("data_elements.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    domain = relationship("Domain", back_populates="data_concerns")
    application = relationship("Application", back_populates="data_concerns")
    euc = relationship("EUC", back_populates="data_concerns")
    endpoint = relationship("Endpoint", back_populates="data_concerns")
    data_element = relationship("DataElement", back_populates="data_concerns")


# --- Seed flag: one row to mark that seed has run ---
class SeedFlag(Base):
    __tablename__ = "seed_flag"

    id = Column(Integer, primary_key=True, autoincrement=True)
    seeded_at = Column(DateTime(timezone=True), server_default=func.now())


# --- User: portal users for admin management ---
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=True)
    role = Column(String(64), nullable=True)  # e.g. admin, viewer, editor
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
