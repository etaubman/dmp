"""
Seed the database with sample data on first run.
Checks SeedFlag table; if no row exists, creates L0/L1/L2 domain hierarchy and rich
applications, data elements, EUCs, endpoints (including regulatory e.g. MIFID II, SNC, FR-Y-14),
DQ rules, DQ exceptions, and data concerns.

CLI: python -m app.seed (idempotent). python -m app.seed reset — wipes domain-related data
and re-seeds with current DOMAIN_HIERARCHY (see reset_and_reseed()).
"""
from app.database import get_engine_and_session
from app.models import (
    SeedFlag,
    Domain,
    User,
    DataElement,
    DataElementSOR,
    Application,
    EUC,
    Endpoint,
    DataQualityRule,
    DataQualityException,
    DataQualityRuleInstance,
    DataQualitySqlVersion,
    RuleModRequest,
    DataConcern,
)
from app.auth.local_provider import hash_password


# L0 -> L1 -> L2 domain structure. Each item is (L0_name, [ (L1_name, [L2_names]), ... ]).
# L2_names can be empty for L1-only (e.g. Banking).
DOMAIN_HIERARCHY = [
    ("L0 Markets", [
        ("L1 Equities", ["L2 Equities Cash", "L2 Equities Derivatives", "L2 Equities Prime"]),
        ("L1 Commodities", ["L2 Agriculture", "L2 Oil & Gas", "L2 Metals"]),
    ]),
    ("L0 Banking", [
        ("L1 Commercial Banking", []),
        ("L1 Investment Banking", []),
    ]),
]


# Seed users: portal users for admin (only if table is empty). Ethan Taubman first = default dev user.
SEED_USERS = [
    {"email": "ethan.taubman@example.com", "name": "Ethan Taubman", "role": "admin"},
    {"email": "admin@example.com", "name": "Admin User", "role": "admin"},
    {"email": "viewer@example.com", "name": "Viewer User", "role": "viewer"},
    {"email": "editor@example.com", "name": "Editor User", "role": "editor"},
]


# Default password for seed users (dev only; change in production)
SEED_DEFAULT_PASSWORD = "password"


def _add_users(db):
    """Create seed users if the users table is empty. Set password_hash for login."""
    if db.query(User).first() is not None:
        _ensure_users_have_passwords(db)
        return
    for u in SEED_USERS:
        db.add(User(
            email=u["email"],
            name=u["name"],
            role=u["role"],
            password_hash=hash_password(SEED_DEFAULT_PASSWORD),
        ))
    db.flush()


def _ensure_users_have_passwords(db):
    """Set default password for any user with no password_hash (e.g. after adding column)."""
    for user in db.query(User).filter(User.password_hash.is_(None)):
        user.password_hash = hash_password(SEED_DEFAULT_PASSWORD)
    db.flush()


def _set_all_user_passwords(db):
    """Force-set every user's password to SEED_DEFAULT_PASSWORD. Use to fix 401 when hashes are missing or wrong."""
    for user in db.query(User).all():
        user.password_hash = hash_password(SEED_DEFAULT_PASSWORD)
    db.flush()


def ensure_all_users_have_passwords():
    """Call on startup: set default password for users with none, then force-set all (fixes bad/missing hashes)."""
    engine, SessionLocal = get_engine_and_session()
    db = SessionLocal()
    try:
        _ensure_users_have_passwords(db)
        _set_all_user_passwords(db)  # force-set everyone so login works even if hashes were wrong
        db.commit()
    finally:
        db.close()


def set_all_passwords():
    """CLI: set every user's password to the default ('password'). Run once to fix login 401."""
    engine, SessionLocal = get_engine_and_session()
    db = SessionLocal()
    try:
        _set_all_user_passwords(db)
        db.commit()
        count = db.query(User).count()
        print(f"Set password for {count} user(s). Use email + password 'password' to log in.")
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()


