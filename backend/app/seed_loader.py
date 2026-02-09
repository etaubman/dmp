"""
Load seed data from JSON files in seed-data/ and insert into the database.
Used by seed.run_seed() and seed.reset_and_reseed() instead of hardcoded values.
"""
from pathlib import Path
import json
from datetime import datetime, timezone, timedelta

from app.models import (
    Domain,
    User,
    DataElement,
    DataElementSOR,
    Application,
    EUC,
    Endpoint,
    DataFeed,
    DataFeedDataElement,
    DataFeedControl,
    DataQualityRule,
    DataQualityException,
    DataQualityRuleInstance,
    DataQualitySqlVersion,
    RuleModRequest,
    DataConcern,
)
from app.auth.local_provider import hash_password


def get_seed_data_dir():
    """Return path to backend/seed-data (parent of app/)."""
    return Path(__file__).resolve().parent.parent / "seed-data"


def load_json(filename):
    """Load a JSON file from seed-data directory."""
    path = get_seed_data_dir() / filename
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def add_domains_from_file(db):
    """
    Load domains.json and create Domain rows. Parents must appear before children.
    Returns dict: domain name -> domain id.
    """
    data = load_json("domains.json")
    name_to_id = {}
    for row in data:
        parent_id = None
        if row.get("parent_name"):
            parent_id = name_to_id.get(row["parent_name"])
        domain = Domain(
            name=row["name"],
            description=row.get("description"),
            parent_id=parent_id,
        )
        db.add(domain)
        db.flush()
        name_to_id[row["name"]] = domain.id
    return name_to_id


def add_users_from_file(db, default_password="password"):
    """Load users.json and create User rows (only if users table is empty)."""
    if db.query(User).first() is not None:
        return
    data = load_json("users.json")
    for row in data:
        db.add(User(
            email=row["email"],
            name=row["name"],
            role=row["role"],
            password_hash=hash_password(default_password),
        ))
    db.flush()


