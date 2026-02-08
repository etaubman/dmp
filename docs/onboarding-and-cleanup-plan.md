# Onboarding & Cleanup Plan — Data Manager Portal

This document is a **checklist and plan** for getting the repo ready for additional team members: documentation, code comments, refactoring, READMEs, tooling, and testing.

---

## 1. Documentation

### 1.1 Root README (`README.md`)

**Current state:** Good quick start and tech stack; missing prerequisites and full local-dev paths.

**Add or expand:**

- **Prerequisites:** Node.js (version, e.g. 18+), npm, Python (e.g. 3.11+), Docker & Docker Compose, PowerShell (for scripts). Optional: Git.
- **Two development modes:**
  - **Full stack in Docker:** `docker-compose up -d` — frontend not in compose; clarify “run frontend separately with `ng serve` from `frontend/`”.
  - **Local backend + DB only:** Document `start-postgres-only.ps1` then `uvicorn` from `backend/`; point to `.env` and `DATABASE_URL` for localhost.
- **First-time setup:** Copy `.env.example` → `.env`; `docker-compose up -d` (or Postgres only); backend: venv + `pip install -r requirements.txt`; frontend: `npm install`; how to open app and API docs.
- **Troubleshooting:** Port conflicts (5432, 8000, 4200, 8080, 9000/9001); “DB not ready” (wait for Postgres health); CORS if frontend hits a different host/port.
- **Link** to `docs/` (e.g. admin plan, this onboarding plan) and to `CONTRIBUTING.md` if added.

### 1.2 Frontend README (`frontend/README.md`)

**Current state:** Default Angular CLI README (generic).

**Replace/expand with project-specific content:**

- Project name and one-line description (Data Manager Portal frontend).
- Prerequisites: Node/npm version; Angular CLI optional global install.
- How to run: `npm install`, `npm run start` (or `ng serve`); API base URL via `environment.ts` (default `http://localhost:8000`).
- Structure: `src/app/` — `core/` (API clients: resource `*-api.service.ts` + `api.service.ts` façade, shared services), `layout/`, `pages/`, `shared/` (reusable components), `store/` (NgRx, including `effect-helpers.ts`).
- Build: `npm run build`; production env and API URL.
- Tests: `npm run test` (Karma); note that specs are to be added (see Testing section).
- Any design decisions: e.g. “non-standalone modules” (per project rule), Tailwind, AG Grid/Charts.

### 1.3 Backend README (`backend/README.md`)

**Current state:** Missing.

**Create:**

- Project name and one-line description (Data Manager Portal API).
- Prerequisites: Python 3.11+ (or 3.10+), pip, venv; Postgres (local or Docker); optional MinIO for S3.
- Setup: `python -m venv venv`, activate, `pip install -r requirements.txt`; copy root `.env.example` to root `.env` (backend reads from env).
- Run: `uvicorn app.main:app --reload --host 0.0.0.0` from `backend/` (or `python -m uvicorn app.main:app --reload`).
- Project layout: `app/` — `api/` (routers; all routes live here; `helpers.py` for `get_or_404`), `config.py` (includes `cors_origins`, `seed_on_startup`), `database.py`, `models/`, `schemas/`, `seed.py`, `s3_client.py`; `main.py` entrypoint (app composition only).
- API docs: http://localhost:8000/docs (Swagger), http://localhost:8000/redoc.
- Health: `GET /health`, `GET /ready` (DB check).
- Seeding: `python -m app.seed` (idempotent); `python -m app.seed reset` for domain reset and re-seed (document `reset-domains-reseed.ps1` from repo root).
- Environment variables: list and short description (DATABASE_URL, S3_*, etc.) — can point to root `.env.example`.

### 1.4 Scripts documentation

- **`start-postgres-only.ps1`:** Already has a comment. Add one line to root README (and backend README): “For local API development without full compose, run `./start-postgres-only.ps1` then start the backend with uvicorn.”
- **`reset-domains-reseed.ps1`:** Document in README and backend README: “Resets domain-related data and re-runs seed; run from repo root; requires backend venv and DATABASE_URL.”

### 1.5 CONTRIBUTING.md (new)

**Create at repo root:**

- How to get the repo and run the app (short; link to README).
- Branch/PR expectations (e.g. main vs feature branches; no strict requirement to define now, but placeholder).
- Code style: Backend — follow existing docstrings and type hints; Frontend — follow existing Angular style and `.editorconfig` (no standalone components per project rule).
- How to run tests (once added): backend `pytest`, frontend `npm run test`.
- Where to ask questions (e.g. team channel or issue tracker).

### 1.6 Architecture / design docs

- **Existing:** `docs/admin-domain-management-plan.md` — keep; referenced from README.
- **Optional:** A short `docs/architecture.md` or `docs/overview.md`: high-level (frontend ↔ API ↔ Postgres, MinIO for bulk); domain hierarchy (L0–L3); main entities (domains, data elements, applications, EUCs, endpoints, DQ rules/exceptions, data concerns, metrics). Helps new devs see the big picture.