def _add_domains(db):
    """Create L0, L1, and L2 domains. Returns dict: domain_name -> domain id (for L0, L1, L2)."""
    name_to_id = {}
    for l0_name, l1_list in DOMAIN_HIERARCHY:
        l0 = Domain(
            name=l0_name,
            description=f"{l0_name} organization and data domain.",
            parent_id=None,
        )
        db.add(l0)
        db.flush()
        name_to_id[l0_name] = l0.id
        for item in l1_list:
            l1_name, l2_names = item[0], item[1] if len(item) > 1 else []
            l1 = Domain(
                name=l1_name,
                description=f"{l1_name} under {l0_name}.",
                parent_id=l0.id,
            )
            db.add(l1)
            db.flush()
            name_to_id[l1_name] = l1.id
            for l2_name in l2_names:
                l2 = Domain(
                    name=l2_name,
                    description=f"{l2_name} under {l1_name}.",
                    parent_id=l1.id,
                )
                db.add(l2)
                db.flush()
                name_to_id[l2_name] = l2.id
    return name_to_id


def _seed_equities(db, domain_id):
    """L1 Equities: cash, derivatives, prime with MIFID II, RTS 27/28, CAT, Best Execution endpoints."""
    apps = [
        Application(domain_id=domain_id, name="Equity Order Management System (OMS)", description="Order management, routing, and execution for cash and listed derivatives"),
        Application(domain_id=domain_id, name="Equity Position Ledger", description="Positions, corporate actions, and settlement (T+1/T+2)"),
        Application(domain_id=domain_id, name="Prime Brokerage Platform", description="Prime brokerage, stock loan, margin, and financing"),
        Application(domain_id=domain_id, name="Execution Venue Gateway", description="Connectivity to exchanges and MTFs for best execution"),
        Application(domain_id=domain_id, name="Equity Reference Data Service", description="ISIN, SEDOL, instrument master, and classification"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Order ID", description="Unique order identifier (client and firm)", element_type="logical"),
        DataElement(domain_id=domain_id, name="Fill Price", description="Execution price per share or contract", element_type="logical"),
        DataElement(domain_id=domain_id, name="Fill Quantity", description="Executed quantity", element_type="logical"),
        DataElement(domain_id=domain_id, name="SEDOL", description="Stock Exchange Daily Official List identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="ISIN", description="International Security Identification Number", element_type="logical"),
        DataElement(domain_id=domain_id, name="Settlement Date", description="Settlement date (T+1, T+2)", element_type="logical"),
        DataElement(domain_id=domain_id, name="Execution Venue MIC", description="Market Identifier Code (MIC) of execution venue", element_type="logical"),
        DataElement(domain_id=domain_id, name="Client Identifier", description="Client or account identifier for transaction reporting", element_type="logical"),
        DataElement(domain_id=domain_id, name="Decision Time", description="Time of investment decision (MIFID II)", element_type="logical"),
        DataElement(domain_id=domain_id, name="Best Execution Policy ID", description="Policy identifier for RTS 27/28", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Block Trade Tracker", euc_type="euc", description="Excel block trade log and allocation"),
        EUC(domain_id=domain_id, name="Stock Loan Dashboard", euc_type="itess", description="Power BI stock loan utilization and availability"),
        EUC(domain_id=domain_id, name="Best Execution Review Pack", euc_type="euc", description="Excel RTS 27/28 quarterly review"),
        EUC(domain_id=domain_id, name="Transaction Reporting Exception Log", euc_type="itess", description="SharePoint MIFID II report exceptions"),
    ]
    db.add_all(eucs)
    db.flush()
    endpoints = [
        Endpoint(domain_id=domain_id, application_id=app_ids[0], name="MIFID II Transaction Report", description="MIFID II transaction reporting to NCA"),
        Endpoint(domain_id=domain_id, application_id=app_ids[0], name="RTS 27 Execution Quality Report", description="RTS 27 execution quality (annual)"),
        Endpoint(domain_id=domain_id, application_id=app_ids[0], name="RTS 28 Best Execution Report", description="RTS 28 top five execution venues (quarterly)"),
        Endpoint(domain_id=domain_id, application_id=app_ids[4], name="Best Execution Policy Publication", description="Publication of best execution policy and summary"),
        Endpoint(domain_id=domain_id, application_id=app_ids[0], name="CAT Order Event Report", description="Consolidated Audit Trail order/event submission"),
        Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Execution Report (Fills)", description="Fill and allocation report"),
        Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Position Report", description="End-of-day positions by instrument"),
    ]
    db.add_all(endpoints)
    db.flush()
    ep_ids = [e.id for e in endpoints]
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Order ID unique", rule_type="validity", description="Order ID must be unique"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], name="Fill qty non-negative", rule_type="validity", description="Fill quantity must be non-negative"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[5], endpoint_id=ep_ids[6], name="Settlement date T+2", rule_type="timeliness", description="Settlement date consistent with market"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[6], endpoint_id=ep_ids[0], name="Execution Venue MIC valid", rule_type="validity", description="MIC must be valid for transaction report"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[7], endpoint_id=ep_ids[0], name="Client ID present", rule_type="validity", description="Client identifier required for report"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[8], endpoint_id=ep_ids[0], name="Decision time populated", rule_type="timeliness", description="Decision time required for MIFID II"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], endpoint_id=ep_ids[1], name="RTS 27 fill price valid", rule_type="validity", description="Execution price required for RTS 27"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[6], endpoint_id=ep_ids[2], name="RTS 28 venue MIC valid", rule_type="validity", description="Venue MIC for top-five disclosure"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], endpoint_id=ep_ids[5], name="Fill qty present", rule_type="validity", description="Fill quantity required for execution report"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[1].id, data_element_id=de_ids[2], description="Cancel fill with zero qty not flagged", status="closed"),
        DataQualityException(rule_id=dqrs[3].id, data_element_id=de_ids[6], description="Invalid MIC for XOFF venue in Jan 2024 batch", status="open"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, data_element_id=de_ids[3], title="SEDOL vs ISIN mapping", description="Mapping table out of date for new listings", status="open"),
        DataConcern(domain_id=domain_id, application_id=app_ids[0], endpoint_id=ep_ids[0], title="MIFID II report timeliness", description="Late submission risk for T+1 report", status="open"),
        DataConcern(domain_id=domain_id, application_id=app_ids[0], endpoint_id=ep_ids[4], title="CAT clock sync", description="Clock synchronization variance across OMS and venues", status="open"),
        DataConcern(domain_id=domain_id, application_id=app_ids[4], endpoint_id=ep_ids[3], title="Best execution disclosure", description="Quarterly disclosure data completeness", status="open"),
    ])
    db.add_all([
        DataElementSOR(data_element_id=de_ids[0], application_id=app_ids[0], physical_data_attribute="order_id"),
        DataElementSOR(data_element_id=de_ids[0], application_id=app_ids[4], physical_data_attribute="ext_order_ref"),
        DataElementSOR(data_element_id=de_ids[1], application_id=app_ids[0], physical_data_attribute="fill_price"),
        DataElementSOR(data_element_id=de_ids[5], application_id=app_ids[1], physical_data_attribute="settlement_dt"),
        DataElementSOR(data_element_id=de_ids[6], application_id=app_ids[0], physical_data_attribute="exec_venue_mic"),
    ])


def _seed_commodities(db, domain_id):
    """L1 Commodities: Agriculture, Oil & Gas, Metals with EMIR, Dodd-Frank, position limits."""
    apps = [
        Application(domain_id=domain_id, name="Commodities Trading Platform", description="Front-office trading for ags, energy, and metals"),
        Application(domain_id=domain_id, name="Physical Commodities Ledger", description="Inventory, delivery, and physical settlement"),
        Application(domain_id=domain_id, name="Commodities Risk Engine", description="VaR, position limits, and stress testing"),
        Application(domain_id=domain_id, name="Agriculture Pricing & Analytics", description="Crop and grain pricing, basis, and supply chain"),
        Application(domain_id=domain_id, name="Energy & Oil & Gas Trading", description="Crude, refined products, natural gas, and LNG"),
        Application(domain_id=domain_id, name="Metals Trading & Refining", description="Precious and base metals, LME/COMEX"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Commodity Code", description="Product code (e.g. WTI, Brent, Corn, Gold)", element_type="logical"),
        DataElement(domain_id=domain_id, name="Position Quantity", description="Net position in contract or physical units", element_type="logical"),
        DataElement(domain_id=domain_id, name="Mark-to-Market Price", description="Valuation price", element_type="logical"),
        DataElement(domain_id=domain_id, name="Trade Date", description="Execution date", element_type="logical"),
        DataElement(domain_id=domain_id, name="Delivery Location", description="Delivery or delivery point code", element_type="logical"),
        DataElement(domain_id=domain_id, name="Counterparty LEI", description="Counterparty legal entity identifier for EMIR", element_type="logical"),
        DataElement(domain_id=domain_id, name="UTI", description="Unique Transaction Identifier (EMIR)", element_type="logical"),
        DataElement(domain_id=domain_id, name="Position Limit Utilization", description="Current position vs regulatory limit (Dodd-Frank 722)", element_type="logical"),
        DataElement(domain_id=domain_id, name="Physical Delivery Date", description="Scheduled delivery date for physical", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Physical Inventory Recon", euc_type="euc", description="Excel reconciliation with warehouses"),
        EUC(domain_id=domain_id, name="Agriculture Basis Tracker", euc_type="euc", description="Excel basis and regional pricing"),
        EUC(domain_id=domain_id, name="EMIR Reporting Exception Log", euc_type="itess", description="SharePoint EMIR rejections and amendments"),
        EUC(domain_id=domain_id, name="Position Limits Dashboard", euc_type="itess", description="Power BI position limit utilization by product"),
    ]
    db.add_all(eucs)
    db.flush()
    endpoints = [
        Endpoint(domain_id=domain_id, application_id=app_ids[0], name="EMIR Trade Report", description="EMIR derivative reporting to TR"),
        Endpoint(domain_id=domain_id, application_id=app_ids[2], name="Dodd-Frank 722 Position Limits Report", description="Position limits and accountability reporting"),
        Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Daily P&L", description="Commodities P&L report"),
        Endpoint(domain_id=domain_id, application_id=app_ids[2], name="Position Limit Report", description="Limit utilization by book and product"),
        Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Physical Delivery Report", description="Physical delivery and inventory report"),
    ]
    db.add_all(endpoints)
    db.flush()
    ep_ids = [e.id for e in endpoints]
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="Position quantity valid", rule_type="validity", description="Position must be numeric", exception_threshold_pct=5),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[3], endpoint_id=ep_ids[2], name="Trade date within period", rule_type="timeliness", description="Trade date in reporting period", exception_threshold_pct=2),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[6], endpoint_id=ep_ids[0], name="UTI unique", rule_type="validity", description="UTI must be unique for EMIR", exception_threshold_pct=0),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[5], endpoint_id=ep_ids[0], name="Counterparty LEI valid", rule_type="validity", description="LEI required for EMIR", exception_threshold_pct=1),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[8], endpoint_id=ep_ids[1], name="Position limit within threshold", rule_type="validity", description="Dodd-Frank 722 limit check", exception_threshold_pct=10, flagged_for_monitoring=1),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[0].id, data_element_id=de_ids[1], description="Position unit mismatch in aggregated view", status="open"),
    ])
    # SQL version and instances for first rule (Position quantity valid)
    sv1 = DataQualitySqlVersion(rule_id=dqrs[0].id, sql_text="SELECT id, position_qty FROM positions WHERE position_qty IS NULL OR position_qty < 0", version=1, is_live=1)
    db.add(sv1)
    db.flush()
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    for i in range(3):
        run_at = now - timedelta(days=i)
        db.add(DataQualityRuleInstance(rule_id=dqrs[0].id, data_element_id=de_ids[1], application_id=app_ids[0], run_at=run_at, passed=1 if i > 0 else 0, exception_count=i, exception_pct=min(100, i * 5), sql_version_id=sv1.id))
    db.add(RuleModRequest(rule_id=dqrs[4].id, status="requested"))
    db.flush()
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[1], data_element_id=de_ids[4], title="Delivery location codes", description="Multiple code schemes across regions", status="open"),
        DataConcern(domain_id=domain_id, application_id=app_ids[0], endpoint_id=ep_ids[0], title="EMIR timeliness", description="T+1 reporting occasionally delayed", status="open"),
        DataConcern(domain_id=domain_id, application_id=app_ids[2], endpoint_id=ep_ids[1], title="Dodd-Frank 722 data quality", description="Position limit data alignment with trading system", status="open"),
    ])
    db.add_all([
        DataElementSOR(data_element_id=de_ids[1], application_id=app_ids[0], physical_data_attribute="position_qty"),
        DataElementSOR(data_element_id=de_ids[1], application_id=app_ids[1], physical_data_attribute="inventory_balance"),
        DataElementSOR(data_element_id=de_ids[3], application_id=app_ids[0], physical_data_attribute="trade_dt"),
        DataElementSOR(data_element_id=de_ids[6], application_id=app_ids[0], physical_data_attribute="uti"),
    ])


