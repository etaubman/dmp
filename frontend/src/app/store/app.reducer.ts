/**
 * App reducer: handles set and admin actions; updates state immutably.
 * Load actions are handled in effects (which then dispatch set actions).
 */
import { createReducer, on } from '@ngrx/store';
import { initialAppState } from 'app/store/app.state';
import {
  setDomains,
  setCurrentDomainId,
  setDataElements,
  setApplications,
  setEucs,
  setEndpoints,
  setDataQualityRules,
  setDataQualityExceptions,
  setDataConcerns,
  setMetrics,
  setLoading,
  setError,
  setDomainsTree,
  setAdminDomainsError,
  setUsers,
  setAdminUsersError,
} from 'app/store/app.actions';

export const appReducer = createReducer(
  initialAppState,
  on(setDomains, (state, { domains }) => ({ ...state, domains })),
  on(setCurrentDomainId, (state, { id }) => ({ ...state, currentDomainId: id })),
  on(setDataElements, (state, { dataElements }) => ({ ...state, dataElements })),
  on(setApplications, (state, { applications }) => ({ ...state, applications })),
  on(setEucs, (state, { eucs }) => ({ ...state, eucs })),
  on(setEndpoints, (state, { endpoints }) => ({ ...state, endpoints })),
  on(setDataQualityRules, (state, { dataQualityRules }) => ({ ...state, dataQualityRules })),
  on(setDataQualityExceptions, (state, { dataQualityExceptions }) => ({ ...state, dataQualityExceptions })),
  on(setDataConcerns, (state, { dataConcerns }) => ({ ...state, dataConcerns })),
  on(setMetrics, (state, { metrics }) => ({ ...state, metrics })),
  on(setLoading, (state, { key, loading }) => ({
    ...state,
    loading: { ...state.loading, [key]: loading },
  })),
  on(setError, (state, { error }) => ({ ...state, error })),
  on(setDomainsTree, (state, { tree }) => ({ ...state, adminDomainsTree: tree, adminDomainsError: null })),
  on(setAdminDomainsError, (state, { error }) => ({ ...state, adminDomainsError: error })),
  on(setUsers, (state, { users }) => ({ ...state, adminUsers: users, adminUsersError: null })),
  on(setAdminUsersError, (state, { error }) => ({ ...state, adminUsersError: error })),
);
