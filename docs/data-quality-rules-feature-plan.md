# Data Quality Rules — Feature Plan

This document plans the set of features to build for data quality rules based on the stated requirements.

**Implementation status:** The features below have been implemented: backend (FastAPI) with new models, schemas, and endpoints; SQL prettification via **sqlparse** (open-source); frontend (Angular) DQ Rules page with threshold/type/flagged columns, detail panel, and full-detail modal (performance, trend chart, instances with SQL, actions). Tests and seed data added. See root README and OpenAPI docs for API details. It aligns with the existing DMP domain model (domains, CDEs, applications, endpoints, data concerns) and the current `DataQualityRule` / `DataQualityException` APIs.

---

## Requirements Summary (from spec)

| # | Requirement |
|---|-------------|
| 1 | A data quality rule can be applied to a data element and an endpoint |
| 2 | A data quality rule has **instances** that are run against an element for a given **application in the lineage path** |
| 3 | A data quality rule can be for **accuracy**, **validity**, or **timeliness** |
| 4 | A data quality rule has a **threshold** for % of exceptions allowed before the rule is considered failed on a given run |
| 5 | User sees **trending performance** of a DQ rule over time for a given element and application in the lineage path |
| 6 | User sees **current performance** of a DQ rule for a given element and application in the lineage path |
| 7 | For an **instance**, user sees the **exact SQL** that was run to produce the result |
| 8 | A SQL query has **multiple versions**, but only one will be **live** |
| 9 | User sees the **SQL rule prettified** for readability |
| 10 | When a rule fails regularly: **request rule mod**, **create data concern**, **flag for monitoring**, or **mark as false positive** |

---

## Current State (brief)

- **Backend:** `DataQualityRule` has `domain_id`, `data_element_id`, `endpoint_id`, `name`, `description`, `rule_type` (accuracy/validity/timeliness). `DataQualityException` has `rule_id`, `data_element_id`, `description`, `status`, `identified_at`. List APIs exist for rules and exceptions; no instances, runs, threshold, or SQL storage.
- **Frontend:** DQ Rules and DQ Exceptions pages; rules/exceptions loaded in NgRx and shown on data-elements and endpoints pages. No rule detail, runs, or trend views.
- **Lineage:** 1-hop lineage for a data element (domain, rules, endpoints, data concerns). Endpoints have `application_id`; lineage path “applications” can be derived from endpoints linked to rules and from `DataElementSOR` (element ↔ application).

---

## Feature Plan

### Phase 1 — Rule definition and threshold (requirements 1, 3, 4)

**Goal:** Rules explicitly scoped to element + endpoint; rule type constrained; threshold stored and used to determine pass/fail.

| Feature | Backend | Frontend |
|---------|---------|----------|
| **1.1** Rule applied to element + endpoint | Already supported; validate that both can be set and are exposed in API/UI. | Rule form: require/allow selecting data element and endpoint; show in rule list/detail. |
| **1.2** Rule type enum | Constrain `rule_type` to `accuracy \| validity \| timeliness` (DB + schema). | Dropdown or chips for rule type in create/edit and filters. |
| **1.3** Exception threshold | Add `exception_threshold_pct` (e.g. 0–100) to `DataQualityRule`; migration. | Rule form: threshold input; list/detail show threshold. |

**Deliverables:** Migration for `exception_threshold_pct`; schema validation for `rule_type`; API responses include threshold; UI to set and display element, endpoint, type, threshold.

---

### Phase 2 — Rule instances and “application in lineage” (requirements 2, 7, 8)

**Goal:** Introduce *rule instances* as runs of a rule for a given (element, application in lineage). Store SQL per instance with versioning and a single “live” version.

**Data model (new/updated):**

- **Rule instance (run):** Represents one execution of a rule in a specific context.
  - `id`, `rule_id`, `data_element_id`, `application_id` (application in lineage path), `run_at` (timestamp), `passed` (bool), `exception_count`, `exception_pct`, optional `notes`.
  - Unique or logical key: rule + element + application + run_at (or batch id).
- **SQL version:** Stores the SQL that was run for an instance.
  - `id`, `rule_id` (or `rule_instance_id`), `sql_text`, `version` (int or semantic), `is_live` (bool), `created_at`.
  - Only one row per rule (or per rule+application) with `is_live = true`.

**Design choice:** Either:
- **A)** SQL versions are attached to the **rule** (one “current live SQL” per rule, reused across instances), or  
- **B)** SQL versions are attached to **rule instances** (each run can point to a version; “live” is the default version used for future runs).

Recommendation: **A** for simplicity — one live SQL per rule; instances reference the rule and thus implicitly the SQL that was “current” at run time (you can add `sql_version_id` to instance later if you need to track which version was run).

| Feature | Backend | Frontend |
|---------|---------|----------|
| **2.1** Rule instances model and API | New table `data_quality_rule_instances`; CRUD or append-only API; list by rule, element, application, date range. | — |
| **2.2** “Application in lineage” | Derive applications from: (1) endpoints linked to the rule (endpoint.application_id), (2) DataElementSOR for the element. API: e.g. `GET /api/data-elements/{id}/lineage-applications` or embed in lineage response. | Use to drive dropdowns/filters for “application in lineage” when viewing rules/instances. |
| **2.3** SQL versions model and API | New table `data_quality_sql_versions` (rule_id, sql_text, version, is_live, created_at). API: list versions, get live, set live, create version. | — |
| **2.4** Instance ↔ SQL | When creating an instance, optionally link to `sql_version_id` (or infer “live at run time”). GET instance response includes SQL that was run (e.g. live version at run time or stored version). | — |
| **2.5** Show SQL for an instance | API: `GET /api/data-quality-rules/instances/{id}` returns instance + `sql_text` (and version id). | Rule instance detail panel: show “Exact SQL run” with prettified display. |
| **2.6** Prettified SQL | Backend: optional query param `?prettify=1` or always return prettified in a field (e.g. `sql_text_prettified`) using a SQL formatter library. | Frontend: display in &lt;pre&gt; or code block with syntax highlighting; toggle raw vs prettified if needed. |

