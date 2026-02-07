import { createReducer, on } from '@ngrx/store';
import * as AppActions from './app.actions';
import { initialAppState } from './app.state';

export const appReducer = createReducer(
  initialAppState,
  on(AppActions.setDomains, (state, { domains }) => ({ ...state, domains })),
  on(AppActions.setCurrentDomainId, (state, { id }) => ({ ...state, currentDomainId: id })),
  on(AppActions.setDataElements, (state, { dataElements }) => ({ ...state, dataElements })),
  on(AppActions.setApplications, (state, { applications }) => ({ ...state, applications })),
  on(AppActions.setEucs, (state, { eucs }) => ({ ...state, eucs })),
  on(AppActions.setEndpoints, (state, { endpoints }) => ({ ...state, endpoints })),
  on(AppActions.setDataQualityRules, (state, { dataQualityRules }) => ({ ...state, dataQualityRules })),
  on(AppActions.setDataQualityExceptions, (state, { dataQualityExceptions }) => ({ ...state, dataQualityExceptions })),
  on(AppActions.setDataConcerns, (state, { dataConcerns }) => ({ ...state, dataConcerns })),
  on(AppActions.setMetrics, (state, { metrics }) => ({ ...state, metrics })),
  on(AppActions.setLoading, (state, { key, loading }) => ({
    ...state,
    loading: { ...state.loading, [key]: loading },
  })),
  on(AppActions.setError, (state, { error }) => ({ ...state, error })),
);
