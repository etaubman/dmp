/**
 * NgRx effects: react to load/create/update/delete actions by calling ApiService,
 * then dispatch set actions (or error actions) to update the store. List loads use effect-helpers.
 */
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import * as AppActions from './app.actions';
import { Store } from '@ngrx/store';
import { createLoadListEffect } from './effect-helpers';
import type { Domain, DataElement, Application, EUC, Endpoint, DataQualityRule, DataQualityException, DataConcern } from '../core/models';

@Injectable()
export class AppEffects {
  private actions$ = inject(Actions);
  private api = inject(ApiService);
  private store = inject(Store);

  loadDomains$ = createEffect(() =>
    createLoadListEffect(this.actions$, this.store, {
      loadAction: AppActions.loadDomains,
      loadingKey: 'domains',
      stateKey: 'domains',
      setAction: AppActions.setDomains as unknown as (p: Record<string, unknown>) => ReturnType<typeof AppActions.setDomains>,
      emptyValue: [] as Domain[],
      apiCall: () => this.api.getDomains(),
      onError: (err) =>
        this.store.dispatch(AppActions.setError({ error: (err as { message?: string })?.message || 'Failed to load domains' })),
    })
  );

  loadDataElements$ = createEffect(() =>
    createLoadListEffect(this.actions$, this.store, {
      loadAction: AppActions.loadDataElements,
      loadingKey: 'dataElements',
      stateKey: 'dataElements',
      setAction: AppActions.setDataElements as unknown as (p: Record<string, unknown>) => ReturnType<typeof AppActions.setDataElements>,
      emptyValue: [] as DataElement[],
      apiCall: (action: unknown) => {
        const { domainId, scope } = action as { domainId: number; scope?: 'owned' | 'upstream' | 'downstream' };
        return this.api.getDataElements(domainId, scope ?? 'owned');
      },
    })
  );

  loadApplications$ = createEffect(() =>
    createLoadListEffect(this.actions$, this.store, {
      loadAction: AppActions.loadApplications,
      loadingKey: 'applications',
      stateKey: 'applications',
      setAction: AppActions.setApplications as unknown as (p: Record<string, unknown>) => ReturnType<typeof AppActions.setApplications>,
      emptyValue: [] as Application[],
      apiCall: (action: unknown) => {
        const { domainId, scope } = action as { domainId: number; scope?: 'owned' | 'upstream' | 'downstream' };
        return this.api.getApplications(domainId, scope ?? 'owned');
      },
    })
  );

  loadEucs$ = createEffect(() =>
    createLoadListEffect(this.actions$, this.store, {
      loadAction: AppActions.loadEucs,
      loadingKey: 'eucs',
      stateKey: 'eucs',
      setAction: AppActions.setEucs as unknown as (p: Record<string, unknown>) => ReturnType<typeof AppActions.setEucs>,
      emptyValue: [] as EUC[],
      apiCall: (action: unknown) => {
        const { domainId, scope } = action as { domainId: number; scope?: 'owned' | 'upstream' | 'downstream' };
        return this.api.getEucs(domainId, scope ?? 'owned');
      },
    })
  );

  loadEndpoints$ = createEffect(() =>
    createLoadListEffect(this.actions$, this.store, {
      loadAction: AppActions.loadEndpoints,
      loadingKey: 'endpoints',
      stateKey: 'endpoints',
      setAction: AppActions.setEndpoints as unknown as (p: Record<string, unknown>) => ReturnType<typeof AppActions.setEndpoints>,
      emptyValue: [] as Endpoint[],
      apiCall: (action: unknown) => {
        const { domainId, applicationId, scope } = action as {
          domainId?: number;
          applicationId?: number;
          scope?: 'owned' | 'upstream' | 'downstream';
        };
        return this.api.getEndpoints(domainId ?? undefined, applicationId ?? undefined, scope ?? 'owned');
      },
    })
  );

  loadDataQualityRules$ = createEffect(() =>
    createLoadListEffect(this.actions$, this.store, {
      loadAction: AppActions.loadDataQualityRules,
      loadingKey: 'dataQualityRules',
      stateKey: 'dataQualityRules',
      setAction: AppActions.setDataQualityRules as unknown as (p: Record<string, unknown>) => ReturnType<typeof AppActions.setDataQualityRules>,
      emptyValue: [] as DataQualityRule[],
      apiCall: (action: unknown) => {
        const { domainId, dataElementId } = action as { domainId?: number; dataElementId?: number };
        return this.api.getDataQualityRules(domainId ?? undefined, dataElementId ?? undefined);
      },
    })
  );

  loadDataQualityExceptions$ = createEffect(() =>
    createLoadListEffect(this.actions$, this.store, {
      loadAction: AppActions.loadDataQualityExceptions,
      loadingKey: 'dataQualityExceptions',
      stateKey: 'dataQualityExceptions',
      setAction: AppActions.setDataQualityExceptions as unknown as (p: Record<string, unknown>) => ReturnType<typeof AppActions.setDataQualityExceptions>,
      emptyValue: [] as DataQualityException[],
      apiCall: (action: unknown) => {
        const { domainId, dataElementId } = action as { domainId?: number; dataElementId?: number };
        return this.api.getDataQualityExceptions(domainId ?? undefined, dataElementId ?? undefined);
      },
    })
  );

