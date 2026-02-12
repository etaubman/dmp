/**
 * Development environment. Switch backends via the `backend` property.
 * apiUrl is derived from backend (FastAPI: 8000, Spring: 8081).
 * devAlwaysLoggedIn: when true, AppComponent dispatches checkAuth on init and authGuard allows all routes without login.
 */
export type BackendType = 'fastapi' | 'spring';

const backend: BackendType = 'fastapi' as BackendType;
const apiUrlFastApi = 'http://localhost:8000';
const apiUrlSpring = 'http://localhost:8081';

export const environment = {
  production: false,
  backend,
  apiUrlFastApi,
  apiUrlSpring,
  /** Resolved API base URL (no /api suffix; services append /api). */
  apiUrl: backend === 'spring' ? apiUrlSpring : apiUrlFastApi,
  /** When true, skip login and treat as authenticated (for local dev). See backend README for AUTH_DEV_ALWAYS_LOGGED_IN. */
  devAlwaysLoggedIn: false,
};
