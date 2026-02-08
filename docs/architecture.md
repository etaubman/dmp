# Data Manager Portal — Architecture Overview

Short high-level view for onboarding. Details are in the code and in `admin-domain-management-plan.md` where relevant.

## System components

- **Frontend (Angular)** — SPA at http://localhost:4200 (dev). Uses NgRx for state; calls the backend API for all data. User selects a **domain** in the sidebar; most list/detail views are scoped by that domain.
- **Backend (FastAPI)** — REST API at http://localhost:8000. Serves domains, data elements, applications, EUCs, endpoints, DQ rules/exceptions, data concerns, metrics, users, and bulk upload/download. Creates DB tables and runs seed on startup.
- **PostgreSQL** — Persistent store for all entities. Connection via `DATABASE_URL`.
- **MinIO (S3-compatible)** — Optional. Used for bulk upload and export files (buckets `bulk-uploads`, `exports`). Not required for core CRUD.

## Main entities and relationships

- **Domain** — Hierarchy L0 → L1 → L2 → L3 (e.g. L0 Markets, L1 Equities, L2 Cash). Most entities belong to a domain (`domain_id`).
- **Data Element (CDE)** — Critical data elements; belong to a domain; can have data quality rules, exceptions, data concerns, and systems of record (links to applications).
- **Application** — Systems used in the business; belong to a domain; can have endpoints and data concerns.
- **EUC** — End User Computing / ITESS; belong to a domain; can have data concerns.
- **Endpoint** — Use cases (reports, processes); can link to domain and application; can have DQ rules and data concerns.
- **Data Quality Rule / Exception** — Rules and their failing records; can link to domain, data element, endpoint.
- **Data Concern** — Governance concerns; can link to domain, application, EUC, endpoint, data element.
- **User** — Portal users (for admin/user management).
- **Metrics** — KPIs/concept metrics (API and UI).

Bulk upload/download uses CSV and S3; see OpenAPI docs for entity types and column formats.

## Data flow (typical)

1. User opens app → frontend loads domain tree and list (NgRx effects call API).
2. User selects a domain → store updates; effects load domain-scoped data (data elements, applications, etc.).
3. List/detail views read from store or call API as needed; mutations go through API and then store is updated or data refetched.

## Key URLs and config

- Frontend API base URL: `frontend/src/environments/environment.ts` (`apiUrl`). Production: `environment.prod.ts`.
- Backend reads `DATABASE_URL` and S3-related env vars from the environment (and from `.env` when run locally).
- API docs: http://localhost:8000/docs and http://localhost:8000/redoc.
