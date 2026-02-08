# Contributing to Data Manager Portal

Thank you for contributing. This document helps **new team members** get set up, run the app and tests, follow project conventions, and submit changes.

---

## Before you start

1. **Clone the repo** and read the root [README.md](README.md) for prerequisites and quick start.
2. **Copy `.env.example` to `.env`** and start services (Docker and/or local backend + frontend) as described in the root README.
3. **Skim the sub-project READMEs:**
   - [backend/README.md](backend/README.md) — API structure, env vars, seeding, tests
   - [frontend/README.md](frontend/README.md) — app structure, NgRx, conventions

Optional: read [docs/architecture.md](docs/architecture.md) for the high-level design.

---

## Running the app

- **Backend:** From `backend/` with venv activated:  
  `uvicorn app.main:app --reload --host 0.0.0.0`  
  Use `.\start-postgres-only.ps1` from repo root if you run Postgres in Docker only.
- **Frontend:** From `frontend/`: `npm install` then `npm run start`.  
  App at http://localhost:4200; API URL is in `frontend/src/environments/environment.ts`.

---

## Running tests

- **Backend:** From `backend/` with venv activated:
  ```powershell
  pytest tests/ -v
  ```
  Tests use in-memory SQLite and fixtures (see `backend/README.md`). Add tests for new API routes and auth behavior.
- **Frontend:** From `frontend/`:
  ```powershell
  npm run test
  ```
  Uses Karma/Jasmine. Add specs for new components and services as you go.
- **E2E (Cucumber):** From `e2e/` (with the app and backend already running):
  ```powershell
  npm install
  npx playwright install chromium
  npm test
  ```
  See [e2e/README.md](e2e/README.md). Cucumber tests cover login and navigation in a real browser.

**Before submitting a PR:** Run backend and frontend tests and fix any failures. Optionally run the Cucumber E2E suite with the app running. Manually run the app to confirm nothing is broken.

---

## Code style

### Backend (Python)

- Use the existing style: docstrings on modules and public routes, type hints where they help.
- Follow patterns in `app/api/` and `app/database.py`: use `Depends(get_db_dep)` in routes for DB access; use Pydantic schemas for request/response.
- Keep routers thin; put business logic in helpers or services as needed.

### Frontend (Angular)

- **Use NgModule-based components** — no standalone components.
- Follow the existing structure:
  - **`core/`** — shared services (API, auth, modals, time period)
  - **`layout/`** — app shell, domain selector
  - **`pages/`** — route targets (one module per page/feature)
  - **`shared/`** — reusable UI (modals, panels, grid cells)
  - **`store/`** — NgRx state, actions, effects, selectors
- Respect `.editorconfig` (indent 2, single quotes for TS).

### Naming and consistency

- Prefer consistent names across API and frontend (e.g. "DQ" in code vs "Data Quality" in UI is fine; add a short comment if it’s non-obvious).
- New API endpoints should have corresponding frontend methods in the appropriate `core/*-api.service.ts` (or the thin `core/api.service.ts` façade) and, if needed, NgRx actions/effects.

---

## Where to put new code

| Type of change | Where it goes |
|----------------|---------------|
| New REST endpoint | `backend/app/api/<domain>.py` (or new file in `api/`), then register in `app/main.py`. Add Pydantic schema in `app/schemas/`. |
| New Angular page/feature | `frontend/src/app/pages/<feature>-page/`, register route in `app-routing.module.ts`, add to layout/nav as needed. |
| New shared UI component | `frontend/src/app/shared/<component-name>/`. |
| New NgRx state/actions | `frontend/src/app/store/` (extend `app.state.ts`, `app.actions.ts`, etc.). |
| New API client method | `frontend/src/app/core/<resource>-api.service.ts` (e.g. `domains-api.service.ts`); or extend the façade `api.service.ts` if you add to an existing resource. |
| DB model change | `backend/app/models/`, then consider migration or seed updates. |

---

## Branches and pull requests

- Use **feature branches** for larger changes; keep `main` (or your default branch) in a runnable state.
- Before submitting a PR:
  1. Run backend tests: `cd backend && pytest tests/ -v`
  2. Run frontend tests: `cd frontend && npm run test`
  3. (Optional) Run E2E tests: start the app, then `cd e2e && npm test`
  4. Run the app locally and smoke-test your changes

---

## Debugging tips

- **Backend:** Run with `uvicorn app.main:app --reload --host 0.0.0.0` and set breakpoints in your IDE; use "local backend" mode (Postgres only in Docker) so the API process is on your machine.
- **Frontend:** Use browser DevTools; NgRx DevTools extension helps inspect store and actions. Check `environment.ts` for `apiUrl` and `devAlwaysLoggedIn`.
- **API not reachable:** Verify CORS: set `CORS_ORIGINS` in env or `backend/app/config.py` (defaults include `http://localhost:4200`, `http://127.0.0.1:4200`). Check `apiUrl` in `frontend/src/environments/environment.ts`.

---

## Questions

- **Bugs or feature ideas:** Open an issue in the repo.
- **Team channel:** If your team has a Slack/Teams channel for this project, ask there for quick questions or pairing.
