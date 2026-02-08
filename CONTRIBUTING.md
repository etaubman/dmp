# Contributing to Data Manager Portal

Thanks for contributing. This document covers how to get set up, run the app and tests, and follow project conventions.

## Getting started

1. Clone the repo and read the root [README.md](README.md) for prerequisites and quick start.
2. Copy `.env.example` to `.env` and start services (Docker and/or local backend + frontend) as described there.
3. Backend details: [backend/README.md](backend/README.md). Frontend details: [frontend/README.md](frontend/README.md).

## Running the app

- **Backend:** From `backend/` with venv activated: `uvicorn app.main:app --reload --host 0.0.0.0`. Use `.\start-postgres-only.ps1` from repo root if you run Postgres in Docker only.
- **Frontend:** From `frontend/`: `npm install` then `npm run start`. App at http://localhost:4200; API at URL in `frontend/src/environments/environment.ts`.

## Running tests

- **Backend:** From `backend/` with venv activated: `pytest` (when tests are added).
- **Frontend:** From `frontend/`: `npm run test` (Karma/Jasmine). Add specs for new components and services as you go.

## Code style

- **Backend (Python):** Use the existing style: docstrings on modules and public routes, type hints where they help. Follow the patterns in `app/api/` and `app/database.py` for session handling (use `Depends(get_db_dep)` in routes).
- **Frontend (Angular):** Use NgModule-based components (no standalone components). Follow the existing structure: `core/` for services, `layout/`, `pages/`, `shared/`, `store/`. Respect `.editorconfig` (indent 2, single quotes for TS).
- **Naming:** Prefer consistent names across API and frontend (e.g. "DQ" in code vs "Data Quality" in UI is fine; document in a comment if it’s non-obvious).

## Branches and pull requests

- Use feature branches for larger changes; keep `main` (or your default branch) in a runnable state.
- Before submitting a PR, run the backend and frontend tests and fix any failures. Run the app locally to confirm nothing is broken.

## Questions

- Open an issue for bugs or feature ideas, or ask in your team channel if you have one.
