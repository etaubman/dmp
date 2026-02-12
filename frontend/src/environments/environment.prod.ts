/**
 * Production environment. apiUrl is typically relative (/api) so the same origin is used.
 * devAlwaysLoggedIn must remain false in production.
 * For production, the reverse proxy usually routes /api to the chosen backend (FastAPI or Spring).
 */
export const environment = {
  production: true,
  backend: 'fastapi' as const,
  apiUrlFastApi: '/api',
  apiUrlSpring: '/api',
  apiUrl: '/api',
  devAlwaysLoggedIn: false,
};
