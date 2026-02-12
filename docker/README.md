# Docker — Data Manager Portal

This folder documents **Docker-related** setup for the Data Manager Portal: Postgres init scripts, S3 bucket creation, and how the services in `docker-compose.yml` work. New team members can use this to understand the containerized stack and troubleshoot issues.

---

## What lives here

- **`postgres/`** — Optional init scripts for PostgreSQL. Any `.sql` or `.sh` files here can be mounted into the Postgres container at `/docker-entrypoint-initdb.d/` to run on **first start only** (when the data volume is empty). Phase 1 uses env vars only; schema and seed are applied by the backend at runtime (see [backend/README.md](../backend/README.md)).
- **S3 buckets** — The `bulk-uploads` and `exports` buckets are **not** in this folder; they are created automatically by the **`s3-init`** service in the root `docker-compose.yml` on first run (see below).

---

## Services in `docker-compose.yml` (repo root)

The root `docker-compose.yml` defines these services. Run from **repo root**: `docker-compose up -d`.

| Service | Image / Build | Purpose | Ports |
|---------|----------------|---------|--------|
| **postgres** | `postgres:16-alpine` | PostgreSQL database for the backend. | 5432 |
| **minio** | `minio/minio:latest` | S3-compatible storage for bulk upload/download. | 9000 (API), 9001 (Console UI) |
| **s3-init** | `minio/mc:latest` | One-off job: creates buckets `bulk-uploads` and `exports` in MinIO. Runs after MinIO is up; exits when done. | — |
| **backend** | Built from `./backend` | FastAPI app. Connects to `postgres` and `minio`; creates tables and runs seed on startup. | 8000 |
| **backend-spring** | Built from `./backend-spring` | Spring Boot app (optional). Same DB as FastAPI; full API parity. | 8081 |
| **db-admin** | `adminer:latest` | Web UI for PostgreSQL (DB admin). | 8080 |

**Frontend** is **not** in docker-compose; run it locally with `cd frontend && npm run start` (FastAPI) or `npm run start:spring` (Spring).

---

## Environment variables (Docker)

Docker Compose reads from a **`.env`** file in the repo root (copy from `.env.example`). Key variables:

- **Postgres:** `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- **Backend:** `DATABASE_URL` (use host `postgres` when backend runs in Docker), `S3_*`, `AUTH_DEV_ALWAYS_LOGGED_IN`
- **MinIO:** `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` (also used by `s3-init` and backend S3 config)

When the **backend runs on the host** (local dev), use `.\start-postgres-only.ps1` and set `DATABASE_URL` with host **localhost**.

---

## Postgres init scripts (optional)

To run SQL or shell scripts on **first** database creation:

1. Add `.sql` or `.sh` files under `docker/postgres/` (or a subfolder).
2. In `docker-compose.yml`, mount that folder into the postgres service:
   ```yaml
   volumes:
     - postgres_data:/var/lib/postgresql/data
     - ./docker/postgres:/docker-entrypoint-initdb.d
   ```
3. Only the **first** time the volume is created, Postgres will run scripts in `/docker-entrypoint-initdb.d` in alphabetical order. The app schema and seed are still applied by the backend on startup; use init scripts only for extra setup (e.g. extensions, roles).

---

## S3 bucket creation (`s3-init`)

The **s3-init** service:

1. Waits for MinIO to be up (`depends_on: minio`).
2. Uses `mc` (MinIO Client) to alias the MinIO server and create:
   - `bulk-uploads`
   - `exports`
3. Uses `--ignore-existing` so it is safe to run multiple times. The container exits when done; it does not stay running.

If buckets are missing after `docker-compose up -d`, check that MinIO is healthy and that `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` in `.env` match what the backend uses for `S3_ACCESS_KEY` / `S3_SECRET_KEY`.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| **Postgres not ready / connection refused** | Wait 5–10 seconds after `docker-compose up -d`. The backend has `depends_on: postgres: condition: service_healthy`. Check with `docker-compose ps` and `docker-compose logs postgres`. |
| **Backend can’t connect to DB** | Ensure `DATABASE_URL` uses host **postgres** (not `localhost`) when the backend runs **in** Docker. Use **localhost** when the backend runs on the host (e.g. `.\start-postgres-only.ps1`). |
| **MinIO or buckets missing** | Ensure `s3-init` ran (check `docker-compose logs s3-init`). Restart: `docker-compose up -d minio s3-init`. Log into MinIO Console at http://localhost:9001 and verify buckets exist. |
| **Volume data reset** | To start with a fresh DB or MinIO storage, remove volumes: `docker-compose down -v`. Then `docker-compose up -d` again. **Warning:** This deletes all data in Postgres and MinIO. |
| **Port already in use** | Change the port mapping in `docker-compose.yml` (e.g. `"5433:5432"` for Postgres) or stop the conflicting service. |

### Rebuilding containers and database from scratch

From **repo root**:

```powershell
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

- `down -v` removes containers and volumes (fresh Postgres and MinIO).
- `build --no-cache` rebuilds the backend image from scratch.
- On `up -d`, the backend creates tables and runs the **idempotent seed** (L0/L1/L2 domains, sample data, users). No extra step is needed to seed the database.

---

## See also

- Root [README.md](../README.md) — Quick start, development modes, repo layout.
- [backend/README.md](../backend/README.md) — API, env vars, seeding, running locally with Postgres-only Docker.
