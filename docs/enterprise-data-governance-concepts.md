# Enterprise Data Governance — Concepts, Relationships, Actions & Metrics

This document outlines the **concepts** in the Data Manager Portal (DMP) from an **enterprise data governance** standpoint, including their relationships, expected user actions, and governance metrics for the program.

---

## 1. Concepts (Governance Entity Model)

### 1.1 Organizational & Scoping

| Concept | Description | Governance Role |
|--------|-------------|-----------------|
| **Domain** | Hierarchical container (L0 → L1 → L2 → L3) for organizing data assets by business area (e.g. Markets/Equities/Cash, Banking/Commercial Banking). | **Data domain** — defines ownership, scope, and accountability; used for attestation and reporting. |
| **User** | Portal user with identity (email, name, role). | **Steward / actor** — who performs governance actions; future: roles (admin, editor, viewer) for access control. |

### 1.2 Critical Data & Systems

| Concept | Description | Governance Role |
|--------|-------------|-----------------|
| **Critical Data Element (CDE)** | A business-significant data element (logical or physical) owned by a domain. | **Core governed asset** — what the program tracks, attests, and applies quality rules to. |
| **Data Element System of Record (SOR)** | Link between a CDE and the **application** that is the authoritative source, optionally with physical attribute name. | **Provenance / lineage** — defines system of record and traceability. |
| **Application** | A system used in the business (owned by a domain). | **System of record / consumer** — where data is created or consumed; part of lineage. |
| **EUC** | End-User Computing or ITESS (e.g. Excel, Power BI, SharePoint). | **Non-standard system** — in-scope for governance and risk (EUC/ITESS programs). |
| **Endpoint** | Use case for data (report, process) — can belong to a domain and/or an application. | **Point of use** — where data quality rules and concerns are applied in context. |
| **Data Feed** | External or internal source of data; has format, transmission, optional producer/consumer applications; can contain data elements and controls. | **Data movement / integration** — governs feeds and controls (accuracy, validity, timeliness). |

### 1.3 Data Quality

| Concept | Description | Governance Role |
|--------|-------------|-----------------|
| **Data Quality Rule** | Rule applied to a CDE and optionally an endpoint; has type (accuracy, validity, timeliness), exception threshold %, and optional “flagged for monitoring.” | **Quality standard** — defines how quality is measured and when a run fails. |
| **Data Quality Exception** | A record that failed a rule; has status (e.g. open/closed), optional false-positive marking. | **Quality incident** — what to remediate or justify (false positive). |
| **Data Quality Rule Instance** | One execution of a rule for a given (element, application in lineage); run_at, passed/failed, exception count/%. | **Quality run / evidence** — supports trending and performance. |
| **Data Quality SQL Version** | Versioned SQL for a rule; one version marked “live” per rule. | **Rule definition artifact** — audit trail and reproducibility. |
| **Rule Mod Request** | Request to change a rule (status: requested, in_progress, done). | **Change request** — when rules need adjustment after repeated failure. |
| **Data Feed Control** | Control on a data feed (accuracy, validity, timeliness). | **Feed-level quality** — control at the feed boundary. |

### 1.4 Governance & Risk

| Concept | Description | Governance Role |
|--------|-------------|-----------------|
| **Data Concern** | Governance concern (issue, risk, finding) that can be linked to domain, application, EUC, endpoint, and/or data element. | **Issue / risk register** — tracks open items and remediation. |

---

## 2. Relationships Between Concepts

### 2.1 Hierarchy & Ownership

- **Domain** → **children** (Domain): parent/child hierarchy (L0 → L1 → L2 → L3).
- **Domain** → **Data Elements, Applications, EUCs, Endpoints, Data Quality Rules, Data Concerns, Data Feeds**: “owned by” or “scoped to” domain (domain_id).

### 2.2 Critical Data & Lineage

- **Data Element** ↔ **Application** (via **Data Element SOR**): many-to-many; “this application is system of record for this element (and optional physical attribute).”
- **Data Element** ↔ **Data Feed** (via **Data Feed Data Element**): many-to-many; “this feed contains this element.”
- **Endpoint** → **Application** (optional): endpoint belongs to an application.
- **Endpoint** → **Domain** (optional): endpoint can be scoped to a domain.
- **Data Feed** → **Application** (producer, consumer): optional producer and consumer applications.

### 2.3 Data Quality

- **Data Quality Rule** → **Domain, Data Element, Endpoint** (optional): rule scoped to domain and applied to element + endpoint.
- **Data Quality Rule** → **Data Quality Exception**: one-to-many (exceptions for this rule).
- **Data Quality Rule** → **Data Quality Rule Instance**: one-to-many (runs).
- **Data Quality Rule** → **Data Quality SQL Version**: one-to-many; one version “live” per rule.
- **Data Quality Rule** → **Rule Mod Request**: one-to-many.
- **Data Quality Rule Instance** → **Data Element, Application**: instance is for (element, application in lineage).
- **Data Quality Rule Instance** → **Data Quality SQL Version** (optional): which SQL version was used for the run.
- **Data Quality Exception** → **Data Element** (optional): which element the exception relates to.
- **Data Feed** → **Data Feed Control**: one-to-many (accuracy/validity/timeliness controls).

