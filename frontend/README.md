# Data Manager Portal — Frontend

Angular 18 app for the Data Manager Portal: data governance UI for Critical Data Elements, applications, EUCs, endpoints, DQ rules/exceptions, data concerns, metrics, and bulk upload/download. Uses NgRx for state and Tailwind for styling.

This README helps **new team members** run the frontend, understand its structure, and add features.

---

## What the frontend does

- **Domain-scoped UI:** User selects a domain in the sidebar; most pages and API calls are scoped to that domain.
- **Entity pages:** Data Elements, Applications, EUCs, Endpoints, DQ Rules, DQ Exceptions, Data Concerns, Metrics — each with list/detail and optional bulk actions.
- **Admin:** Domains management, User management, Settings (behind auth).
- **Auth:** Login page; optional dev mode to stay "logged in" without credentials during local development.
- **Bulk:** Upload/download CSV for integration with other teams; uses the backend bulk API.

---

## Prerequisites

- **Node.js** 18+ and **npm**
- Angular CLI is optional (use `npx ng` or the scripts below)

---

## Setup and run

```powershell
npm install
npm run start
```

- **App:** http://localhost:4200  
- The app talks to the API at the URL in `src/environments/environment.ts`. By default it uses **FastAPI** at `http://localhost:8000`.

### Switching backends (FastAPI vs Spring)

The frontend supports both FastAPI (port 8000) and Spring Boot (port 8081) backends:

| Backend | Command | API URL |
|---------|---------|---------|
| FastAPI (default) | `npm run start` | http://localhost:8000 |
| Spring Boot | `npm run start:spring` | http://localhost:8081 |

Alternatively, edit `src/environments/environment.ts` and set `backend: 'spring'` to use the Spring backend without changing the serve command.

**Development: stay logged in** — To avoid logging in on every refresh during local dev:
1. Set `devAlwaysLoggedIn: true` in `src/environments/environment.ts`.
2. Set `AUTH_DEV_ALWAYS_LOGGED_IN=true` in the backend `.env` (see [backend README](../backend/README.md)).

Leave both **off** for production.

---

## Project structure (`src/app/`)

| Path | Purpose |
|------|---------|
| **`core/`** | API clients: resource-focused services (`domains-api.service.ts`, `users-api.service.ts`, `auth-api.service.ts`, `data-elements-api.service.ts`, `applications-api.service.ts`, `eucs-api.service.ts`, `endpoints-api.service.ts`, `data-quality-api.service.ts`, `data-concerns-api.service.ts`, `metrics-api.service.ts`, `bulk-api.service.ts`) and a thin façade `api.service.ts` that delegates to them; `http-params.ts` for typed query builders (`buildDomainScopeParams`, `withOptionalParam`, etc.); `models/` for shared DTOs; `auth.service.ts`, `auth.guard.ts`, `auth-interceptor.ts`, `data-concern-modal.service.ts`, `time-period.service.ts`. |
| **`layout/`** | App shell: `LayoutComponent` (sidebar + header + router-outlet), `AdminLayoutComponent`, `DomainSelectorComponent`. |
| **`pages/`** | Route targets: Home, Data Elements, Applications, EUCs, Endpoints, DQ Rules, DQ Exceptions, Data Concerns, Metrics, Bulk; Admin (Domains, User Management, Settings); Login. |
| **`shared/`** | Reusable UI: detail modals, detail panel, concept metrics, time-period switch, lineage modal, AG Grid cell components (kebab actions, counts, etc.). |
| **`store/`** | NgRx: `app.state.ts`, `app.actions.ts`, `app.reducer.ts`, `app.effects.ts`, `app.selectors.ts` (global state: selected domain, domain list, loading, etc.). **`effect-helpers.ts`** provides factories for list load, single-object load, admin list load, and admin CRUD effects. |

**Adding a new page:** Create a module under `pages/<name>-page/`, add a route in `app-routing.module.ts`, and add a nav link in the layout if needed. Use `core/api.service.ts` (façade) or the relevant `core/<resource>-api.service.ts` for API calls, and the store for domain/global state.

---

## Key concepts for developers

- **NgRx flow:** User action → dispatch action → effect (optional API call) → reducer updates state → selectors feed components. See `store/app.actions.ts`, `app.effects.ts`, `app.reducer.ts`, `app.selectors.ts`.
- **Domain context:** The selected domain is in the store; pages and the API service use it for scoped requests. The domain selector in the layout updates the store.
- **Auth:** `auth.guard.ts` protects routes; `auth-interceptor.ts` adds the JWT to requests. Admin routes use the same guard (role checks can be extended there).
- **Environment:** `environment.ts` (dev) and `environment.prod.ts` (prod build) define `apiUrl`, `backend`, and `devAlwaysLoggedIn`. Use these instead of hardcoding URLs. Use `environment.spring.ts` (via `npm run start:spring`) to target the Spring backend.

---

## Build

```powershell
npm run build
```

Artifacts go to `dist/frontend-app/`. For production, the build uses `environment.prod.ts` (typically `apiUrl: '/api'` for same-origin). To build for Spring: `ng build --configuration=spring`.

### Rebuild from scratch

To reinstall dependencies and do a clean build:

```powershell
Remove-Item -Recurse -Force node_modules, .angular, dist -ErrorAction SilentlyContinue
npm install
npm run build
```

On Windows, if `node_modules` cannot be deleted (e.g. "Access denied" on native binaries), close the IDE and any running Node or Angular processes, then retry or delete `node_modules` manually.

---

## Tests

```powershell
npm run test
```

Runs unit tests with Karma/Jasmine. Add specs for new components and services as needed. See root [CONTRIBUTING.md](../CONTRIBUTING.md) for expectations.

---

## Conventions

- **Angular modules:** This project uses **NgModule-based components** (no standalone components).
- **Styling:** Tailwind CSS; component-specific styles in `.component.css` where needed.
- **EditorConfig:** Repo root and frontend use `.editorconfig` (indent 2, single quotes for TS, etc.).

---

## Useful npm scripts

| Script | Purpose |
|--------|---------|
| `npm run start` | Dev server (default port 4200, FastAPI backend). |
| `npm run start:spring` | Dev server with Spring backend (port 8081). |
| `npm run build` | Production build to `dist/`. |
| `npm run test` | Run unit tests (Karma/Jasmine). |
| `npx ng generate module pages/my-page --routing` | Generate a new feature module (example). |
| `npx ng help` | Angular CLI help. |

---

## CORS and API URL

If the frontend runs on a different origin (e.g. different port or host), the backend must allow it via CORS. FastAPI: `CORS_ORIGINS` in `backend/app/config.py`; Spring: `CORS_ORIGINS` in `backend-spring` (env: comma-separated list). The frontend does not use a dev proxy by default; it calls `apiUrl` from the environment directly. Ensure `environment.ts` has the correct `apiUrl` for your backend (FastAPI: `http://localhost:8000`, Spring: `http://localhost:8081`).

---

## Further help

- Angular CLI: `npx ng help` or [Angular CLI Overview](https://angular.dev/tools/cli).
- NgRx: [NgRx Documentation](https://ngrx.io/).
