/**
 * NgRx selectors for the app state slice.
 *
 * Use selectAppState for the whole slice; use the specific selectors in components
 * (e.g. selectDomains, selectCurrentDomain) so only relevant state changes trigger updates.
 * selectLoading(key) is a factory: pass a loading key (e.g. 'domains') to get a selector
 * for that key.
 */
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from './app.state';

/** Base selector for the 'app' feature state. Other selectors derive from this. */
export const selectAppState = createFeatureSelector<AppState>('app');

// Domain and entity lists
export const selectDomains = createSelector(selectAppState, (s) => s.domains);
export const selectCurrentDomainId = createSelector(selectAppState, (s) => s.currentDomainId);
/** Resolves currentDomainId to the full Domain object, or null if none selected. */
export const selectCurrentDomain = createSelector(
  selectAppState,
  (s) => s.domains.find((d) => d.id === s.currentDomainId) ?? null,
);
export const selectDataElements = createSelector(selectAppState, (s) => s.dataElements);
export const selectApplications = createSelector(selectAppState, (s) => s.applications);
export const selectEucs = createSelector(selectAppState, (s) => s.eucs);
export const selectEndpoints = createSelector(selectAppState, (s) => s.endpoints);
export const selectDataQualityRules = createSelector(selectAppState, (s) => s.dataQualityRules);
export const selectDataQualityExceptions = createSelector(selectAppState, (s) => s.dataQualityExceptions);
export const selectDataConcerns = createSelector(selectAppState, (s) => s.dataConcerns);
export const selectMetrics = createSelector(selectAppState, (s) => s.metrics);

// Loading and global error (key must match effect loadingKey)
export const selectLoading = (key: string) => createSelector(selectAppState, (s) => s.loading[key] === true);
export const selectError = createSelector(selectAppState, (s) => s.error);

// Admin
export const selectDomainsTree = createSelector(selectAppState, (s) => s.adminDomainsTree);
export const selectAdminDomainsError = createSelector(selectAppState, (s) => s.adminDomainsError);
export const selectAdminUsers = createSelector(selectAppState, (s) => s.adminUsers);
export const selectAdminUsersError = createSelector(selectAppState, (s) => s.adminUsersError);

// Auth
export const selectAuthUser = createSelector(selectAppState, (s) => s.authUser);
export const selectAuthError = createSelector(selectAppState, (s) => s.authError);
export const selectIsAuthenticated = createSelector(selectAppState, (s) => s.authUser != null);