### 2.4 Governance & Risk

- **Data Concern** → **Domain** (required): concern belongs to a domain.
- **Data Concern** → **Application, EUC, Endpoint, Data Element** (optional): concern can be linked to any combination.

### 2.5 Users & Audit

- **Data Quality Exception** → **User** (marked_by): who marked false positive.
- **Rule Mod Request** → **User** (requested_by): who requested the change.

---

## 3. User Actions by Concept

### 3.1 Domain

| Action | Description |
|--------|-------------|
| **List domains** | View flat list of domains. |
| **View domain tree** | View L0→L1→L2→L3 hierarchy. |
| **Select domain** | Set current scope for the portal (sidebar). |
| **Create domain** | Add a new domain (name, description, parent_id). |
| **Update domain** | Edit name, description, or parent. |
| **Delete domain** | Remove domain (only if no children and no dependent data). |

### 3.2 Critical Data Element (CDE)

| Action | Description |
|--------|-------------|
| **List data elements** | List CDEs by domain (owned / upstream / downstream scope). |
| **View data element** | See detail (implicit via list/drill). |
| **View lineage** | See 1-hop upstream/downstream lineage (domain, rules, endpoints, concerns, SOR). |
| **View lineage applications** | See applications in lineage path (from SOR and from endpoints of rules). |
| **View SOR** | List system-of-record links (element ↔ application, physical attribute). |
| **Bulk upload data elements** | Create/update CDEs from CSV. |
| **Bulk download data elements** | Export CDEs to CSV. |

### 3.3 Application

| Action | Description |
|--------|-------------|
| **List applications** | List by domain. |
| **Bulk upload applications** | Create/update from CSV. |
| **Bulk download applications** | Export to CSV. |

### 3.4 EUC

| Action | Description |
|--------|-------------|
| **List EUCs** | List by domain. |
| **Bulk upload EUCs** | Create/update from CSV. |
| **Bulk download EUCs** | Export to CSV. |

### 3.5 Endpoint

| Action | Description |
|--------|-------------|
| **List endpoints** | List by domain. |
| **Bulk upload endpoints** | Create/update from CSV. |
| **Bulk download endpoints** | Export to CSV. |

### 3.6 Data Feed

| Action | Description |
|--------|-------------|
| **List data feeds** | List by domain. |
| **View data feed detail** | See feed metadata, producer/consumer, linked data elements, controls. |

### 3.7 Data Quality Rule

| Action | Description |
|--------|-------------|
| **List rules** | List by domain (optional filters). |
| **View rule** | See rule detail (element, endpoint, type, threshold, flagged for monitoring). |
| **Create rule** | Create rule (domain, element, endpoint, name, description, type, threshold). |
| **Update rule** | Edit rule attributes. |
| **View performance** | Current performance for (element, application in lineage). |
| **View trend** | Time series of rule performance over time. |
| **Request rule mod** | Create a rule modification request (e.g. after repeated failure). |
| **List mod requests** | List mod requests for a rule. |
| **Flag for monitoring** | Set/clear “flagged for monitoring” on rule. |
| **List SQL versions** | List SQL versions for rule. |
| **Create SQL version** | Add new SQL version. |
| **Set SQL version live** | Mark one version as live. |
| **Bulk upload rules** | Create/update rules from CSV. |
| **Bulk download rules** | Export to CSV. |

### 3.8 Data Quality Rule Instance

| Action | Description |
|--------|-------------|
| **List instances** | List runs (filter by rule, element, application, date range). |
| **Create instance** | Record a run (e.g. from external job). |
| **View instance detail** | See run result and exact SQL (prettified) that was run. |
| **Mark instance false positive** | Mark a run as false positive. |

### 3.9 Data Quality Exception

| Action | Description |
|--------|-------------|
| **List exceptions** | List by domain (and optional filters). |
| **Mark exception false positive** | Mark a specific exception as false positive. |
| **Bulk upload exceptions** | Create/update from CSV. |
| **Bulk download exceptions** | Export to CSV. |

### 3.10 Data Concern

| Action | Description |
|--------|-------------|
| **List data concerns** | List by domain; filter by application, EUC, endpoint, data element. |
| **Create data concern** | Create concern (e.g. from rule/instance context: pre-fill element/endpoint/application). |
| **Bulk upload data concerns** | Create/update from CSV. |
| **Bulk download data concerns** | Export to CSV. |

### 3.11 User (Admin)

| Action | Description |
|--------|-------------|
| **List users** | List portal users. |
| **View user** | See user detail. |
| **Create user** | Add user (email, name, role). |
| **Update user** | Edit user. |
| **Delete user** | Remove user. |