def _seed_commercial_banking(db, domain_id):
    """L1 Commercial Banking: SNC, FR-Y-14Q, CECL, Call Report, CRE concentration."""
    apps = [
        Application(domain_id=domain_id, name="Commercial Loan Origination", description="Origination, underwriting, and credit approval"),
        Application(domain_id=domain_id, name="Commercial Deposit System", description="Deposits and commercial accounts"),
        Application(domain_id=domain_id, name="Loan Accounting & Servicing", description="Loan-level accounting, payments, and covenants"),
        Application(domain_id=domain_id, name="CECL Allowance Engine", description="Current Expected Credit Loss reserve calculation"),
        Application(domain_id=domain_id, name="Regulatory Reporting Hub", description="FR-Y-14, Call Report, SNC data aggregation"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Customer ID", description="Commercial customer identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Borrower ID", description="Borrower legal entity ID", element_type="logical"),
        DataElement(domain_id=domain_id, name="Loan Amount", description="Origination or outstanding amount", element_type="logical"),
        DataElement(domain_id=domain_id, name="Commitment Amount", description="Committed facility amount", element_type="logical"),
        DataElement(domain_id=domain_id, name="Outstanding Balance", description="Drawn balance", element_type="logical"),
        DataElement(domain_id=domain_id, name="NAICS Code", description="Industry classification", element_type="logical"),
        DataElement(domain_id=domain_id, name="Risk Rating", description="Internal risk rating", element_type="logical"),
        DataElement(domain_id=domain_id, name="ACLL Allowance", description="Allowance for credit losses (CECL)", element_type="logical"),
        DataElement(domain_id=domain_id, name="SNC Shared Amount", description="Shared National Credit participation amount", element_type="logical"),
        DataElement(domain_id=domain_id, name="Deposit Balance", description="Account balance", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Portfolio Review Pack", euc_type="euc", description="Excel portfolio review and concentration"),
        EUC(domain_id=domain_id, name="SNC Data Quality Tracker", euc_type="euc", description="Excel SNC submission prep and variance"),
        EUC(domain_id=domain_id, name="CECL Support Workbook", euc_type="itess", description="SharePoint CECL Q-factor and PD inputs"),
        EUC(domain_id=domain_id, name="Exception Report", euc_type="itess", description="SharePoint covenant exceptions"),
    ]
    db.add_all(eucs)
    db.flush()
    endpoints = [
        Endpoint(domain_id=domain_id, application_id=app_ids[4], name="Shared National Credit (SNC)", description="SNC shared credit submission to Fed/OCC"),
        Endpoint(domain_id=domain_id, application_id=app_ids[4], name="FR-Y-14Q Schedule L", description="FR-Y-14Q Schedule L (Commercial Real Estate)"),
        Endpoint(domain_id=domain_id, application_id=app_ids[4], name="FR-Y-14Q Schedule H", description="FR-Y-14Q Schedule H (Mortgage)"),
        Endpoint(domain_id=domain_id, application_id=app_ids[4], name="Call Report FFIEC 031/041", description="Call Report (Consolidated/ domestic)"),
        Endpoint(domain_id=domain_id, application_id=app_ids[3], name="CECL Reserve Report", description="CECL allowance and roll-forward"),
        Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Origination Report", description="New loan origination"),
        Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Deposit Report", description="Deposit balances by segment"),
    ]
    db.add_all(endpoints)
    db.flush()
    ep_ids = [e.id for e in endpoints]
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Customer ID not null", rule_type="validity", description="Customer ID required"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], name="Loan amount non-negative", rule_type="validity", description="Loan amount >= 0"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[4], name="Outstanding <= commitment", rule_type="validity", description="Outstanding must not exceed commitment"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[8], endpoint_id=ep_ids[0], name="SNC shared amount consistency", rule_type="accuracy", description="SNC participation sums to total"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[7], endpoint_id=ep_ids[4], name="CECL timeliness", rule_type="timeliness", description="CECL as of quarter end"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[3], endpoint_id=ep_ids[1], name="Schedule L CRE data complete", rule_type="validity", description="FR-Y-14Q L fields populated"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], endpoint_id=ep_ids[5], name="Origination customer ID present", rule_type="validity", description="Customer ID required for origination report"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[2].id, data_element_id=de_ids[4], description="Outstanding exceeded commitment in legacy data", status="closed"),
        DataQualityException(rule_id=dqrs[3].id, data_element_id=de_ids[8], description="SNC participation mismatch for 2024-Q1", status="open"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, data_element_id=de_ids[5], title="NAICS code accuracy", description="NAICS codes not updated after reclassification", status="open"),
        DataConcern(domain_id=domain_id, application_id=app_ids[4], endpoint_id=ep_ids[0], title="SNC submission timeliness", description="SNC data cut-off vs submission deadline", status="open"),
        DataConcern(domain_id=domain_id, application_id=app_ids[4], endpoint_id=ep_ids[2], title="Schedule H mortgage data", description="Mortgage segment alignment with source", status="open"),
    ])
    db.add_all([
        DataElementSOR(data_element_id=de_ids[0], application_id=app_ids[0], physical_data_attribute="customer_id"),
        DataElementSOR(data_element_id=de_ids[2], application_id=app_ids[0], physical_data_attribute="loan_amt"),
        DataElementSOR(data_element_id=de_ids[8], application_id=app_ids[4], physical_data_attribute="snc_participation_amt"),
    ])


