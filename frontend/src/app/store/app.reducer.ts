/**
 * App reducer: pure function that updates app state in response to actions.
 *
 * Handles only "set" and auth/admin "set" actions. Load/create/update/delete
 * actions are not handled here—they are handled in AppEffects, which call the
 * API and then dispatch the corresponding set action (e.g. setDomains, setUsers).
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
  setAuthSession,
  clearAuth,
  setAuthError,
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
  on(setAuthSession, (state, { user }) => ({ ...state, authUser: user, authError: null })),
  on(clearAuth, (state) => ({ ...state, authUser: null, authError: null })),
  on(setAuthError, (state, { error }) => ({ ...state, authError: error })),
);