def add_domain_data_from_file(db, name_to_id, filename):
    """
    Load a domain-specific JSON (e.g. equities.json) and create applications,
    data elements, EUCs, endpoints, DQ rules/exceptions, concerns, SOR, feeds.
    """
    data = load_json(filename)
    domain_name = data["domain_name"]
    if domain_name not in name_to_id:
        return
    domain_id = name_to_id[domain_name]

    app_name_to_id = {}
    for row in data.get("applications", []):
        app = Application(
            domain_id=domain_id,
            name=row["name"],
            description=row.get("description"),
        )
        db.add(app)
        db.flush()
        app_name_to_id[row["name"]] = app.id

    de_name_to_id = {}
    for row in data.get("data_elements", []):
        de = DataElement(
            domain_id=domain_id,
            name=row["name"],
            description=row.get("description"),
            element_type=row.get("element_type", "logical"),
        )
        db.add(de)
        db.flush()
        de_name_to_id[row["name"]] = de.id

    for row in data.get("eucs", []):
        db.add(EUC(
            domain_id=domain_id,
            name=row["name"],
            euc_type=row.get("euc_type", "euc"),
            description=row.get("description"),
        ))
    db.flush()

    ep_name_to_id = {}
    for row in data.get("endpoints", []):
        app_id = app_name_to_id.get(row["application_name"]) if row.get("application_name") else None
        ep = Endpoint(
            domain_id=domain_id,
            application_id=app_id,
            name=row["name"],
            description=row.get("description"),
        )
        db.add(ep)
        db.flush()
        ep_name_to_id[row["name"]] = ep.id

    rule_name_to_id = {}
    for row in data.get("data_quality_rules", []):
        de_id = de_name_to_id.get(row["data_element_name"]) if row.get("data_element_name") else None
        ep_id = ep_name_to_id.get(row["endpoint_name"]) if row.get("endpoint_name") else None
        rule = DataQualityRule(
            domain_id=domain_id,
            data_element_id=de_id,
            endpoint_id=ep_id,
            name=row["name"],
            description=row.get("description"),
            rule_type=row.get("rule_type", "validity"),
            exception_threshold_pct=row.get("exception_threshold_pct"),
            flagged_for_monitoring=row.get("flagged_for_monitoring", 0) or 0,
        )
        db.add(rule)
        db.flush()
        rule_name_to_id[row["name"]] = rule.id

    for row in data.get("data_quality_exceptions", []):
        db.add(DataQualityException(
            rule_id=rule_name_to_id[row["rule_name"]],
            data_element_id=de_name_to_id.get(row["data_element_name"]),
            description=row.get("description"),
            status=row.get("status", "open"),
        ))
    db.flush()

    # Optional: SQL versions and rule instances (e.g. commodities)
    sql_version_by_rule = {}
    for row in data.get("data_quality_sql_versions", []):
        r_id = rule_name_to_id.get(row["rule_name"])
        if r_id is None:
            continue
        sv = DataQualitySqlVersion(
            rule_id=r_id,
            sql_text=row["sql_text"],
            version=row.get("version", 1),
            is_live=row.get("is_live", 1),
        )
        db.add(sv)
        db.flush()
        sql_version_by_rule[row["rule_name"]] = sv.id

    now = datetime.now(timezone.utc)
    for row in data.get("data_quality_rule_instances", []):
        r_id = rule_name_to_id.get(row["rule_name"])
        de_id = de_name_to_id.get(row["data_element_name"])
        app_id = app_name_to_id.get(row["application_name"])
        sql_id = sql_version_by_rule.get(row["rule_name"]) if sql_version_by_rule else None
        if r_id is None or de_id is None or app_id is None:
            continue
        run_at = now - timedelta(days=row.get("run_at_offset_days", 0))
        db.add(DataQualityRuleInstance(
            rule_id=r_id,
            data_element_id=de_id,
            application_id=app_id,
            run_at=run_at,
            passed=row.get("passed", 1),
            exception_count=row.get("exception_count", 0),
            exception_pct=row.get("exception_pct"),
            sql_version_id=sql_id,
        ))
    db.flush()

    for row in data.get("rule_mod_requests", []):
        r_id = rule_name_to_id.get(row["rule_name"])
        if r_id is not None:
            db.add(RuleModRequest(rule_id=r_id, status=row.get("status", "requested")))
    db.flush()

    for row in data.get("data_concerns", []):
        db.add(DataConcern(
            domain_id=domain_id,
            application_id=app_name_to_id.get(row["application_name"]) if row.get("application_name") else None,
            endpoint_id=ep_name_to_id.get(row["endpoint_name"]) if row.get("endpoint_name") else None,
            data_element_id=de_name_to_id.get(row["data_element_name"]) if row.get("data_element_name") else None,
            title=row["title"],
            description=row.get("description"),
            status=row.get("status", "open"),
        ))
    db.flush()

    for row in data.get("data_element_sor", []):
        de_id = de_name_to_id.get(row["data_element_name"])
        app_id = app_name_to_id.get(row["application_name"])
        if de_id is not None and app_id is not None:
            db.add(DataElementSOR(
                data_element_id=de_id,
                application_id=app_id,
                physical_data_attribute=row.get("physical_data_attribute"),
            ))
    db.flush()

    for feed_row in data.get("data_feeds", []):
        producer_id = app_name_to_id.get(feed_row.get("producer_application_name")) if feed_row.get("producer_application_name") else None
        consumer_id = app_name_to_id.get(feed_row.get("consumer_application_name")) if feed_row.get("consumer_application_name") else None
        feed = DataFeed(
            domain_id=domain_id,
            name=feed_row["name"],
            description=feed_row.get("description"),
            source_type=feed_row.get("source_type", "internal"),
            format=feed_row.get("format"),
            transmission_method=feed_row.get("transmission_method"),
            producer_application_id=producer_id,
            consumer_application_id=consumer_id,
        )
        db.add(feed)
        db.flush()
        for de_name in feed_row.get("data_element_names", []):
            de_id = de_name_to_id.get(de_name)
            if de_id is not None:
                db.add(DataFeedDataElement(data_feed_id=feed.id, data_element_id=de_id))
        for ctrl in feed_row.get("controls", []):
            db.add(DataFeedControl(
                data_feed_id=feed.id,
                control_type=ctrl.get("control_type", "validity"),
                name=ctrl["name"],
                description=ctrl.get("description"),
            ))
    db.flush()


# Domain seed files to load (order matches original L1_SEEDERS).
DOMAIN_SEED_FILES = [
    "equities.json",
    "commodities.json",
    "commercial_banking.json",
    "investment_banking.json",
]


def load_all_domain_data(db, name_to_id):
    """Load all domain-specific seed files that have a matching domain in name_to_id."""
    for filename in DOMAIN_SEED_FILES:
        add_domain_data_from_file(db, name_to_id, filename)