def _seed_investment_banking(db, domain_id):
    """L1 Investment Banking: FR-Y-14, CCAR, capital plan, deal pipeline, underwriting."""
    apps = [
        Application(domain_id=domain_id, name="Deal Pipeline & CRM", description="M&A and capital markets pipeline and client tracking"),
        Application(domain_id=domain_id, name="Syndicate Book", description="Underwriting and book-building"),
        Application(domain_id=domain_id, name="Capital Planning & Stress Testing", description="CCAR, capital plan, and FR-Y-14 aggregation"),
        Application(domain_id=domain_id, name="Securities Underwriting Platform", description="IPO and follow-on issuance"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Deal ID", description="Unique deal identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Deal Value", description="Transaction or fee value", element_type="logical"),
        DataElement(domain_id=domain_id, name="Client ID", description="Client identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Deal Status", description="Pipeline status", element_type="logical"),
        DataElement(domain_id=domain_id, name="Fee Amount", description="Advisory or underwriting fee", element_type="logical"),
        DataElement(domain_id=domain_id, name="Tier 1 Capital", description="Tier 1 capital (FR-Y-14/CCAR)", element_type="logical"),
        DataElement(domain_id=domain_id, name="Risk-Weighted Assets", description="RWA by exposure type", element_type="logical"),
        DataElement(domain_id=domain_id, name="Stress Loss", description="Projected loss in stress scenario", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Pipeline Summary", euc_type="euc", description="Excel pipeline by sector"),
        EUC(domain_id=domain_id, name="League Table Input", euc_type="itess", description="SharePoint league table data"),
        EUC(domain_id=domain_id, name="CCAR Narrative Workbook", euc_type="euc", description="Excel CCAR narrative and assumption inputs"),
    ]
    db.add_all(eucs)
    db.flush()
    endpoints = [
        Endpoint(domain_id=domain_id, application_id=app_ids[2], name="FR-Y-14A Capital Plan", description="Annual capital plan submission (FR-Y-14A)"),
        Endpoint(domain_id=domain_id, application_id=app_ids[2], name="FR-Y-14Q Schedules", description="Quarterly FR-Y-14Q schedules (e.g. A-M)"),
        Endpoint(domain_id=domain_id, application_id=app_ids[2], name="CCAR Results", description="Comprehensive Capital Analysis and Review results"),
        Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Pipeline Report", description="Weekly pipeline"),
        Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Book Run Report", description="Book build and allocation"),
    ]
    db.add_all(endpoints)
    db.flush()
    ep_ids = [e.id for e in endpoints]
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Deal ID unique", rule_type="validity", description="Deal ID must be unique"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="Deal value non-negative", rule_type="validity", description="Deal value >= 0"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[5], endpoint_id=ep_ids[0], name="Tier 1 capital consistency", rule_type="accuracy", description="Tier 1 aligns with FR-Y-14A"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[4], endpoint_id=ep_ids[1], name="FR-Y-14Q fee consistency", rule_type="accuracy", description="Fee amounts align across schedules"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[7], endpoint_id=ep_ids[2], name="Stress loss non-negative", rule_type="validity", description="CCAR stress loss >= 0"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], endpoint_id=ep_ids[3], name="Pipeline deal ID unique", rule_type="validity", description="Deal ID unique in pipeline report"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[0], data_element_id=de_ids[2], title="Client ID cross-reference", description="Client ID not aligned with KYC system", status="open"),
        DataConcern(domain_id=domain_id, application_id=app_ids[2], endpoint_id=ep_ids[0], title="FR-Y-14A data lineage", description="Capital plan data from multiple source systems", status="open"),
        DataConcern(domain_id=domain_id, application_id=app_ids[1], endpoint_id=ep_ids[4], title="Book run allocation accuracy", description="Allocation vs order book consistency", status="open"),
    ])
    db.add_all([
        DataElementSOR(data_element_id=de_ids[0], application_id=app_ids[0], physical_data_attribute="deal_id"),
        DataElementSOR(data_element_id=de_ids[5], application_id=app_ids[2], physical_data_attribute="tier1_capital"),
    ])


