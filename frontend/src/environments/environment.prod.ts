/**
 * Production environment. apiUrl is typically relative (/api) so the same origin is used.
 * devAlwaysLoggedIn must remain false in production.
 */
export const environment = {
  production: true,
  apiUrl: '/api',
  devAlwaysLoggedIn: false,
};