**Deliverables:** Migrations for rule instances and SQL versions; APIs for instances and SQL versions; endpoint for “applications in lineage” for an element; instance detail API with SQL; prettified SQL in API and UI.

---

### Phase 3 — Performance and trending (requirements 5, 6)

**Goal:** Current and trending performance of a DQ rule by (element, application in lineage).

| Feature | Backend | Frontend |
|---------|---------|----------|
| **3.1** Current performance | API: e.g. `GET /api/data-quality-rules/{id}/performance?data_element_id=&application_id=` returns latest run(s), pass/fail, exception_pct, trend summary (e.g. last 5 runs). | Rule detail or dedicated “Performance” section: show current status, last run, exception % vs threshold. |
| **3.2** Trending over time | API: e.g. `GET /api/data-quality-rules/{id}/performance/trend?data_element_id=&application_id=&from=&to=` returns time series (run_at, passed, exception_pct). | Chart (e.g. line or bar) of pass/fail or exception % over time; filter by element and application. |

**Deliverables:** Performance and trend APIs; UI for current performance and trend chart, scoped by element and application in lineage.

---

### Phase 4 — Actions when a rule fails regularly (requirement 10)

**Goal:** When a rule is failing repeatedly, user can: request rule mod, create data concern, flag for monitoring, mark as false positive.

| Feature | Backend | Frontend |
|---------|---------|----------|
| **4.1** Request rule mod | Either a simple “request mod” flag on the rule (or on rule+element+app) with status (e.g. `requested`, `in_progress`, `done`), or integration with a ticketing system. Minimal: new field or small table `rule_mod_requests` (rule_id, requested_at, status, requested_by). | Button “Request rule mod” from rule/instance view; show status. |
| **4.2** Create data concern | Already have Data Concern entity and API. | From rule/instance view: “Create data concern” pre-fills element/endpoint/application from context; open create-concern flow. |
| **4.3** Flag for monitoring | New flag on rule or on (rule, element, application), e.g. `flagged_for_monitoring` (bool) or a small `rule_monitoring_flags` table. | Toggle “Flag for monitoring” and show in list/detail. |
| **4.4** Mark as false positive | Option A: mark at **exception** level (existing DataQualityException: add e.g. `is_false_positive`). Option B: mark at **instance** level (e.g. instance has `marked_false_positive_at` / `marked_false_positive_by`). Option C: both. | In exception list or instance detail: “Mark as false positive”; filter out or visually de-emphasize in trend/performance. |

**Deliverables:** Backend support for “request mod”, “flag for monitoring”, and “false positive”; frontend actions and wiring to existing data-concern creation.

---

## Suggested build order

1. **Phase 1** — Quick win; no new tables; clarifies rule type and threshold.
2. **Phase 2** — Core new concepts (instances, SQL versions, “application in lineage”); enables Phase 3 and 4.
3. **Phase 3** — Performance and trend APIs and UI (depends on instances).
4. **Phase 4** — Failure actions (can be partially done in parallel with Phase 3; “create data concern” reuses existing API).

---

## API summary (to add)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/data-elements/{id}/lineage-applications` | Applications in lineage for element (from SOR + endpoints of rules) |
| GET/POST | `/api/data-quality-rules/instances` | List/create rule instances (filter by rule, element, application, date range) |
| GET | `/api/data-quality-rules/instances/{id}` | Instance detail + SQL (prettified option) |
| GET/POST | `/api/data-quality-rules/{id}/sql-versions` | List/create SQL versions |
| PATCH | `/api/data-quality-rules/{id}/sql-versions/{vid}/live` | Set version as live |
| GET | `/api/data-quality-rules/{id}/performance` | Current performance (element, application) |
| GET | `/api/data-quality-rules/{id}/performance/trend` | Time series for trend chart |
| POST | `/api/data-quality-rules/{id}/request-mod` | Request rule modification (or similar) |
| PATCH | `/api/data-quality-rules/{id}/flag-monitoring` | Flag for monitoring |
| PATCH | `/api/data-quality-exceptions/{id}/false-positive` | Mark exception as false positive (or at instance level) |

---

## Schema changes summary

- **DataQualityRule:** add `exception_threshold_pct` (numeric); keep `rule_type` as enum (accuracy, validity, timeliness).
- **New: data_quality_rule_instances** — rule_id, data_element_id, application_id, run_at, passed, exception_count, exception_pct, optional sql_version_id.
- **New: data_quality_sql_versions** — rule_id, sql_text, version, is_live, created_at.
- **DataQualityException:** optional `is_false_positive` (boolean) and optionally `marked_at` / `marked_by`.
- **New (optional): rule_mod_requests** and **rule_monitoring_flags** (or columns on rule) for Phase 4.

---

## Open questions

1. **Lineage path definition:** Should “application in lineage path” be strictly from endpoints linked to the rule + SOR, or also from a future full lineage graph?
2. **Instance creation:** Are instances only created by an external job (e.g. Airflow) that calls the API, or will the portal also trigger “test run”?
3. **Prettify:** Use a Python SQL formatter (e.g. `sqlparse`) in the backend, or send raw SQL and prettify in the frontend (e.g. with a JS library)?

This plan can be dropped into `docs/` and refined as you implement (e.g. exact field names and API paths in code).