### 1.7 `requirements/` folder

- **Clarify in README:** This folder holds **product/feature requirements** (e.g. `initial_braindump.txt`, `initial-plan.txt`), not Python dependencies. Avoid confusion with `backend/requirements.txt`.

---

## 2. Code comments and docstrings

### 2.1 Backend (Python)

**Current state:** Good module docstrings in `main.py`, `config.py`, `database.py`, `models/__init__.py`; `domains.py` has clear helpers and docstrings.

**Standardize and add:**

- **API routers:** Ensure every router module has a one-line module docstring (e.g. “Applications API: CRUD.”). Ensure each route has a docstring (FastAPI uses these for OpenAPI).
- **Schemas:** Short docstrings for Pydantic models that are part of the public API (e.g. request/response bodies).
- **Non-obvious logic:** Inline comments for complex logic (e.g. domain tree building, depth checks, bulk upload validation). No need to comment every line.
- **`seed.py`:** Top-level docstring explaining purpose (idempotent seed; reset behavior); brief comment for `DOMAIN_HIERARCHY` and any magic numbers/IDs if used elsewhere.

### 2.2 Frontend (TypeScript/Angular)

**Current state:** Some JSDoc on interfaces in `api.service.ts`; many components have no file-level or public-method comments.

**Add:**

- **`core/api.service.ts` and `*-api.service.ts`:** File-level comment describing role (façade delegates to resource API services; DTOs in `core/models/`). Keep or add brief JSDoc for public methods and for interfaces that are “contracts” with the backend.
- **Layout and page components:** One-line file-level comment per component (e.g. “Sidebar and header layout; hosts router-outlet for main app routes.”). Optional one-line on `ngOnInit`/main entry if non-trivial.
- **Store:** Short comment at top of `app.state.ts`, `app.actions.ts`, `app.reducer.ts`, `app.effects.ts`, `app.selectors.ts` describing responsibility (e.g. “Global app state: selected domain, domain list, loading flags.”).
- **Shared components:** File-level comment for modals, detail panels, and grid cell components so new devs know when to use them.
- **Templates (HTML):** Only comment where structure is non-obvious (e.g. conditional sections or custom structural directives).

---

## 3. Refactoring and consistency

### 3.1 Backend

- **Config:** Consider using `pydantic-settings` or a small dataclass for type-safe, validated settings and a single source of env var names (optional; current `Settings` is already clear).
- **Database:** `get_db_session` vs `get_db_dep` vs `get_db` — add one-line comment in `database.py` on when to use which (dependency injection vs context manager).
- **Routers:** Ensure consistent patterns: Depends(get_db_dep), same response_model and status codes for create/update/delete (e.g. 201 for create, 200 or 204 for delete). Quick audit of all API files.
- **Error handling:** Use consistent HTTP exception messages and, where useful, structured error response (e.g. `detail` + optional `code`). Document in CONTRIBUTING or architecture if you standardize.

### 3.2 Frontend

- **`api.service.ts`:** Split done: resource-focused `*-api.service.ts` (domains, users, auth, data-elements, applications, eucs, endpoints, data-quality, data-concerns, metrics, bulk) and a thin `api.service.ts` façade; DTOs in `core/models/`, query param helpers in `core/http-params.ts`. Use the façade for backward compatibility or inject specific API services where appropriate.
- **Environment:** `environment.ts` and `environment.prod.ts` — ensure both are documented in frontend README (API URL, production build).
- **Naming:** Consistently use “DQ” vs “Data Quality” in user-facing strings vs code (document preference in CONTRIBUTING or a short style note).
- **Redux/Store:** Ensure action type names and effect flows are easy to follow; add a short comment block in `app.effects.ts` describing the main flows (e.g. load domains on init, load domain-scoped data when domain changes).

---

## 4. Testing

### 4.1 Current state

- **Backend:** No `test_*.py` or `*_test.py`; no pytest config in repo.
- **Frontend:** `npm run test` runs Karma/Jasmine; no `*.spec.ts` files found. Angular default test setup is present but unused.

### 4.2 Backend testing plan

- Add **pytest** (and optionally `pytest-asyncio`, `httpx`) to `backend/requirements.txt` or a `requirements-dev.txt`.
- Create `backend/tests/` (or `backend/app/tests/`): `conftest.py` with fixtures (e.g. test DB session, test client, override settings for test DB and optional in-memory/local S3).
- Start with a few high-value tests:
  - Health/ready endpoints.
  - One domain CRUD flow (e.g. list domains, get by id, create, update, delete with no children).
  - One representative entity (e.g. data elements list filtered by domain).
- Document in backend README: “Run tests: `pytest` from `backend/` (activate venv first).”
- Optional: `pyproject.toml` or `pytest.ini` for pytest options and paths.