# Map L1 domain name -> seed function (only L1 domains that have seed data)
L1_SEEDERS = {
    "L1 Equities": _seed_equities,
    "L1 Commodities": _seed_commodities,
    "L1 Commercial Banking": _seed_commercial_banking,
    "L1 Investment Banking": _seed_investment_banking,
}


def run_seed():
    """If not already seeded, insert L0/L1 domains and rich sample data."""
    _, SessionLocal = get_engine_and_session()
    db = SessionLocal()
    try:
        existing = db.query(SeedFlag).first()
        if existing:
            _add_users(db)  # Seed users if table empty (e.g. added after first seed)
            db.commit()
            return  # Already seeded

        name_to_id = _add_domains(db)
        _add_users(db)

        for l1_name, seeder in L1_SEEDERS.items():
            if l1_name in name_to_id:
                seeder(db, name_to_id[l1_name])

        db.add(SeedFlag())
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def reset_and_reseed():
    """
    Delete all domain-related data and the seed flag, then re-run the seed.
    Use this to replace old/imported domains with the current seed hierarchy (e.g. L0 Markets, L0 Banking).
    """
    _, SessionLocal = get_engine_and_session()
    db = SessionLocal()
    try:
        # Delete in dependency order (children before parents)
        db.query(DataConcern).delete()
        db.query(DataQualityException).delete()
        db.query(RuleModRequest).delete()
        db.query(DataQualityRuleInstance).delete()
        db.query(DataQualitySqlVersion).delete()
        db.query(DataQualityRule).delete()
        db.query(Endpoint).delete()
        db.query(EUC).delete()
        db.query(Application).delete()
        db.query(DataElementSOR).delete()
        db.query(DataElement).delete()
        # Domains: clear parent_id to avoid self-FK, then delete all
        db.query(Domain).update({Domain.parent_id: None})
        db.query(Domain).delete()
        db.query(SeedFlag).delete()
        db.flush()

        name_to_id = _add_domains(db)
        _add_users(db)
        for l1_name, seeder in L1_SEEDERS.items():
            if l1_name in name_to_id:
                seeder(db, name_to_id[l1_name])
        db.add(SeedFlag())
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "reset":
        reset_and_reseed()
        print("Database reset and re-seeded with current domain hierarchy.")
    elif len(sys.argv) > 1 and sys.argv[1] == "set-passwords":
        set_all_passwords()
    else:
        run_seed()
