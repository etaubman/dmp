# Data Manager Portal

A user-facing portal for **data governance**: manage Critical Data Elements (CDEs), applications, EUCs (End-User Computing), endpoints, data quality rules and exceptions, and data concerns. Supports bulk upload/download for integration with other teams.

This README helps **new team members** get the app running, understand the repo, and know where to look next.

---

## What you'll find here

- **Prerequisites** — What to install before you start
- **Quick start** — Get the full stack running in a few steps
- **First-time setup** — Step-by-step for a clean clone
- **Development modes** — Docker backend vs local backend (e.g. for debugging)
- **Key concepts** — Domains, CDEs, and how the app is structured
- **Repo layout** — Where backend, frontend, Docker, and docs live
- **Tech stack** — Frameworks and tools
- **API overview** — Main endpoints and bulk operations
- **Troubleshooting** — Common issues and fixes
- **Contributing** — Tests (backend, frontend, Cucumber E2E), code style, and PRs

---

## Prerequisites

Install these before running the app:

| Tool | Purpose |
|------|--------|
| **Node.js** 18+ and **npm** | Frontend (Angular) |
| **Python** 3.10+ and **pip** | Backend (FastAPI) |
| **Docker** and **Docker Compose** | Postgres, MinIO, optional backend |
| **PowerShell** | Repo scripts (e.g. `start-postgres-only.ps1`, `reset-domains-reseed.ps1`) |

Optional: **Git** for cloning; **Angular CLI** can be used via `npx ng` if you prefer.

---

## Quick start

1. **Copy the env template** (never commit `.env`):
   ```powershell
   copy .env.example .env
   ```
2. **Start all services** (Postgres, MinIO, backend, DB admin):
   ```powershell
   docker-compose up -d
   ```
3. **Start the frontend** (run locally for dev; not in docker-compose):
   ```powershell
   cd frontend; npm install; npm run start
   ```
4. **Open in browser:**
   - **App:** http://localhost:4200  
   - **API docs:** http://localhost:8000/docs  
   - **DB admin (Adminer):** http://localhost:8080 — System: `PostgreSQL`, Server: `postgres`, User/Password: from `.env`  
   - **S3 admin (MinIO Console):** http://localhost:9001 — login with MinIO root user/password from `.env`

**Tip:** Select a **domain** in the sidebar to load data. The app is domain-scoped: most pages show data for the selected domain.

---

## First-time setup

1. Clone the repo and open a terminal in the **repo root**.
2. Run `copy .env.example .env`. Leave as-is or adjust (e.g. passwords; see "Local backend" below if you run the API on your machine).
3. **Option A — Full Docker (recommended for first run):**  
   `docker-compose up -d`. Wait until containers are healthy (~10–30 seconds).
