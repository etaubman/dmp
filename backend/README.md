# Data Manager Portal — Backend

FastAPI application for the Data Manager Portal: REST API for domains, data elements, applications, EUCs, endpoints, data quality rules/exceptions, data concerns, metrics, users, and bulk upload/download. Uses SQLAlchemy with PostgreSQL and optional S3 (MinIO or AWS).

## Prerequisites

- **Python** 3.10+ and **pip**
- **PostgreSQL** (local or via Docker)
- **MinIO** (optional; for bulk upload/download). If not used, bulk endpoints may fail or be disabled.

## Setup

1. From repo root, copy `.env.example` to `.env` and set `DATABASE_URL` (and S3 vars if using bulk).
2. From this directory (`backend/`):

   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. For **local** development with Postgres in Docker only, use the root script:
   ```powershell
   # From repo root
   .\start-postgres-only.ps1
   ```
   Ensure `.env` has `DATABASE_URL=postgresql://dmp:dmp_secret@localhost:5432/dmp` (host `localhost` when backend runs on your machine).

## Run

From `backend/` (with venv activated):

```powershell
uvicorn main:app --reload --host 0.0.0.0
```

- API: http://localhost:8000  
- Swagger docs: http://localhost:8000/docs  
- ReDoc: http://localhost:8000/redoc  

On startup, the app creates tables (if missing) and runs the seed (idempotent: only seeds when the DB has not been seeded before). If you have an **existing** database from before auth was added, add the new column: `ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);` then restart so seed can set default passwords for existing users.

## Project layout

- **`app/main.py`** — FastAPI app, CORS, router registration, startup (tables + seed), `/health`, `/ready`, `/api/domain-tree`
- **`app/config.py`** — Settings from env (`get_settings()`)
- **`app/database.py`** — SQLAlchemy engine and session; `get_db_dep` for FastAPI route injection, `get_db` / `get_db_session` for other use
- **`app/models/`** — SQLAlchemy models (Domain, DataElement, Application, EUC, Endpoint, DataQualityRule, DataQualityException, DataConcern, User, etc.)
- **`app/schemas/`** — Pydantic request/response schemas per entity
- **`app/api/`** — Routers: `domains`, `users`, `data_elements`, `applications`, `eucs`, `endpoints`, `data_quality`, `data_concerns`, `metrics`, `bulk`
- **`app/seed.py`** — Idempotent seed (L0/L1/L2 domains, users, sample data); supports `reset` for domain wipe + re-seed
- **`app/s3_client.py`** — S3/MinIO client for bulk upload/download

## Environment variables

See root `.env.example`. Main ones:

- **`DATABASE_URL`** — PostgreSQL connection string (use `localhost` when running backend locally; use `postgres` when backend runs in Docker).
- **`S3_ENDPOINT_URL`**, **`S3_ACCESS_KEY`**, **`S3_SECRET_KEY`**, **`S3_BUCKET_UPLOADS`**, **`S3_BUCKET_EXPORTS`** — For bulk upload/download. Match MinIO credentials when using Docker MinIO.
- **`AUTH_JWT_SECRET`** — Secret for signing JWTs (set a strong value in production).
- **`AUTH_DEV_ALWAYS_LOGGED_IN`** — When set to `1`, `true`, or `yes`, the API treats every request as authenticated using the first admin user (no login required). Useful for local frontend development so you don’t have to log in after each refresh. **Leave unset or false in production.** To enable: add `AUTH_DEV_ALWAYS_LOGGED_IN=true` to your `.env` (or export it) and restart the backend. The frontend also has a matching flag; see the frontend README or `environments/environment.ts`.

## Seeding and reset

- **Idempotent seed:** On every app startup, `run_seed()` runs. If the DB has already been seeded (SeedFlag table has a row), it does nothing.
- **Reset and re-seed:** To wipe domain-related data and re-create the L0/L1/L2 hierarchy and sample data:
  ```powershell
  # From backend/ with venv activated
  python -m app.seed reset
  ```
  Or from repo root (script activates venv and runs the same command):
  ```powershell
  .\reset-domains-reseed.ps1
  ```

- **Fix login 401 (set all user passwords):** If login returns 401 even with correct email/password, force-set every user’s password to `password`:
  ```powershell
  # From backend/ with venv activated (or in Docker: docker compose exec backend python -m app.seed set-passwords)
  python -m app.seed set-passwords
  ```
  Then log in with e.g. `ethan.taubman@example.com` / `password`.

## Health and readiness

- **`GET /health`** — Always 200; for load balancers.
- **`GET /ready`** — 200 if DB is reachable; 503 otherwise (e.g. Postgres down).

## Tests

Auth tests (login, logout, `/me`) live in `tests/test_auth.py`. Run from `backend/` with venv activated:

```powershell
pytest tests/ -v
```

Tests use in-memory SQLite and a fixture that creates one user (`ethan.taubman@example.com` / `password`). See root `CONTRIBUTING.md` for code style and test expectations.
