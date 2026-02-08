/**
 * Development environment. apiUrl is the backend base URL (no /api suffix; ApiService appends /api).
 * devAlwaysLoggedIn: when true, AppComponent dispatches checkAuth on init and authGuard allows all routes without login.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  /** When true, skip login and treat as authenticated (for local dev). See backend README for AUTH_DEV_ALWAYS_LOGGED_IN. */
  devAlwaysLoggedIn: false,
};
