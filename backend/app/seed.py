"""
Seed the database with sample data on first run.
Checks SeedFlag table; if no row exists, creates L0/L1 domain hierarchy and rich
applications, data elements, EUCs, endpoints, DQ rules, DQ exceptions, and data concerns.
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


# L0 and L1 domain structure: (L0_name, [L1_children])
DOMAIN_HIERARCHY = [
    ("Services", [
        "Liquidity Management",
        "Payments",
        "Trade & Working Capital Solutions",
        "Platforms and Data Services",
        "Investor Services",
        "Issuer Services",
    ]),
    ("Markets", [
        "Commodities",
        "Equities",
        "Foreign Exchange",
        "Rates",
        "Spread Products",
    ]),
    ("Banking & International", [
        "Investment Banking",
        "Corporate Banking",
        "Commercial Banking",
    ]),
    ("Wealth", [
        "Citi Private Bank",
        "Citigold & Citigold Private Client",
        "Wealth at Work",
        "Citi Global Wealth Investments (incl. Citi Investment Management)",
        "Lending",
    ]),
    ("U.S. Personal Banking", [
        "Branded Cards",
        "Retail Services",
        "Retail Banking",
    ]),
]


def _add_domains(db):
    """Create L0 and L1 domains. Returns dict: domain_name -> domain id."""
    name_to_id = {}
    for l0_name, l1_names in DOMAIN_HIERARCHY:
        l0 = Domain(
            name=l0_name,
            description=f"{l0_name} organization and data domain.",
            parent_id=None,
        )
        db.add(l0)
        db.flush()
        name_to_id[l0_name] = l0.id
        for l1_name in l1_names:
            l1 = Domain(
                name=l1_name,
                description=f"{l1_name} under {l0_name}.",
                parent_id=l0.id,
            )
            db.add(l1)
            db.flush()
            name_to_id[l1_name] = l1.id
    return name_to_id


def _seed_liquidity_management(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Liquidity Hub", description="Central liquidity positioning and forecasting platform"),
        Application(domain_id=domain_id, name="Intraday Cash Engine", description="Real-time cash and collateral management"),
        Application(domain_id=domain_id, name="Balance Sheet Optimizer", description="ALM and balance sheet optimization"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Daily Cash Position", description="End-of-day cash balance by legal entity", element_type="logical"),
        DataElement(domain_id=domain_id, name="Projected Cash Flow", description="Forecasted inflows/outflows by currency", element_type="logical"),
        DataElement(domain_id=domain_id, name="Intraday Liquidity Buffer", description="Regulatory intraday liquidity metric", element_type="logical"),
        DataElement(domain_id=domain_id, name="Legal Entity ID", description="Unique identifier for legal entity", element_type="logical"),
        DataElement(domain_id=domain_id, name="Currency Code", description="ISO currency code", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Treasury Daily Dashboard", euc_type="euc", description="Excel-based daily cash summary"),
        EUC(domain_id=domain_id, name="Liquidity Stress Scenarios", euc_type="itess", description="SharePoint stress test workbooks"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="LCR Regulatory Report", description="Liquidity Coverage Ratio submission")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Intraday Monitoring", description="Real-time liquidity monitoring")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Cash position non-null", rule_type="validity", description="Daily cash position must be populated"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], endpoint_id=ep1.id, name="Projected flow timeliness", rule_type="timeliness", description="Projections must be as of T+0"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[3], name="Legal entity ID format", rule_type="validity", description="Legal entity ID must match registry"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[0].id, data_element_id=de_ids[0], description="Missing cash position for LEI XYZ on 2024-01-15", status="closed"),
        DataQualityException(rule_id=dqrs[1].id, data_element_id=de_ids[1], description="Stale projection in LCR run for EUR", status="open"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[0], data_element_id=de_ids[0], title="Multi-source cash reconciliation", description="Cash position sourced from 3 systems; alignment gaps", status="open"),
        DataConcern(domain_id=domain_id, title="Intraday data latency", description="Intraday feeds delayed during peak settlement", status="open"),
    ])


def _seed_payments(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Payment Hub", description="Central payment orchestration and routing"),
        Application(domain_id=domain_id, name="SWIFT Gateway", description="SWIFT message handling and compliance"),
        Application(domain_id=domain_id, name="Real-Time Payments Engine", description="Instant payment processing"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Payment Reference", description="Unique payment identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Beneficiary Account", description="Destination account number", element_type="logical"),
        DataElement(domain_id=domain_id, name="Payment Amount", description="Transaction amount in transaction currency", element_type="logical"),
        DataElement(domain_id=domain_id, name="Payment Timestamp", description="Initiation and settlement timestamps", element_type="logical"),
        DataElement(domain_id=domain_id, name="Originator ID", description="Payer identifier for AML/KYC", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Payment Exception Tracker", euc_type="euc", description="Excel tracker for failed payments"),
        EUC(domain_id=domain_id, name="RTP Dashboard", euc_type="itess", description="Power BI real-time payment volumes"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Batch Payment File", description="Bulk payment submission")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[2], name="RTP Status API", description="Real-time payment status")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Payment ref unique", rule_type="validity", description="Payment reference must be unique per day"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], name="Amount positive", rule_type="validity", description="Payment amount must be positive"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[3], endpoint_id=ep2.id, name="Timestamp within SLA", rule_type="timeliness", description="Settlement within 60 seconds"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[0].id, data_element_id=de_ids[0], description="Duplicate payment ref in batch 2024-02-01", status="open"),
        DataQualityException(rule_id=dqrs[2].id, data_element_id=de_ids[3], description="RTP settlement delay spike on 2024-01-20", status="closed"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[0], data_element_id=de_ids[1], title="Beneficiary account validation", description="Cross-border account format inconsistencies", status="open"),
        DataConcern(domain_id=domain_id, title="SWIFT MT/MX migration", description="Data mapping gaps in MX migration", status="open"),
    ])


def _seed_trade_working_capital(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Trade Finance Portal", description="Letters of credit and trade documents"),
        Application(domain_id=domain_id, name="Supply Chain Finance Platform", description="Supplier financing and payables"),
        Application(domain_id=domain_id, name="Working Capital Analytics", description="DPO/DSO and facility utilization reporting"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="LC Reference Number", description="Letter of credit identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Invoice Amount", description="Invoice value in document currency", element_type="logical"),
        DataElement(domain_id=domain_id, name="Due Date", description="Payment or maturity date", element_type="logical"),
        DataElement(domain_id=domain_id, name="Counterparty ID", description="Buyer or supplier identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Facility Limit", description="Committed facility amount", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Trade Pipeline Tracker", euc_type="euc", description="Excel pipeline by region"),
        EUC(domain_id=domain_id, name="SCF Utilization Report", euc_type="itess", description="SharePoint monthly utilization"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="LC Issuance Report", description="Daily LC issuance and amendments")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[2], name="Working Capital Report", description="Monthly DPO/DSO metrics")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="LC ref format", rule_type="validity", description="LC reference must match SWIFT format"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], name="Due date in future", rule_type="validity", description="Due date must be >= value date"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[4], endpoint_id=ep2.id, name="Facility limit refreshed", rule_type="timeliness", description="Limit data refreshed daily"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[1].id, data_element_id=de_ids[2], description="Historical invoices with past due dates in legacy load", status="closed"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[1], data_element_id=de_ids[3], title="Counterparty hierarchy", description="Parent/subsidiary linking incomplete", status="open"),
    ])


def _seed_platforms_data_services(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Enterprise Data Platform", description="Central data lake and catalog"),
        Application(domain_id=domain_id, name="API Gateway", description="Internal and external API management"),
        Application(domain_id=domain_id, name="Reference Data Service", description="Golden source for reference data"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Entity Master ID", description="Golden record identifier for legal entity", element_type="logical"),
        DataElement(domain_id=domain_id, name="Instrument ID", description="Security or product identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Data Classification", description="Sensitivity label (public, internal, confidential)", element_type="logical"),
        DataElement(domain_id=domain_id, name="Last Refreshed At", description="Timestamp of last data refresh", element_type="logical"),
        DataElement(domain_id=domain_id, name="Source System", description="System of record for the data", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Data Catalog Requests", euc_type="itess", description="SharePoint intake for new datasets"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Data Lineage Export", description="Lineage graph export for regulatory")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[2], name="Reference Data API", description="Real-time reference data API")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Entity ID not null", rule_type="validity", description="Entity master ID required"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[3], endpoint_id=ep2.id, name="Refresh within SLA", rule_type="timeliness", description="Reference data refreshed within 15 min"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[0].id, data_element_id=de_ids[0], description="Null entity ID in legacy party load", status="open"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[0], title="Lineage coverage", description="Only 60% of critical flows have lineage", status="open"),
        DataConcern(domain_id=domain_id, data_element_id=de_ids[2], title="Classification drift", description="Some fields reclassified without audit", status="open"),
    ])


def _seed_investor_services(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Custody Platform", description="Asset servicing and custody"),
        Application(domain_id=domain_id, name="Fund Admin", description="Fund accounting and NAV"),
        Application(domain_id=domain_id, name="Proxy Voting", description="Voting and corporate actions"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Client Account Number", description="Custody account identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Holdings Quantity", description="Position quantity", element_type="logical"),
        DataElement(domain_id=domain_id, name="NAV Date", description="Valuation date for NAV", element_type="logical"),
        DataElement(domain_id=domain_id, name="Vote Instruction", description="Voting instruction (for/against/abstain)", element_type="logical"),
        DataElement(domain_id=domain_id, name="Corporate Action ID", description="Corporate action event identifier", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Client Holdings Summary", euc_type="euc", description="Excel client position pack"),
        EUC(domain_id=domain_id, name="Voting Exception Log", euc_type="itess", description="SharePoint voting overrides"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Position Report", description="Daily position report")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="NAV Publication", description="Daily NAV file")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="Holdings non-negative", rule_type="validity", description="Holdings quantity must be >= 0"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], endpoint_id=ep2.id, name="NAV date = T", rule_type="timeliness", description="NAV date must be current business day"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[0].id, data_element_id=de_ids[1], description="Negative position in transition account", status="closed"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[2], data_element_id=de_ids[3], title="Vote instruction audit", description="Need full audit trail for ESG reporting", status="open"),
    ])


def _seed_issuer_services(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Depositary Receipt System", description="DR issuance and servicing"),
        Application(domain_id=domain_id, name="Agency & Trust", description="Debt agency and trustee services"),
        Application(domain_id=domain_id, name="Escrow Services", description="Escrow and transaction closing"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="ISIN", description="International Security Identification Number", element_type="logical"),
        DataElement(domain_id=domain_id, name="CUSIP", description="CUSIP identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Outstanding Amount", description="Outstanding principal or shares", element_type="logical"),
        DataElement(domain_id=domain_id, name="Interest Payment Date", description="Coupon or dividend payment date", element_type="logical"),
        DataElement(domain_id=domain_id, name="Issuer LEI", description="Issuer legal entity identifier", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="DR Inventory Tracker", euc_type="euc", description="Excel DR inventory by market"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="DR Outstanding Report", description="Daily DR outstanding")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Bond Register", description="Debt register for trustee")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="ISIN format", rule_type="validity", description="ISIN must be 12 alphanumeric"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], name="Outstanding non-negative", rule_type="validity", description="Outstanding amount >= 0"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[1], data_element_id=de_ids[4], title="Issuer LEI maintenance", description="Issuer LEI updates not always propagated", status="open"),
    ])


def _seed_commodities(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Commodities Trading Platform", description="Front-office commodities trading"),
        Application(domain_id=domain_id, name="Physical Commodities Ledger", description="Inventory and physical settlement"),
        Application(domain_id=domain_id, name="Commodities Risk Engine", description="VaR and position limits"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Commodity Code", description="Product code (e.g. WTI, Brent)", element_type="logical"),
        DataElement(domain_id=domain_id, name="Position Quantity", description="Net position in contract or physical units", element_type="logical"),
        DataElement(domain_id=domain_id, name="Mark-to-Market Price", description="Valuation price", element_type="logical"),
        DataElement(domain_id=domain_id, name="Trade Date", description="Execution date", element_type="logical"),
        DataElement(domain_id=domain_id, name="Delivery Location", description="Delivery or delivery point code", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Physical Inventory Recon", euc_type="euc", description="Excel reconciliation with warehouses"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Daily P&L", description="Commodities P&L report")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[2], name="Position Limit Report", description="Limit utilization")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="Position quantity valid", rule_type="validity", description="Position must be numeric"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[3], endpoint_id=ep1.id, name="Trade date within period", rule_type="timeliness", description="Trade date in reporting period"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[0].id, data_element_id=de_ids[1], description="Position unit mismatch in aggregated view", status="open"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[1], data_element_id=de_ids[4], title="Delivery location codes", description="Multiple code schemes across regions", status="open"),
    ])


def _seed_equities(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Equity Order Management", description="Order management and execution"),
        Application(domain_id=domain_id, name="Equity Position Ledger", description="Positions and corporate actions"),
        Application(domain_id=domain_id, name="Prime Brokerage Platform", description="Prime brokerage and stock loan"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Order ID", description="Unique order identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Fill Price", description="Execution price", element_type="logical"),
        DataElement(domain_id=domain_id, name="Fill Quantity", description="Executed quantity", element_type="logical"),
        DataElement(domain_id=domain_id, name="SEDOL", description="Stock Exchange Daily Official List identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Settlement Date", description="Settlement date (T+1, T+2)", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Block Trade Tracker", euc_type="euc", description="Excel block trade log"),
        EUC(domain_id=domain_id, name="Stock Loan Dashboard", euc_type="itess", description="Power BI stock loan utilization"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Execution Report", description="Fill and allocation report")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Position Report", description="End-of-day positions")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Order ID unique", rule_type="validity", description="Order ID must be unique"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], name="Fill qty positive", rule_type="validity", description="Fill quantity must be positive"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[4], endpoint_id=ep2.id, name="Settlement date T+2", rule_type="timeliness", description="Settlement date consistent with market"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[1].id, data_element_id=de_ids[2], description="Cancel fill with zero qty not flagged", status="closed"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, data_element_id=de_ids[3], title="SEDOL vs ISIN mapping", description="Mapping table out of date for new listings", status="open"),
    ])


def _seed_foreign_exchange(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="FX Trading Platform", description="Spot and forward FX trading"),
        Application(domain_id=domain_id, name="FX Settlement Engine", description="CLS and non-CLS settlement"),
        Application(domain_id=domain_id, name="FX Options System", description="Vanilla and exotic options"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Currency Pair", description="Base and terms currency (e.g. EURUSD)", element_type="logical"),
        DataElement(domain_id=domain_id, name="Deal Rate", description="Execution rate", element_type="logical"),
        DataElement(domain_id=domain_id, name="Notional Amount", description="Deal notional in base currency", element_type="logical"),
        DataElement(domain_id=domain_id, name="Value Date", description="Settlement value date", element_type="logical"),
        DataElement(domain_id=domain_id, name="Deal Type", description="Spot, forward, swap, option", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="FX Exposure Summary", euc_type="euc", description="Excel net exposure by pair"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="FX Deal Ticket", description="Deal capture feed")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Settlement Status", description="Settlement status report")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Currency pair valid", rule_type="validity", description="Pair must be valid ISO pair"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], name="Notional positive", rule_type="validity", description="Notional must be positive"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[3], endpoint_id=ep2.id, name="Value date alignment", rule_type="timeliness", description="Value date matches settlement"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[0].id, data_element_id=de_ids[0], description="Legacy pair code EUR/USD instead of EURUSD", status="closed"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[2], data_element_id=de_ids[4], title="Option deal type taxonomy", description="Exotic option types not consistently tagged", status="open"),
    ])


def _seed_rates(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Rates Trading System", description="Government bonds and rates derivatives"),
        Application(domain_id=domain_id, name="Repo & Financing", description="Repo and reverse repo"),
        Application(domain_id=domain_id, name="Rates Risk", description="Rates VaR and sensitivity"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Security ID", description="Bond or contract identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Yield", description="Yield to maturity or par", element_type="logical"),
        DataElement(domain_id=domain_id, name="Duration", description="Modified duration", element_type="logical"),
        DataElement(domain_id=domain_id, name="Repo Rate", description="Repo rate for financing", element_type="logical"),
        DataElement(domain_id=domain_id, name="Maturity Date", description="Maturity or expiry date", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Rates P&L Recon", euc_type="euc", description="Excel P&L vs risk system"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Rates P&L Report", description="Daily rates P&L")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Repo Book", description="Repo position and rates")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Security ID not null", rule_type="validity", description="Security ID required"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[4], name="Maturity date format", rule_type="validity", description="Maturity date ISO format"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[0], data_element_id=de_ids[1], title="Yield source", description="Yield from multiple vendors; reconciliation needed", status="open"),
    ])


def _seed_spread_products(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Credit Trading Platform", description="Credit default swaps and bonds"),
        Application(domain_id=domain_id, name="Securitized Products", description="ABS, RMBS, CMBS"),
        Application(domain_id=domain_id, name="Credit Risk", description="CVA and credit VaR"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Reference Entity", description="CDS reference entity or obligor", element_type="logical"),
        DataElement(domain_id=domain_id, name="Spread", description="CDS spread or bond spread", element_type="logical"),
        DataElement(domain_id=domain_id, name="Tier", description="Seniority tier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Pool ID", description="Securitization pool identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Default Probability", description="PD or default probability", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Credit Limit Tracker", euc_type="euc", description="Excel counterparty limit usage"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="CDS Position Report", description="CDS positions by reference entity")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[2], name="CVA Report", description="Credit valuation adjustment")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Reference entity valid", rule_type="validity", description="Reference entity must be in master"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="Spread non-negative", rule_type="validity", description="Spread must be >= 0"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[1].id, data_element_id=de_ids[1], description="Negative spread in stressed scenario output", status="open"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[1], data_element_id=de_ids[3], title="Pool ID mapping", description="Pool IDs differ across ABS systems", status="open"),
    ])


def _seed_investment_banking(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Deal Pipeline", description="M&A and capital markets pipeline"),
        Application(domain_id=domain_id, name="Syndicate Book", description="Underwriting and book-building"),
        Application(domain_id=domain_id, name="Advisory CRM", description="Client and deal tracking"),
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
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Pipeline Summary", euc_type="euc", description="Excel pipeline by sector"),
        EUC(domain_id=domain_id, name="League Table Input", euc_type="itess", description="SharePoint league table data"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Pipeline Report", description="Weekly pipeline")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Book Run Report", description="Book build and allocation")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Deal ID unique", rule_type="validity", description="Deal ID must be unique"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="Deal value non-negative", rule_type="validity", description="Deal value >= 0"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[0], data_element_id=de_ids[2], title="Client ID cross-reference", description="Client ID not aligned with KYC system", status="open"),
    ])


def _seed_corporate_banking(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Corporate Lending Platform", description="Loans and commitments"),
        Application(domain_id=domain_id, name="Cash Management", description="Corporate cash and liquidity"),
        Application(domain_id=domain_id, name="Trade Services", description="Trade finance and guarantees"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Borrower ID", description="Borrower legal entity ID", element_type="logical"),
        DataElement(domain_id=domain_id, name="Commitment Amount", description="Committed facility amount", element_type="logical"),
        DataElement(domain_id=domain_id, name="Outstanding Balance", description="Drawn balance", element_type="logical"),
        DataElement(domain_id=domain_id, name="Interest Rate", description="Applicable rate", element_type="logical"),
        DataElement(domain_id=domain_id, name="Maturity Date", description="Facility maturity", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Portfolio Summary", euc_type="euc", description="Excel portfolio by industry"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Loan Register", description="Loan and commitment register")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Balance Report", description="Corporate account balances")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="Commitment >= outstanding", rule_type="validity", description="Commitment must be >= outstanding"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[4], name="Maturity date valid", rule_type="validity", description="Maturity date in future at inception"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[0].id, data_element_id=de_ids[2], description="Outstanding exceeded commitment in legacy data", status="closed"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, data_element_id=de_ids[0], title="Borrower ID", description="Borrower ID vs legal entity master sync", status="open"),
    ])


def _seed_commercial_banking(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Commercial Loan Origination", description="Origination and underwriting"),
        Application(domain_id=domain_id, name="Commercial Deposit System", description="Deposits and accounts"),
        Application(domain_id=domain_id, name="Commercial Treasury", description="Payments and liquidity for commercial clients"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Customer ID", description="Commercial customer identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Loan Amount", description="Origination or outstanding amount", element_type="logical"),
        DataElement(domain_id=domain_id, name="Deposit Balance", description="Account balance", element_type="logical"),
        DataElement(domain_id=domain_id, name="NAICS Code", description="Industry classification", element_type="logical"),
        DataElement(domain_id=domain_id, name="Risk Rating", description="Internal risk rating", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Portfolio Review Pack", euc_type="euc", description="Excel portfolio review"),
        EUC(domain_id=domain_id, name="Exception Report", euc_type="itess", description="SharePoint covenant exceptions"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Origination Report", description="New loan origination")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Deposit Report", description="Deposit balances by segment")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Customer ID not null", rule_type="validity", description="Customer ID required"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], name="Balance non-negative", rule_type="validity", description="Deposit balance >= 0"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataConcern(domain_id=domain_id, data_element_id=de_ids[3], title="NAICS code accuracy", description="NAICS codes not updated after reclassification", status="open"),
    ])


def _seed_citi_private_bank(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Wealth Platform", description="Client portfolio and reporting"),
        Application(domain_id=domain_id, name="Private Bank Lending", description="Lombard and mortgage lending"),
        Application(domain_id=domain_id, name="Estate & Trust", description="Estate planning and trust administration"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Client ID", description="Private bank client identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="AUM", description="Assets under management", element_type="logical"),
        DataElement(domain_id=domain_id, name="Net Worth", description="Client net worth", element_type="logical"),
        DataElement(domain_id=domain_id, name="Risk Profile", description="Client risk tolerance", element_type="logical"),
        DataElement(domain_id=domain_id, name="Account Type", description="Account type (discretionary, advisory, etc.)", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Client Review Pack", euc_type="euc", description="Excel client review package"),
        EUC(domain_id=domain_id, name="Estate Summary", euc_type="itess", description="SharePoint estate summary"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="AUM Report", description="Monthly AUM report")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Lending Report", description="Lending exposure report")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="AUM non-negative", rule_type="validity", description="AUM must be >= 0"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], name="Net worth consistency", rule_type="accuracy", description="Net worth vs AUM + liabilities check"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[0], data_element_id=de_ids[3], title="Risk profile refresh", description="Risk profiles not refreshed annually", status="open"),
    ])


def _seed_citigold_private_client(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Citigold Platform", description="Citigold and CPC client servicing"),
        Application(domain_id=domain_id, name="Priority Banking", description="Priority banking products and services"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Client Tier", description="Citigold, CPC, etc.", element_type="logical"),
        DataElement(domain_id=domain_id, name="Relationship Balance", description="Total relationship balance", element_type="logical"),
        DataElement(domain_id=domain_id, name="Product Holdings", description="Product count or list", element_type="logical"),
        DataElement(domain_id=domain_id, name="Eligibility Date", description="Date qualified for tier", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Tier Migration Tracker", euc_type="euc", description="Excel tier upgrade/downgrade tracker"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Tier Report", description="Client tier and balance report")
    db.add(ep1)
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="Relationship balance non-negative", rule_type="validity", description="Balance >= 0"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[3], name="Eligibility date valid", rule_type="validity", description="Eligibility date not future"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataConcern(domain_id=domain_id, data_element_id=de_ids[0], title="Client tier logic", description="Tier logic differs between regions", status="open"),
    ])


def _seed_wealth_at_work(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="401(k) Recordkeeping", description="Defined contribution recordkeeping"),
        Application(domain_id=domain_id, name="Equity Plan Administration", description="Stock options and RSUs"),
        Application(domain_id=domain_id, name="Benefit Wallet", description="Benefits and wellness platform"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Plan ID", description="Retirement or equity plan identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Participant ID", description="Plan participant identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Account Balance", description="Plan account balance", element_type="logical"),
        DataElement(domain_id=domain_id, name="Vesting Date", description="Vesting date for equity", element_type="logical"),
        DataElement(domain_id=domain_id, name="Employer ID", description="Sponsor employer identifier", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Plan Analytics", euc_type="euc", description="Excel plan participation and balance"),
        EUC(domain_id=domain_id, name="Vesting Schedule", euc_type="itess", description="SharePoint vesting calendar"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Participant Statement", description="Quarterly participant statement")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Vesting Report", description="Vesting and exercise report")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], name="Account balance non-negative", rule_type="validity", description="Balance >= 0"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[3], name="Vesting date format", rule_type="validity", description="Vesting date valid"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[0], data_element_id=de_ids[1], title="Participant ID", description="Participant ID vs HR system alignment", status="open"),
    ])


def _seed_global_wealth_investments(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Citi Investment Management", description="Discretionary and advisory portfolios"),
        Application(domain_id=domain_id, name="Model Portfolio Platform", description="Model portfolio and rebalancing"),
        Application(domain_id=domain_id, name="Wealth Research", description="Research and recommendations"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Portfolio ID", description="Portfolio identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Holdings Value", description="Market value of holdings", element_type="logical"),
        DataElement(domain_id=domain_id, name="Model Code", description="Model portfolio code", element_type="logical"),
        DataElement(domain_id=domain_id, name="Rebalance Date", description="Last rebalance date", element_type="logical"),
        DataElement(domain_id=domain_id, name="Benchmark ID", description="Benchmark identifier", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Model Drift Report", euc_type="euc", description="Excel model vs actual allocation"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Portfolio Report", description="Monthly portfolio report")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Rebalance Report", description="Rebalance activity")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="Holdings value non-negative", rule_type="validity", description="Value >= 0"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[3], endpoint_id=ep2.id, name="Rebalance date timeliness", rule_type="timeliness", description="Rebalance date within SLA"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataConcern(domain_id=domain_id, data_element_id=de_ids[2], title="Model code taxonomy", description="Model codes not aligned across regions", status="open"),
    ])


def _seed_wealth_lending(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Wealth Lending Platform", description="Secured and unsecured lending for wealth clients"),
        Application(domain_id=domain_id, name="Margin Lending", description="Securities-backed lending"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Loan ID", description="Loan identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Collateral Value", description="Collateral market value", element_type="logical"),
        DataElement(domain_id=domain_id, name="LTV", description="Loan-to-value ratio", element_type="logical"),
        DataElement(domain_id=domain_id, name="Margin Call Flag", description="Margin call indicator", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Margin Call Log", euc_type="euc", description="Excel margin call tracking"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Loan Report", description="Loan and collateral report")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Margin Report", description="Margin utilization report")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], name="LTV within limit", rule_type="validity", description="LTV must be within policy limit"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="Collateral value refreshed", rule_type="timeliness", description="Collateral value daily"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[0].id, data_element_id=de_ids[2], description="LTV breach in stress scenario", status="open"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[1], data_element_id=de_ids[3], title="Margin call timeliness", description="Margin call data delayed in peak volatility", status="open"),
    ])


def _seed_branded_cards(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Card Issuing Platform", description="Card issuance and lifecycle"),
        Application(domain_id=domain_id, name="Rewards Engine", description="Points and rewards calculation"),
        Application(domain_id=domain_id, name="Card Servicing", description="Customer servicing and disputes"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Card Number", description="Primary account number (tokenized)", element_type="logical"),
        DataElement(domain_id=domain_id, name="Credit Limit", description="Card credit limit", element_type="logical"),
        DataElement(domain_id=domain_id, name="Outstanding Balance", description="Revolving balance", element_type="logical"),
        DataElement(domain_id=domain_id, name="Points Balance", description="Reward points balance", element_type="logical"),
        DataElement(domain_id=domain_id, name="Transaction Amount", description="Individual transaction amount", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Campaign Performance", euc_type="euc", description="Excel campaign ROI"),
        EUC(domain_id=domain_id, name="Dispute Tracker", euc_type="itess", description="SharePoint dispute status"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Card Portfolio Report", description="Card portfolio metrics")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Rewards Statement", description="Monthly rewards statement")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="Credit limit positive", rule_type="validity", description="Credit limit > 0"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], name="Balance <= limit", rule_type="validity", description="Outstanding balance must not exceed limit"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[4], name="Transaction amount valid", rule_type="validity", description="Transaction amount non-zero"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[1].id, data_element_id=de_ids[2], description="Balance exceed limit in legacy migration", status="closed"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[1], data_element_id=de_ids[3], title="Points calculation", description="Points rules differ by product; reconciliation gaps", status="open"),
    ])


def _seed_retail_services(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Retail Servicing Platform", description="Consumer loan and account servicing"),
        Application(domain_id=domain_id, name="Collections", description="Delinquency and collections"),
        Application(domain_id=domain_id, name="Customer Communications", description="Statements and notifications"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Account Number", description="Consumer account identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Delinquency Days", description="Days past due", element_type="logical"),
        DataElement(domain_id=domain_id, name="Payment Due Date", description="Next payment due date", element_type="logical"),
        DataElement(domain_id=domain_id, name="Statement Balance", description="Statement cycle balance", element_type="logical"),
        DataElement(domain_id=domain_id, name="Contact Preference", description="Preferred contact channel", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Collections Pipeline", euc_type="euc", description="Excel collections pipeline"),
        EUC(domain_id=domain_id, name="Servicing Dashboard", euc_type="itess", description="Power BI servicing metrics"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Account Summary", description="Account summary report")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[1], name="Delinquency Report", description="Delinquency and roll rate")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Account number not null", rule_type="validity", description="Account number required"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="DPD non-negative", rule_type="validity", description="Delinquency days >= 0"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[1].id, data_element_id=de_ids[1], description="Negative DPD in legacy portfolio", status="closed"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[1], data_element_id=de_ids[2], title="Due date alignment", description="Due dates differ between billing and collections", status="open"),
    ])


def _seed_retail_banking(db, domain_id):
    apps = [
        Application(domain_id=domain_id, name="Core Banking", description="Deposits, checking, savings"),
        Application(domain_id=domain_id, name="Branch Platform", description="Branch teller and sales"),
        Application(domain_id=domain_id, name="Digital Banking", description="Online and mobile banking"),
    ]
    db.add_all(apps)
    db.flush()
    app_ids = [a.id for a in apps]
    des = [
        DataElement(domain_id=domain_id, name="Customer ID", description="Retail customer identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Account Balance", description="Deposit account balance", element_type="logical"),
        DataElement(domain_id=domain_id, name="Transaction ID", description="Transaction identifier", element_type="logical"),
        DataElement(domain_id=domain_id, name="Product Type", description="Product (checking, savings, etc.)", element_type="logical"),
        DataElement(domain_id=domain_id, name="Branch ID", description="Branch identifier", element_type="logical"),
    ]
    db.add_all(des)
    db.flush()
    de_ids = [de.id for de in des]
    eucs = [
        EUC(domain_id=domain_id, name="Branch Scorecard", euc_type="euc", description="Excel branch performance"),
        EUC(domain_id=domain_id, name="Product P&L", euc_type="itess", description="SharePoint product profitability"),
    ]
    db.add_all(eucs)
    db.flush()
    ep1 = Endpoint(domain_id=domain_id, application_id=app_ids[0], name="Balance Report", description="Daily balance report")
    ep2 = Endpoint(domain_id=domain_id, application_id=app_ids[2], name="Transaction Log", description="Digital transaction log")
    db.add_all([ep1, ep2])
    db.flush()
    dqrs = [
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[0], name="Customer ID not null", rule_type="validity", description="Customer ID required"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[1], name="Balance consistency", rule_type="accuracy", description="Balance = sum of transactions"),
        DataQualityRule(domain_id=domain_id, data_element_id=de_ids[2], endpoint_id=ep2.id, name="Transaction ID unique", rule_type="validity", description="Transaction ID unique"),
    ]
    db.add_all(dqrs)
    db.flush()
    db.add_all([
        DataQualityException(rule_id=dqrs[1].id, data_element_id=de_ids[1], description="Balance mismatch in core migration", status="open"),
    ])
    db.add_all([
        DataConcern(domain_id=domain_id, application_id=app_ids[0], data_element_id=de_ids[0], title="Customer ID", description="Customer ID vs identity system alignment", status="open"),
    ])


# Map L1 domain name -> seed function
L1_SEEDERS = {
    "Liquidity Management": _seed_liquidity_management,
    "Payments": _seed_payments,
    "Trade & Working Capital Solutions": _seed_trade_working_capital,
    "Platforms and Data Services": _seed_platforms_data_services,
    "Investor Services": _seed_investor_services,
    "Issuer Services": _seed_issuer_services,
    "Commodities": _seed_commodities,
    "Equities": _seed_equities,
    "Foreign Exchange": _seed_foreign_exchange,
    "Rates": _seed_rates,
    "Spread Products": _seed_spread_products,
    "Investment Banking": _seed_investment_banking,
    "Corporate Banking": _seed_corporate_banking,
    "Commercial Banking": _seed_commercial_banking,
    "Citi Private Bank": _seed_citi_private_bank,
    "Citigold & Citigold Private Client": _seed_citigold_private_client,
    "Wealth at Work": _seed_wealth_at_work,
    "Citi Global Wealth Investments (incl. Citi Investment Management)": _seed_global_wealth_investments,
    "Lending": _seed_wealth_lending,
    "Branded Cards": _seed_branded_cards,
    "Retail Services": _seed_retail_services,
    "Retail Banking": _seed_retail_banking,
}


def run_seed():
    """If not already seeded, insert L0/L1 domains and rich sample data."""
    _, SessionLocal = get_engine_and_session()
    db = SessionLocal()
    try:
        existing = db.query(SeedFlag).first()
        if existing:
            return  # Already seeded

        name_to_id = _add_domains(db)

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
    run_seed()
