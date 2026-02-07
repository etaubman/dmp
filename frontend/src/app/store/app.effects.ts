import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import * as AppActions from './app.actions';
import { Store } from '@ngrx/store';

@Injectable()
export class AppEffects {
  private actions$ = inject(Actions);
  private api = inject(ApiService);
  private store = inject(Store);

  loadDomains$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadDomains),
      mergeMap(() => {
        this.store.dispatch(AppActions.setLoading({ key: 'domains', loading: true }));
        return this.api.getDomains().pipe(
          map((domains) => {
            this.store.dispatch(AppActions.setLoading({ key: 'domains', loading: false }));
            return AppActions.setDomains({ domains });
          }),
          catchError((err) => {
            this.store.dispatch(AppActions.setLoading({ key: 'domains', loading: false }));
            this.store.dispatch(AppActions.setError({ error: err?.message || 'Failed to load domains' }));
            return of(AppActions.setDomains({ domains: [] }));
          }),
        );
      }),
    ),
  );

  loadDataElements$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadDataElements),
      mergeMap(({ domainId }) => {
        this.store.dispatch(AppActions.setLoading({ key: 'dataElements', loading: true }));
        return this.api.getDataElements(domainId).pipe(
          map((dataElements) => {
            this.store.dispatch(AppActions.setLoading({ key: 'dataElements', loading: false }));
            return AppActions.setDataElements({ dataElements });
          }),
          catchError((err) => {
            this.store.dispatch(AppActions.setLoading({ key: 'dataElements', loading: false }));
            return of(AppActions.setDataElements({ dataElements: [] }));
          }),
        );
      }),
    ),
  );

  loadApplications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadApplications),
      mergeMap(({ domainId }) => {
        this.store.dispatch(AppActions.setLoading({ key: 'applications', loading: true }));
        return this.api.getApplications(domainId).pipe(
          map((applications) => {
            this.store.dispatch(AppActions.setLoading({ key: 'applications', loading: false }));
            return AppActions.setApplications({ applications });
          }),
          catchError(() => {
            this.store.dispatch(AppActions.setLoading({ key: 'applications', loading: false }));
            return of(AppActions.setApplications({ applications: [] }));
          }),
        );
      }),
    ),
  );

  loadEucs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadEucs),
      mergeMap(({ domainId }) => {
        this.store.dispatch(AppActions.setLoading({ key: 'eucs', loading: true }));
        return this.api.getEucs(domainId).pipe(
          map((eucs) => {
            this.store.dispatch(AppActions.setLoading({ key: 'eucs', loading: false }));
            return AppActions.setEucs({ eucs });
          }),
          catchError(() => {
            this.store.dispatch(AppActions.setLoading({ key: 'eucs', loading: false }));
            return of(AppActions.setEucs({ eucs: [] }));
          }),
        );
      }),
    ),
  );

  loadEndpoints$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadEndpoints),
      mergeMap(({ domainId, applicationId }) => {
        this.store.dispatch(AppActions.setLoading({ key: 'endpoints', loading: true }));
        return this.api.getEndpoints(domainId ?? undefined, applicationId ?? undefined).pipe(
          map((endpoints) => {
            this.store.dispatch(AppActions.setLoading({ key: 'endpoints', loading: false }));
            return AppActions.setEndpoints({ endpoints });
          }),
          catchError(() => {
            this.store.dispatch(AppActions.setLoading({ key: 'endpoints', loading: false }));
            return of(AppActions.setEndpoints({ endpoints: [] }));
          }),
        );
      }),
    ),
  );

  loadDataQualityRules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadDataQualityRules),
      mergeMap(({ domainId, dataElementId }) => {
        this.store.dispatch(AppActions.setLoading({ key: 'dataQualityRules', loading: true }));
        return this.api.getDataQualityRules(domainId ?? undefined, dataElementId ?? undefined).pipe(
          map((dataQualityRules) => {
            this.store.dispatch(AppActions.setLoading({ key: 'dataQualityRules', loading: false }));
            return AppActions.setDataQualityRules({ dataQualityRules });
          }),
          catchError(() => {
            this.store.dispatch(AppActions.setLoading({ key: 'dataQualityRules', loading: false }));
            return of(AppActions.setDataQualityRules({ dataQualityRules: [] }));
          }),
        );
      }),
    ),
  );

  loadDataQualityExceptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadDataQualityExceptions),
      mergeMap(({ domainId, dataElementId }) => {
        this.store.dispatch(AppActions.setLoading({ key: 'dataQualityExceptions', loading: true }));
        return this.api.getDataQualityExceptions(domainId ?? undefined, dataElementId ?? undefined).pipe(
          map((dataQualityExceptions) => {
            this.store.dispatch(AppActions.setLoading({ key: 'dataQualityExceptions', loading: false }));
            return AppActions.setDataQualityExceptions({ dataQualityExceptions });
          }),
          catchError(() => {
            this.store.dispatch(AppActions.setLoading({ key: 'dataQualityExceptions', loading: false }));
            return of(AppActions.setDataQualityExceptions({ dataQualityExceptions: [] }));
          }),
        );
      }),
    ),
  );

  loadDataConcerns$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadDataConcerns),
      mergeMap(({ domainId }) => {
        this.store.dispatch(AppActions.setLoading({ key: 'dataConcerns', loading: true }));
        return this.api.getDataConcerns(domainId).pipe(
          map((dataConcerns) => {
            this.store.dispatch(AppActions.setLoading({ key: 'dataConcerns', loading: false }));
            return AppActions.setDataConcerns({ dataConcerns });
          }),
          catchError(() => {
            this.store.dispatch(AppActions.setLoading({ key: 'dataConcerns', loading: false }));
            return of(AppActions.setDataConcerns({ dataConcerns: [] }));
          }),
        );
      }),
    ),
  );

  loadMetrics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadMetrics),
      mergeMap(({ domainId }) => {
        this.store.dispatch(AppActions.setLoading({ key: 'metrics', loading: true }));
        return this.api.getMetrics(domainId ?? undefined).pipe(
          map((metrics) => {
            this.store.dispatch(AppActions.setLoading({ key: 'metrics', loading: false }));
            return AppActions.setMetrics({ metrics });
          }),
          catchError(() => {
            this.store.dispatch(AppActions.setLoading({ key: 'metrics', loading: false }));
            return of(AppActions.setMetrics({ metrics: { domains_count: 0, data_elements_count: 0, applications_count: 0, eucs_count: 0, endpoints_count: 0, data_quality_rules_count: 0, data_quality_exceptions_count: 0, data_concerns_count: 0 } }));
          }),
        );
      }),
    ),
  );
}