  loadDataConcerns$ = createEffect(() =>
    createLoadListEffect(this.actions$, this.store, {
      loadAction: AppActions.loadDataConcerns,
      loadingKey: 'dataConcerns',
      stateKey: 'dataConcerns',
      setAction: AppActions.setDataConcerns as unknown as (p: Record<string, unknown>) => ReturnType<typeof AppActions.setDataConcerns>,
      emptyValue: [] as DataConcern[],
      apiCall: (action: unknown) => {
        const { domainId } = action as { domainId: number };
        return this.api.getDataConcerns(domainId);
      },
    })
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

  loadDomainsTree$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadDomainsTree),
      mergeMap(() => {
        this.store.dispatch(AppActions.setLoading({ key: 'adminDomainsTree', loading: true }));
        return this.api.getDomainsTree().pipe(
          map((tree) => {
            this.store.dispatch(AppActions.setLoading({ key: 'adminDomainsTree', loading: false }));
            return AppActions.setDomainsTree({ tree });
          }),
          catchError((err) => {
            this.store.dispatch(AppActions.setLoading({ key: 'adminDomainsTree', loading: false }));
            const msg = err?.error?.detail || err?.message || 'Failed to load domain tree';
            this.store.dispatch(AppActions.setAdminDomainsError({ error: typeof msg === 'string' ? msg : JSON.stringify(msg) }));
            return of(AppActions.setDomainsTree({ tree: [] }));
          }),
        );
      }),
    ),
  );

  createDomain$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.createDomainRequest),
      mergeMap(({ body }) =>
        this.api.createDomain(body).pipe(
          map(() => {
            this.store.dispatch(AppActions.loadDomainsTree());
            this.store.dispatch(AppActions.loadDomains());
            return { type: '[App] Create Domain Success' };
          }),
          catchError((err) => {
            const msg = err?.error?.detail || err?.message || 'Failed to create domain';
            this.store.dispatch(AppActions.setAdminDomainsError({ error: typeof msg === 'string' ? msg : JSON.stringify(msg) }));
            return of({ type: '[App] Create Domain Failed' });
          }),
        ),
      ),
    ),
    { dispatch: false },
  );

  updateDomain$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.updateDomainRequest),
      mergeMap(({ id, body }) =>
        this.api.updateDomain(id, body).pipe(
          map(() => {
            this.store.dispatch(AppActions.loadDomainsTree());
            this.store.dispatch(AppActions.loadDomains());
            return { type: '[App] Update Domain Success' };
          }),
          catchError((err) => {
            const msg = err?.error?.detail || err?.message || 'Failed to update domain';
            this.store.dispatch(AppActions.setAdminDomainsError({ error: typeof msg === 'string' ? msg : JSON.stringify(msg) }));
            return of({ type: '[App] Update Domain Failed' });
          }),
        ),
      ),
    ),
    { dispatch: false },
  );

  deleteDomain$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.deleteDomainRequest),
      mergeMap(({ id }) =>
        this.api.deleteDomain(id).pipe(
          map(() => {
            this.store.dispatch(AppActions.loadDomainsTree());
            this.store.dispatch(AppActions.loadDomains());
            return { type: '[App] Delete Domain Success' };
          }),
          catchError((err) => {
            const msg = err?.error?.detail || err?.message || 'Failed to delete domain';
            this.store.dispatch(AppActions.setAdminDomainsError({ error: typeof msg === 'string' ? msg : JSON.stringify(msg) }));
            return of({ type: '[App] Delete Domain Failed' });
          }),
        ),
      ),
    ),
    { dispatch: false },
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadUsers),
      mergeMap(() => {
        this.store.dispatch(AppActions.setLoading({ key: 'adminUsers', loading: true }));
        return this.api.getUsers().pipe(
          map((users) => {
            this.store.dispatch(AppActions.setLoading({ key: 'adminUsers', loading: false }));
            return AppActions.setUsers({ users });
          }),
          catchError((err) => {
            this.store.dispatch(AppActions.setLoading({ key: 'adminUsers', loading: false }));
            const msg = err?.error?.detail || err?.message || 'Failed to load users';
            this.store.dispatch(AppActions.setAdminUsersError({ error: typeof msg === 'string' ? msg : JSON.stringify(msg) }));
            return of(AppActions.setUsers({ users: [] }));
          }),
        );
      }),
    ),
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.createUserRequest),
      mergeMap(({ body }) =>
        this.api.createUser(body).pipe(
          map(() => {
            this.store.dispatch(AppActions.loadUsers());
            return { type: '[App] Create User Success' };
          }),
          catchError((err) => {
            const msg = err?.error?.detail || err?.message || 'Failed to create user';
            this.store.dispatch(AppActions.setAdminUsersError({ error: typeof msg === 'string' ? msg : JSON.stringify(msg) }));
            return of({ type: '[App] Create User Failed' });
          }),
        ),
      ),
    ),
    { dispatch: false },
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.updateUserRequest),
      mergeMap(({ id, body }) =>
        this.api.updateUser(id, body).pipe(
          map(() => {
            this.store.dispatch(AppActions.loadUsers());
            return { type: '[App] Update User Success' };
          }),
          catchError((err) => {
            const msg = err?.error?.detail || err?.message || 'Failed to update user';
            this.store.dispatch(AppActions.setAdminUsersError({ error: typeof msg === 'string' ? msg : JSON.stringify(msg) }));
            return of({ type: '[App] Update User Failed' });
          }),
        ),
      ),
    ),
    { dispatch: false },
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.deleteUserRequest),
      mergeMap(({ id }) =>
        this.api.deleteUser(id).pipe(
          map(() => {
            this.store.dispatch(AppActions.loadUsers());
            return { type: '[App] Delete User Success' };
          }),
          catchError((err) => {
            const msg = err?.error?.detail || err?.message || 'Failed to delete user';
            this.store.dispatch(AppActions.setAdminUsersError({ error: typeof msg === 'string' ? msg : JSON.stringify(msg) }));
            return of({ type: '[App] Delete User Failed' });
          }),
        ),
      ),
    ),
    { dispatch: false },
  );
}
