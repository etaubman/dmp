/**
 * Development environment with Spring backend.
 * Use: npm run start -- --configuration=spring (or ng serve --configuration=spring)
 */
const backend = 'spring' as const;
const apiUrlFastApi = 'http://localhost:8000';
const apiUrlSpring = 'http://localhost:8081';

export const environment = {
  production: false,
  backend,
  apiUrlFastApi,
  apiUrlSpring,
  apiUrl: backend === 'spring' ? apiUrlSpring : apiUrlFastApi,
  devAlwaysLoggedIn: false,
};