### 3.12 Bulk & Export

| Action | Description |
|--------|-------------|
| **Bulk upload** | Upload CSV for entity type (domains, data_elements, applications, eucs, endpoints, data_quality_rules, data_quality_exceptions, data_concerns). |
| **Bulk download** | Download CSV for entity type and domain. |

### 3.13 Authentication

| Action | Description |
|--------|-------------|
| **Login** | Authenticate (e.g. JWT). |
| **Logout** | End session. |

---

## 4. Governance Metrics for the Program

### 4.1 Coverage & Inventory

| Metric | Description | Scope |
|--------|-------------|--------|
| **Domains count** | Number of domains (or by level L0/L1/L2). | Global or by level |
| **Critical Data Elements count** | Number of CDEs. | Global or per domain |
| **Applications count** | Number of applications. | Global or per domain |
| **EUCs count** | Number of EUCs. | Global or per domain |
| **Endpoints count** | Number of endpoints. | Global or per domain |
| **Data feeds count** | Number of data feeds. | Global or per domain |
| **CDEs with SOR** | Count (or %) of CDEs that have at least one system of record. | Per domain / global |
| **CDEs with no SOR** | Count of CDEs without SOR (coverage gap). | Per domain / global |

### 4.2 Data Quality

| Metric | Description | Scope |
|--------|-------------|--------|
| **Data quality rules count** | Number of DQ rules. | Global or per domain |
| **Data quality exceptions count** | Number of exceptions (open or all). | Global or per domain |
| **Rules by type** | Count of rules by accuracy / validity / timeliness. | Per domain / global |
| **Rules flagged for monitoring** | Count of rules flagged for monitoring. | Per domain / global |
| **Rule pass rate (current)** | % of rule instances that passed (e.g. last run or last N runs). | Per rule / per domain |
| **Rule pass rate trend** | Trend of pass rate over time (e.g. last 30/90 days). | Per rule / per domain |
| **Exceptions open vs closed** | Count or % open vs closed. | Per domain / global |
| **Exceptions marked false positive** | Count (or %) of exceptions marked false positive. | Per domain / global |
| **Rule mod requests** | Count by status (requested, in_progress, done). | Per domain / global |

### 4.3 Governance & Risk

| Metric | Description | Scope |
|--------|-------------|--------|
| **Data concerns count** | Number of data concerns. | Global or per domain |
| **Data concerns by status** | Count by status (e.g. open, in progress, closed). | Per domain / global |
| **Concerns by linked entity** | Count of concerns linked to application / EUC / endpoint / element. | Per domain / global |

### 4.4 Attestation (Placeholder)

| Metric | Description | Scope |
|--------|-------------|--------|
| **Attestation count** | Placeholder for future attestation metrics (e.g. attested CDEs, attestation due). | Per domain / global |

### 4.5 Program Health (Derived)

| Metric | Description |
|--------|-------------|
| **Coverage** | % of CDEs with at least one DQ rule; % of CDEs with SOR. |
| **Quality health** | % of rules passing (or % of instances passed in period). |
| **Open risk** | Count of open data concerns; count of open DQ exceptions. |
| **Remediation** | Rule mod requests in progress; exceptions closed in period. |

---

## 5. Summary Diagram (Concept Map)

```
                    ┌─────────────┐
                    │   Domain    │
                    │ (L0→L1→L2) │
                    └──────┬──────┘
         ┌────────────────┼────────────────┬─────────────────┬──────────────────┐
         ▼                ▼                ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Data Element │  │ Application  │  │     EUC      │  │   Endpoint   │  │  Data Feed   │
│   (CDE)      │  │              │  │              │  │              │  │              │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │                 │                 │
       │    DataElementSOR                 │                 │         DataFeedDataElement
       │◄────────────────►                 │                 │         DataFeedControl
       │                 │                 │                 │                 │
       │                 │                 │                 │                 │
       ▼                 ▼                 ▼                 ▼                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                         Data Quality Rule                                            │
│  (element, endpoint, type, threshold, flagged_for_monitoring)                          │
└──────┬───────────────────────────────────────────────────────────────────────────────┘
       │
       ├── DataQualityException (status, is_false_positive)
       ├── DataQualityRuleInstance (element, application, run_at, passed, exception_%)
       ├── DataQualitySqlVersion (sql_text, version, is_live)
       └── RuleModRequest (status: requested | in_progress | done)
       
       ┌─────────────────────────────────────────────────────────────────────────────┐
       │                        Data Concern                                         │
       │  (domain + optional: application, euc, endpoint, data_element)              │
       └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. References

- **Backend models:** `backend/app/models/__init__.py`
- **API routes:** `backend/main.py`, `backend/app/api/*.py`
- **Architecture:** `docs/architecture.md`
- **Data quality feature plan:** `docs/data-quality-rules-feature-plan.md`
- **Domain management:** `docs/admin-domain-management-plan.md`
