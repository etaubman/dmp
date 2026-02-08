# Data Manager Portal

Rapid prototype of a user-facing portal for data governance: manage Critical Data Elements, applications, EUCs, endpoints, data quality rules/exceptions, and data concerns. Bulk upload/download for integration with other teams.

## Prerequisites

- **Node.js** 18+ and **npm** (for frontend)
- **Python** 3.10+ and **pip** (for backend)
- **Docker** and **Docker Compose** (for Postgres, MinIO, optional backend)
- **PowerShell** (for repo scripts on Windows)

## Quick start

1. Copy the env template and adjust if needed (never commit `.env`):
   ```powershell
   copy .env.example .env
   ```
2. Start all services:
   ```powershell
   docker-compose up -d
   ```
3. Start the frontend (not in docker-compose for dev):
   ```powershell
   cd frontend; npm install; npm run start
   ```
4. Open in browser:
   - **App (frontend):** http://localhost:4200
   - **API (backend):** http://localhost:8000 — docs at http://localhost:8000/docs
   - **DB admin (Adminer):** http://localhost:8080 — System: `PostgreSQL`, Server: `postgres`, User/Password: from `.env`
   - **S3 admin (MinIO Console):** http://localhost:9001 — login with MinIO root user/password from `.env`

Select a domain in the sidebar to load data.

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
2. From repo root, ensure `.env` has `DATABASE_URL=postgresql://dmp:dmp_secret@localhost:5432/dmp` (use `localhost` instead of `postgres` when the backend runs on the host).
3. From `backend/`: create a venv, `pip install -r requirements.txt`, then:
   ```powershell
   uvicorn app.main:app --reload --host 0.0.0.0
   ```
4. Run the frontend from `frontend/` with `npm run start` as above.

### Helper scripts

- **`start-postgres-only.ps1`** — Starts only the Postgres container for local backend development. Run from repo root.
- **`reset-domains-reseed.ps1`** — Resets domain-related data and re-runs the seed (L0/L1/L2 hierarchy). Run from repo root; requires backend venv and `DATABASE_URL` (or `.env`). See `backend/README.md` for details.

## First-time setup

1. Clone the repo and open a terminal in the repo root.
2. `copy .env.example .env` and leave as-is or adjust (e.g. passwords, `DATABASE_URL` if using local backend).
3. **Option A — Docker backend:** `docker-compose up -d`. Wait for containers to be healthy.
4. **Option B — Local backend:** `.\start-postgres-only.ps1`, then in `backend/`: `python -m venv venv`, activate venv, `pip install -r requirements.txt`, and run uvicorn (see above). Ensure `DATABASE_URL` in `.env` uses `localhost`.
5. **Frontend:** `cd frontend`, `npm install`, `npm run start`.
6. Open http://localhost:4200 and (if needed) http://localhost:8000/docs to confirm the API is up.

## Repo layout

- `backend/` — FastAPI app, SQLAlchemy, S3 client (see `backend/README.md`)
- `frontend/` — Angular 18, NgRx, Tailwind (see `frontend/README.md`)
- `docker/` — Postgres init scripts, S3 bucket setup (see `docker/README.md`)
- `requirements/` — **Product/feature requirements** and planning docs (e.g. `initial_braindump.txt`), not Python dependencies. Python deps are in `backend/requirements.txt`.
- `docs/` — Architecture and planning (e.g. `architecture.md`, `admin-domain-management-plan.md`, `onboarding-and-cleanup-plan.md`)

## Tech stack

- **Frontend:** Angular 18.2, NgRx (Store/Effects), Tailwind CSS, TypeScript, AG Grid/Charts
- **Backend:** FastAPI, SQLAlchemy
- **Database:** PostgreSQL
- **Storage:** MinIO (S3-compatible), Docker
- **Containers:** Docker, Docker Compose

## API

- **REST:** `/api/domains`, `/api/domain-tree`, `/api/data-elements`, `/api/applications`, `/api/eucs`, `/api/endpoints`, `/api/data-quality-rules`, `/api/data-quality-exceptions`, `/api/data-concerns`, `/api/metrics`, `/api/users`
- **Bulk:** `POST /api/bulk/upload` (form: `entity_type`, `file`); `GET /api/bulk/download?entity_type=...&domain_id=...`. CSV header row required; columns per entity type — see OpenAPI docs at http://localhost:8000/docs
- **Health:** `GET /health`, `GET /ready` (DB check)

## Troubleshooting

- **Port already in use:** Ensure nothing else uses 5432 (Postgres), 8000 (API), 4200 (frontend), 8080 (Adminer), 9000/9001 (MinIO). Change ports in `docker-compose.yml` or stop the conflicting service.
- **"DB not ready" / connection refused:** Wait for Postgres to be healthy after `docker-compose up -d` (about 5–10 seconds). For local backend, use `DATABASE_URL` with `localhost`, not `postgres`.
- **CORS errors in browser:** The API allows `http://localhost:4200` and `http://127.0.0.1:4200`. If the frontend runs on another host/port, add it in `backend/main.py` (CORSMiddleware).
- **Frontend can’t reach API:** Confirm the API is running and that `frontend/src/environments/environment.ts` has `apiUrl` pointing to it (e.g. `http://localhost:8000`).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to run tests, code style, and where to ask questions.
