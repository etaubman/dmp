# Data Manager Portal

Rapid prototype of a user-facing portal for data governance: manage Critical Data Elements, applications, EUCs, endpoints, data quality rules/exceptions, and data concerns. Bulk upload/download for integration with other teams.

## Quick start

1. Copy env template and adjust if needed:
   ```powershell
   copy .env.example .env
   ```
2. Start all services:
   ```powershell
   docker-compose up -d
   ```
3. Open in browser:
   - **App (frontend):** http://localhost:4200 (when running via `ng serve`) or see frontend service port in `docker-compose.yml`
   - **API (backend):** http://localhost:8000 — docs at http://localhost:8000/docs
   - **DB admin (Adminer):** http://localhost:8080 — System: `PostgreSQL`, Server: `postgres`, User/Password: from `.env`
   - **S3 admin (MinIO Console):** http://localhost:9001 — login with MinIO root user/password from `.env`

## Repo layout

- `backend/` — FastAPI app, SQLAlchemy, S3 client
- `frontend/` — Angular 18, Redux Toolkit, Tailwind
- `docker/` — Postgres init scripts, S3 bucket setup
- `requirements/` — Project requirements and planning docs

## Tech stack

- **Frontend:** Angular 18.2, Redux Toolkit, Tailwind CSS, TypeScript
- **Backend:** FastAPI, SQLAlchemy
- **Database:** PostgreSQL
- **Storage:** MinIO (S3-compatible), Docker
- **Containers:** Docker, Docker Compose

## Development

- Backend and frontend can be run locally (e.g. `uvicorn` and `ng serve`) against DB and MinIO from Docker.
- Use `.env` for `DATABASE_URL`, `MINIO_*`, etc.; see `.env.example`.