### 4.3 Frontend testing plan

- Add at least one or two **component specs** (e.g. `DomainSelectorComponent` or `HomePageComponent`) and one **service spec** (e.g. `ApiService` with mocked `HttpClient`) so the pipeline is proven and new devs have a template.
- Document in frontend README: “Run unit tests: `npm run test`.”
- Optional: add a simple e2e (e.g. “navigate to home and check title”) if the team will use e2e; otherwise document “e2e to be added.”

---

## 5. Tooling and code quality

### 5.1 Linting and formatting

- **Backend:** No `ruff`, `black`, or `pylint` config found. Add at least one of:
  - **ruff** (lint + format): `pyproject.toml` or `ruff.toml` in backend or root; run in CI and locally. Or **black** + **isort** + **flake8** if the team prefers.
- **Frontend:** Rely on Angular/CLI defaults or add **ESLint** config (e.g. `angular-eslint`) and **Prettier** so formatting is consistent. `.editorconfig` is already there — keep it and align Prettier/ESLint with it (e.g. indent 2, single quotes for TS).
- Document in CONTRIBUTING: “Before committing, run backend linter/formatter and frontend lint (and fix).”

### 5.2 Pre-commit or CI (optional but recommended)

- **Pre-commit:** Add a `.pre-commit-config.yaml` (backend: ruff/black; frontend: ESLint/Prettier) so contributors get consistent checks.
- **CI (e.g. GitHub Actions):** One workflow that: installs backend deps and runs pytest; installs frontend deps and runs `npm run build` and `npm run test`. Document in README: “CI runs on push/PR and runs tests and lint.”

### 5.3 Dependencies

- **Backend:** `requirements.txt` uses lower bounds only (e.g. `fastapi>=0.109.0`). For reproducibility, consider `pip freeze` or a `requirements.lock`-style file for deploys; document in backend README or CONTRIBUTING.
- **Frontend:** `package-lock.json` is committed — good. No change needed unless you introduce a lockfile policy.

---

## 6. Repo and environment hygiene

### 6.1 Already in good shape

- `.gitignore` covers `.env`, venv, node_modules, IDE, Docker override, test artifacts.
- `.env.example` documents required and optional variables; no secrets.

### 6.2 Small improvements

- **`.env.example`:** Add a one-line comment at top: “Copy to `.env` and adjust; never commit `.env`.”
- **Docker:** If frontend is never run in Docker in dev, you can note in README that the frontend Dockerfile is for production/build only (if that’s the case).
- **Cursor/editor:** Optional: add `.cursor/rules` or a short project rule file (e.g. “Angular: no standalone components; use NgModule.”) so AI and editors respect project conventions. See create-rule skill if you use Cursor.

---

## 7. Summary checklist

Use this as a quick checklist. Order can be adjusted by priority.

| Area | Action |
|------|--------|
| **Docs** | Expand root README (prereqs, two dev modes, first-time setup, troubleshooting, links). |
| **Docs** | Replace frontend README with project-specific content (run, structure, tests). |
| **Docs** | Add backend README (setup, run, layout, env, seed, scripts). |
| **Docs** | Add CONTRIBUTING.md (how to run, test, code style). |
| **Docs** | Document `start-postgres-only.ps1` and `reset-domains-reseed.ps1` in READMEs. |
| **Docs** | Optional: short architecture/overview doc in `docs/`. |
| **Docs** | Clarify `requirements/` folder in README (product requirements, not pip). |
| **Comments** | Backend: module/route docstrings; comments for non-obvious logic and seed. |
| **Comments** | Frontend: file-level and store comments; api.service sections or split. |
| **Refactor** | Backend: document get_db vs get_db_dep; optional config/settings improvement. |
| **Refactor** | Frontend: section or split api.service; document store flows in effects. |
| **Tests** | Backend: add pytest, conftest, and a few API tests; document in backend README. |
| **Tests** | Frontend: add 1–2 component specs and 1 service spec; document in frontend README. |
| **Tooling** | Backend: add ruff (or black+flake8) and config; document in CONTRIBUTING. |
| **Tooling** | Frontend: add ESLint/Prettier if not already; align with .editorconfig. |
| **CI** | Optional: pre-commit and GitHub Actions (or similar) for lint + test. |
| **Env** | Add one-line reminder at top of `.env.example` about copying and not committing. |

---

## 8. Suggested order of work

1. **Documentation first** (READMEs, CONTRIBUTING, script docs) so new members can run the app and understand layout.
2. **Comments and small refactors** (docstrings, section comments, store/effects comments) so code is readable.
3. **Testing** (minimal backend + frontend tests and “how to run” in READMEs) so the bar is set and CI can run.
4. **Linting/formatting** and optional CI so style and tests are enforced.

After that, the repo is in good shape for onboarding; you can then iterate on more tests, deeper refactors, and architecture docs as the team grows.
