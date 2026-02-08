# Data Manager Portal — Frontend

Angular 18 app for the Data Manager Portal: data governance UI (Critical Data Elements, applications, EUCs, endpoints, DQ rules/exceptions, data concerns, metrics, bulk upload/download). Uses NgRx for state and Tailwind for styling.

## Prerequisites

- **Node.js** 18+ and **npm**
- Angular CLI is optional (use `npx ng` or scripts below)

## Setup and run

```powershell
npm install
npm run start
```

- App: http://localhost:4200  
- The app talks to the API at the URL in `src/environments/environment.ts` (default `http://localhost:8000`). For production builds, use `environment.prod.ts`.

**Development: stay logged in** — To avoid logging in on every refresh during local dev, set `devAlwaysLoggedIn: true` in `src/environments/environment.ts` and set `AUTH_DEV_ALWAYS_LOGGED_IN=true` in the backend `.env` (see backend README). Leave both **off** for production.

## Project structure (`src/app/`)

- **`core/`** — Shared services: `api.service.ts` (HTTP client and DTOs for all API calls), `data-concern-modal.service.ts`, `time-period.service.ts`
- **`layout/`** — Main app shell: `LayoutComponent` (sidebar + header + router-outlet), `AdminLayoutComponent`, `DomainSelectorComponent`
- **`pages/`** — Route targets: Home, Data Elements, Applications, EUCs, Endpoints, DQ Rules, DQ Exceptions, Data Concerns, Metrics, Bulk; Admin (Domains, User Management, Settings)
- **`shared/`** — Reusable UI: detail modals, detail panel, concept metrics, time-period switch, lineage modal, AG Grid cell components (kebab actions, counts, etc.)
- **`store/`** — NgRx: `app.state.ts`, `app.actions.ts`, `app.reducer.ts`, `app.effects.ts`, `app.selectors.ts` (global state: selected domain, domain list, loading, etc.)

## Build

```powershell
npm run build
```

Artifacts go to `dist/`. For production, the build uses `environment.prod.ts` (set `apiUrl` there for your API host).

## Tests

```powershell
npm run test
```

Runs unit tests with Karma/Jasmine. Add specs for new components and services as needed.

## Conventions

- **Angular modules:** This project uses NgModule-based components (no standalone components).
- **Styling:** Tailwind CSS; component-specific styles in `.component.css` where needed.
- **EditorConfig:** Repo root and frontend use `.editorconfig` (indent 2, single quotes for TS, etc.).

## Further help

For Angular CLI: `npx ng help` or [Angular CLI Overview](https://angular.dev/tools/cli).
