# E2E Tests (Cucumber + Playwright)

Cucumber BDD tests for the Data Manager Portal. They run against the real frontend (Angular) and backend (FastAPI or Spring) in a browser. Ensure the frontend is configured for the backend you are running (see [frontend/README.md](../frontend/README.md)).

## Prerequisites

- **App must be running**: start the backend and frontend (see root [README.md](../README.md)).
- **Seeded user**: ensure the backend has been seeded so you can log in as `ethan.taubman@example.com` / `password` (run `python -m app.seed set-passwords` from `backend/` if needed).
- **Node.js** 18+ and npm.

## Setup

From the `e2e/` directory:

```powershell
npm install
npx playwright install chromium
```

## Run tests

From `e2e/`:

```powershell
npm test
```

To see the browser (headed mode):

```powershell
npm run test:headed
```

## Configuration

- **Base URL**: defaults to `http://localhost:4200`. Override with the `Given the app is running at "..."` step in feature files, or by setting `BASE_URL` in the environment if you extend the steps to use it.
- **Browser**: Chromium only by default. You can change `world.ts` to use Firefox or WebKit if needed.

## Features and steps

| Feature           | Description                          |
|-------------------|--------------------------------------|
| `login.feature`   | Login page, successful login, invalid credentials |
| `navigation.feature` | Sidebar navigation (Data Elements, Applications, Admin). One scenario (Navigate to Home from sidebar) is tagged `@skip` due to a flaky Playwright click on the Home link. |

Step definitions live in `src/steps/`. Shared browser context and Playwright page are in `src/support/world.ts`. Scenarios tagged `@skip` are excluded by default (`--tags "not @skip"`).

## Adding scenarios

1. Add or edit a `.feature` file in `features/`.
2. Implement or reuse steps in `src/steps/`.
3. Run `npm test` from `e2e/`.
