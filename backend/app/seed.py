"""
Seed the database with sample data on first run.
Checks SeedFlag table; if no row exists, creates one domain, CDEs, applications, EUCs,
endpoints, DQ rules, DQ exceptions, and data concerns.
"""
from app.database import get_engine_and_session
from app.models import (
    SeedFlag,
    Domain,
    DataElement,
    Application,
    EUC,
    Endpoint,
    DataQualityRule,
    DataQualityException,
    DataConcern,
)


def run_seed():
    """If not already seeded, insert sample data."""
    _, SessionLocal = get_engine_and_session()
    db = SessionLocal()
    try:
        existing = db.query(SeedFlag).first()
        if existing:
            return  # Already seeded

        # One domain
        domain = Domain(
            name="Finance",
            description="Finance data domain (sample)",
        )
        db.add(domain)
        db.flush()  # get domain.id

        # Critical Data Elements
        de1 = DataElement(domain_id=domain.id, name="Customer ID", description="Unique customer identifier", element_type="logical")
        de2 = DataElement(domain_id=domain.id, name="Revenue Amount", description="Revenue in local currency", element_type="logical")
        de3 = DataElement(domain_id=domain.id, name="Transaction Date", description="Date of transaction", element_type="logical")
        db.add_all([de1, de2, de3])
        db.flush()

        # Applications
        app1 = Application(domain_id=domain.id, name="ERP Core", description="Core ERP system")
        app2 = Application(domain_id=domain.id, name="Reporting DW", description="Data warehouse for reporting")
        db.add_all([app1, app2])
        db.flush()

        # EUCs
        euc1 = EUC(domain_id=domain.id, name="Budget Tracker", euc_type="euc", description="Excel-based budget tracker")
        euc2 = EUC(domain_id=domain.id, name="SharePoint Reports", euc_type="itess", description="SharePoint report library")
        db.add_all([euc1, euc2])
        db.flush()

        # Endpoints
        ep1 = Endpoint(domain_id=domain.id, application_id=app1.id, name="Monthly Close", description="Month-end close process")
        ep2 = Endpoint(domain_id=domain.id, application_id=app2.id, name="Regulatory Report", description="Quarterly regulatory submission")
        db.add_all([ep1, ep2])
        db.flush()

        # Data Quality Rules
        dqr1 = DataQualityRule(domain_id=domain.id, data_element_id=de1.id, name="Customer ID not null", rule_type="validity", description="Customer ID must be populated")
        dqr2 = DataQualityRule(domain_id=domain.id, data_element_id=de2.id, name="Revenue non-negative", rule_type="validity", description="Revenue amount must be >= 0")
        dqr3 = DataQualityRule(domain_id=domain.id, data_element_id=de3.id, endpoint_id=ep1.id, name="Transaction date in range", rule_type="timeliness", description="Transaction date within current period")
        db.add_all([dqr1, dqr2, dqr3])
        db.flush()

        # Data Quality Exceptions
        dqe1 = DataQualityException(rule_id=dqr2.id, data_element_id=de2.id, description="Negative revenue found in batch XYZ", status="open")
        dqe2 = DataQualityException(rule_id=dqr1.id, data_element_id=de1.id, description="Null customer ID in legacy import", status="closed")
        db.add_all([dqe1, dqe2])

        # Data Concerns
        dc1 = DataConcern(domain_id=domain.id, title="Legacy data quality", description="Historical data has gaps", status="open")
        dc2 = DataConcern(domain_id=domain.id, application_id=app1.id, data_element_id=de1.id, title="Customer ID format inconsistency", description="Multiple formats in source", status="open")
        db.add_all([dc1, dc2])

        # Mark as seeded
        db.add(SeedFlag())
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
