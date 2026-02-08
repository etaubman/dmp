"""
SQLAlchemy domain models for the Data Manager Portal.
Relationships: Domain -> CDEs, Applications, EUCs, Endpoints, DataFeeds; CDE <-> DQ rules, exceptions, concerns.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
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
    "DataFeed",
    "DataFeedDataElement",
    "DataFeedControl",
    "DataQualityRule",
    "DataQualityException",
    "DataQualityRuleInstance",
    "DataQualitySqlVersion",
    "RuleModRequest",
    "DataConcern",
    "SeedFlag",
    "User",
]


# --- Enums for clarity (stored as strings in DB) ---
class DQRuleType(str, enum.Enum):
    ACCURACY = "accuracy"
    VALIDITY = "validity"
    TIMELINESS = "timeliness"


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
    data_feeds = relationship("DataFeed", back_populates="domain")


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
    dq_rule_instances = relationship("DataQualityRuleInstance", back_populates="data_element")
    data_concerns = relationship("DataConcern", back_populates="data_element")
    systems_of_record = relationship("DataElementSOR", back_populates="data_element")
    data_feed_links = relationship("DataFeedDataElement", back_populates="data_element")


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
    dq_rule_instances = relationship("DataQualityRuleInstance", back_populates="application")
    data_concerns = relationship("DataConcern", back_populates="application")
    systems_of_record = relationship("DataElementSOR", back_populates="application")
    data_feeds_produced = relationship("DataFeed", foreign_keys="DataFeed.producer_application_id", back_populates="producer_application")
    data_feeds_consumed = relationship("DataFeed", foreign_keys="DataFeed.consumer_application_id", back_populates="consumer_application")


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


# --- Data Feed: external or internal source of data; has format, transmission, optional producer/consumer apps ---
class DataFeed(Base):
    __tablename__ = "data_feeds"

    id = Column(Integer, primary_key=True, autoincrement=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    source_type = Column(String(64), nullable=True)  # external, internal
    format = Column(String(64), nullable=True)  # fix, csv, json, xml, parquet
    transmission_method = Column(String(64), nullable=True)  # sftp, kafka, rest, manual, etc.
    producer_application_id = Column(Integer, ForeignKey("applications.id"), nullable=True, index=True)
    consumer_application_id = Column(Integer, ForeignKey("applications.id"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    domain = relationship("Domain", back_populates="data_feeds")
    producer_application = relationship("Application", foreign_keys=[producer_application_id], back_populates="data_feeds_produced")
    consumer_application = relationship("Application", foreign_keys=[consumer_application_id], back_populates="data_feeds_consumed")
    data_feed_elements = relationship("DataFeedDataElement", back_populates="data_feed")
    controls = relationship("DataFeedControl", back_populates="data_feed")


# --- Data Feed <-> Data Element (many-to-many: feed contains data elements) ---
class DataFeedDataElement(Base):
    __tablename__ = "data_feed_data_elements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    data_feed_id = Column(Integer, ForeignKey("data_feeds.id"), nullable=False, index=True)
    data_element_id = Column(Integer, ForeignKey("data_elements.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    data_feed = relationship("DataFeed", back_populates="data_feed_elements")
    data_element = relationship("DataElement", back_populates="data_feed_links")


# --- Data Feed Control: verify accuracy / validity / timeliness ---
class DataFeedControl(Base):
    __tablename__ = "data_feed_controls"

    id = Column(Integer, primary_key=True, autoincrement=True)
    data_feed_id = Column(Integer, ForeignKey("data_feeds.id"), nullable=False, index=True)
    control_type = Column(String(64), nullable=True)  # accuracy, validity, timeliness
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    data_feed = relationship("DataFeed", back_populates="controls")


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
    exception_threshold_pct = Column(Integer, nullable=True)  # 0-100; exceed = failed run
    flagged_for_monitoring = Column(Integer, nullable=False, server_default="0")  # 0/1 bool
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    domain = relationship("Domain", back_populates="data_quality_rules")
    data_element = relationship("DataElement", back_populates="data_quality_rules")
    endpoint = relationship("Endpoint", back_populates="data_quality_rules")
    exceptions = relationship("DataQualityException", back_populates="rule")
    instances = relationship("DataQualityRuleInstance", back_populates="rule")
    sql_versions = relationship("DataQualitySqlVersion", back_populates="rule")
    mod_requests = relationship("RuleModRequest", back_populates="rule")


# --- Data Quality Exception (record that fails a rule) ---
class DataQualityException(Base):
    __tablename__ = "data_quality_exceptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    rule_id = Column(Integer, ForeignKey("data_quality_rules.id"), nullable=False, index=True)
    data_element_id = Column(Integer, ForeignKey("data_elements.id"), nullable=True, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(64), nullable=True)  # open, closed, etc.
    is_false_positive = Column(Integer, nullable=False, server_default="0")  # 0/1 bool
    marked_at = Column(DateTime(timezone=True), nullable=True)
    marked_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    identified_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    rule = relationship("DataQualityRule", back_populates="exceptions")
    data_element = relationship("DataElement", back_populates="data_quality_exceptions")


# --- Data Quality Rule Instance (one run of a rule for element + application in lineage) ---
class DataQualityRuleInstance(Base):
    __tablename__ = "data_quality_rule_instances"

    id = Column(Integer, primary_key=True, autoincrement=True)
    rule_id = Column(Integer, ForeignKey("data_quality_rules.id"), nullable=False, index=True)
    data_element_id = Column(Integer, ForeignKey("data_elements.id"), nullable=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False, index=True)
    run_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    passed = Column(Integer, nullable=False, server_default="1")  # 0/1 bool
    exception_count = Column(Integer, nullable=False, server_default="0")
    exception_pct = Column(Integer, nullable=True)  # 0-100
    notes = Column(Text, nullable=True)
    sql_version_id = Column(Integer, ForeignKey("data_quality_sql_versions.id"), nullable=True, index=True)
    marked_false_positive = Column(Integer, nullable=False, server_default="0")  # 0/1 bool

    rule = relationship("DataQualityRule", back_populates="instances")
    data_element = relationship("DataElement", back_populates="dq_rule_instances")
    application = relationship("Application", back_populates="dq_rule_instances")
    sql_version = relationship("DataQualitySqlVersion", back_populates="instances")


# --- Data Quality SQL Version (one live version per rule) ---
class DataQualitySqlVersion(Base):
    __tablename__ = "data_quality_sql_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    rule_id = Column(Integer, ForeignKey("data_quality_rules.id"), nullable=False, index=True)
    sql_text = Column(Text, nullable=False)
    version = Column(Integer, nullable=False, server_default="1")
    is_live = Column(Integer, nullable=False, server_default="0")  # 0/1 bool; only one per rule
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    rule = relationship("DataQualityRule", back_populates="sql_versions")
    instances = relationship("DataQualityRuleInstance", back_populates="sql_version")


# --- Rule Mod Request (when user requests a rule change) ---
class RuleModRequest(Base):
    __tablename__ = "rule_mod_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    rule_id = Column(Integer, ForeignKey("data_quality_rules.id"), nullable=False, index=True)
    status = Column(String(64), nullable=False, server_default="requested")  # requested, in_progress, done
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    rule = relationship("DataQualityRule", back_populates="mod_requests")


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
    # For local auth; null when user is SSO-only (future)
    password_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
