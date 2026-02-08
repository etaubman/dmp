/**
 * Selectors for app state: domains, current domain, entity lists, loading flags, errors,
 * and admin tree/users. Components and other code use these to read from the store.
 */
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from './app.state';

export const selectAppState = createFeatureSelector<AppState>('app');

export const selectDomains = createSelector(selectAppState, (s) => s.domains);
export const selectCurrentDomainId = createSelector(selectAppState, (s) => s.currentDomainId);
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
export const selectLoading = (key: string) => createSelector(selectAppState, (s) => s.loading[key] === true);
export const selectError = createSelector(selectAppState, (s) => s.error);
export const selectDomainsTree = createSelector(selectAppState, (s) => s.adminDomainsTree);
export const selectAdminDomainsError = createSelector(selectAppState, (s) => s.adminDomainsError);
export const selectAdminUsers = createSelector(selectAppState, (s) => s.adminUsers);
export const selectAdminUsersError = createSelector(selectAppState, (s) => s.adminUsersError);
export const selectAuthUser = createSelector(selectAppState, (s) => s.authUser);
export const selectAuthError = createSelector(selectAppState, (s) => s.authError);
export const selectIsAuthenticated = createSelector(selectAppState, (s) => s.authUser != null);