4. **Option B — Local backend (for debugging):**  
   Run `.\start-postgres-only.ps1`, then in `backend/`: create a venv, `pip install -r requirements.txt`, and run the API (see [Development modes](#development-modes)). Set `DATABASE_URL` in `.env` to use `localhost` instead of `postgres`.
5. **Frontend:**  
   `cd frontend`, `npm install`, `npm run start`.
6. Open http://localhost:4200 and http://localhost:8000/docs to confirm the app and API are up.

---

## Development modes

### Full stack with Docker (backend in container)

- Run `docker-compose up -d` so Postgres, MinIO, and the backend API run in containers.
- Run the frontend locally: `cd frontend && npm run start`. The app uses the API at http://localhost:8000 (see `frontend/src/environments/environment.ts`).

### Local backend (Postgres only in Docker)

Useful when you want to run the API on your machine and attach a debugger.

1. Start only Postgres:
   ```powershell
   .\start-postgres-only.ps1
   ```
2. In repo root, ensure `.env` has `DATABASE_URL=postgresql://dmp:dmp_secret@localhost:5432/dmp` (use `localhost` when the backend runs on the host).
3. In `backend/`: create a venv, `pip install -r requirements.txt`, then:
   ```powershell
   .\venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload --host 0.0.0.0
   ```
4. Run the frontend from `frontend/` with `npm run start` as above.

### Helper scripts

| Script | Purpose |
|--------|---------|
| **`start-postgres-only.ps1`** | Starts only the Postgres container for local backend development. Run from repo root. |
| **`reset-domains-reseed.ps1`** | Resets domain-related data and re-runs the seed (L0/L1/L2 hierarchy). Run from repo root; requires backend venv and `DATABASE_URL`. See `backend/README.md` for details. |

---

## Key concepts (for new team members)

- **Domains** — Data is organized by domain (L0/L1/L2 hierarchy). The user picks a domain in the sidebar; most API calls and pages are scoped to that domain.
- **Critical Data Elements (CDEs)** — Core entities that the portal tracks; they link to applications, EUCs, endpoints, and data quality.
- **Bulk upload/download** — CSV-based import/export for domains, data elements, applications, etc. Handled by the backend with files stored in MinIO (S3-compatible).
- **Auth** — Login/logout and JWT; optional dev shortcut (`AUTH_DEV_ALWAYS_LOGGED_IN` / `devAlwaysLoggedIn`) skips login during local development.

For architecture and product requirements, see the **Repo layout** section below.

---

## Repo layout

| Path | Description |
|------|-------------|
| **`backend/`** | FastAPI app, SQLAlchemy, S3 client. See [backend/README.md](backend/README.md). |
| **`frontend/`** | Angular 18, NgRx, Tailwind. See [frontend/README.md](frontend/README.md). |
| **`e2e/`** | Cucumber E2E tests (Playwright). See [e2e/README.md](e2e/README.md). |
| **`docker/`** | Postgres init scripts, S3 bucket setup. See [docker/README.md](docker/README.md). |
| **`requirements/`** | Product/feature requirements and planning (e.g. `initial_braindump.txt`). **Not** Python dependencies; those are in `backend/requirements.txt`. |
| **`docs/`** | Architecture and planning (e.g. `architecture.md`, `admin-domain-management-plan.md`, `onboarding-and-cleanup-plan.md`). |

---

## Tech stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Angular 18.2, NgRx (Store/Effects), Tailwind CSS, TypeScript, AG Grid/Charts |
| **Backend** | FastAPI, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL |
| **Storage** | MinIO (S3-compatible), Docker |
| **Containers** | Docker, Docker Compose |

---

## API overview

- **REST:** `/api/domains`, `/api/domain-tree`, `/api/data-elements`, `/api/applications`, `/api/eucs`, `/api/endpoints`, `/api/data-quality-rules`, `/api/data-quality-exceptions`, `/api/data-concerns`, `/api/metrics`, `/api/users`
- **Data quality (extended):** Rules support `exception_threshold_pct` and `flagged_for_monitoring`. Rule instances (runs), SQL versions (one live per rule), performance and trend, lineage-applications per element, request-mod, flag-monitoring, and false-positive (exception/instance). See `docs/data-quality-rules-feature-plan.md` and OpenAPI at http://localhost:8000/docs
- **Bulk:** `POST /api/bulk/upload` (form: `entity_type`, `file`); `GET /api/bulk/download?entity_type=...&domain_id=...`. CSV header row required; column names per entity type are in the OpenAPI docs at http://localhost:8000/docs
- **Health:** `GET /health`, `GET /ready` (DB check)

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| **Port already in use** | Ensure nothing else uses 5432 (Postgres), 8000 (API), 4200 (frontend), 8080 (Adminer), 9000/9001 (MinIO). Change ports in `docker-compose.yml` or stop the conflicting service. |
| **"DB not ready" / connection refused** | Wait for Postgres to be healthy after `docker-compose up -d` (about 5–10 seconds). For local backend, use `DATABASE_URL` with `localhost`, not `postgres`. |
| **CORS errors in browser** | The API allows `http://localhost:4200` and `http://127.0.0.1:4200`. If the frontend runs on another host/port, add it in `backend/app/main.py` (CORSMiddleware). |
| **Frontend can't reach API** | Confirm the API is running and that `frontend/src/environments/environment.ts` has `apiUrl` pointing to it (e.g. `http://localhost:8000`). |
| **Login 401 / forgot password** | See backend README: run `python -m app.seed set-passwords` from `backend/` with venv activated, then log in with e.g. `ethan.taubman@example.com` / `password`. |

---

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for:

- Running tests (backend and frontend)
- Code style (Python and Angular)
- Branches and pull requests
- Where to ask questions

New to the codebase? Read the root README (this file), then `backend/README.md` and `frontend/README.md`, and skim `docs/architecture.md` for the big picture.
