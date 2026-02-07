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
