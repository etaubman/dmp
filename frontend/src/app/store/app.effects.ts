/**
 * NgRx effects: side-effect handlers for load/create/update/delete actions.
 *
 * - List loads (domains, dataElements, applications, etc.) use createLoadListEffect from
 *   effect-helpers: set loading true → call API → on success set data and loading false;
 *   on error set loading false and set empty list (and optionally set error).
 * - Metrics and domains tree have custom logic (single object or error handling).
 * - Admin domain/user CRUD: call API, then reload tree/users on success or set admin error on failure.
 * - Auth: login → set token + getMe → setAuthSession; clearAuth → clear token + navigate to login;
 *   checkAuth → getMe with stored token to restore session.
 */
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import * as AppActions from './app.actions';
import { Store } from '@ngrx/store';
import {
  createLoadListEffect,
  createLoadSingleEffect,
  createLoadAdminListEffect,
  createAdminCrudEffect,
} from './effect-helpers';
import type { Domain, DataElement, Application, EUC, Endpoint, DataFeed, DataQualityRule, DataQualityException, DataConcern, Metrics } from '../core/models';

const METRICS_FALLBACK: Metrics = {
  domains_count: 0,
  data_elements_count: 0,
  applications_count: 0,
  eucs_count: 0,
  endpoints_count: 0,
  data_quality_rules_count: 0,
  data_quality_exceptions_count: 0,
  data_concerns_count: 0,
};

@Injectable()
export class AppEffects {
  private actions$ = inject(Actions);
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private store = inject(Store);
  private router = inject(Router);

  // --- Domain-scoped list loads (use effect-helpers) ---
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

  loadDataFeeds$ = createEffect(() =>
    createLoadListEffect(this.actions$, this.store, {
      loadAction: AppActions.loadDataFeeds,
      loadingKey: 'dataFeeds',
      stateKey: 'dataFeeds',
      setAction: AppActions.setDataFeeds as unknown as (p: Record<string, unknown>) => ReturnType<typeof AppActions.setDataFeeds>,
      emptyValue: [] as DataFeed[],
      apiCall: (action: unknown) => {
        const { domainId, scope } = action as { domainId: number; scope?: 'owned' | 'upstream' | 'downstream' };
        return this.api.getDataFeeds(domainId, scope ?? 'owned');
      },
    })
  );

  // --- Metrics (single object; effect helper) ---
  loadMetrics$ = createEffect(() =>
    createLoadSingleEffect<Metrics>(this.actions$, this.store, {
      loadAction: AppActions.loadMetrics,
      loadingKey: 'metrics',
      setAction: (p: Record<string, Metrics>) => AppActions.setMetrics({ metrics: p['metrics'] }),
      setActionKey: 'metrics',
      fallbackValue: METRICS_FALLBACK,
      apiCall: (action: unknown) => {
        const { domainId } = action as { domainId?: number };
        return this.api.getMetrics(domainId ?? undefined);
      },
    })
  );

  // --- Admin: domains tree and CRUD (effect helpers) ---
  loadDomainsTree$ = createEffect(() =>
    createLoadAdminListEffect(this.actions$, this.store, {
      loadAction: AppActions.loadDomainsTree,
      loadingKey: 'adminDomainsTree',
      setAction: AppActions.setDomainsTree as unknown as (p: Record<string, unknown>) => ReturnType<typeof AppActions.setDomainsTree>,
      setErrorAction: AppActions.setAdminDomainsError,
      stateKey: 'tree',
      emptyValue: [],
      apiCall: () => this.api.getDomainsTree(),
      errorMessage: 'Failed to load domain tree',
    })
  );

  createDomain$ = createEffect(
    () =>
      createAdminCrudEffect(this.actions$, this.store, {
        requestAction: AppActions.createDomainRequest,
        apiCall: (action: unknown) => this.api.createDomain((action as { body: Parameters<ApiService['createDomain']>[0] }).body),
        successReloadActions: [AppActions.loadDomainsTree(), AppActions.loadDomains()],
        errorAction: AppActions.setAdminDomainsError,
        errorMessage: 'Failed to create domain',
      }),
    { dispatch: false },
  );

  updateDomain$ = createEffect(
    () =>
      createAdminCrudEffect(this.actions$, this.store, {
        requestAction: AppActions.updateDomainRequest,
        apiCall: (action: unknown) => {
          const { id, body } = action as { id: number; body: Parameters<ApiService['updateDomain']>[1] };
          return this.api.updateDomain(id, body);
        },
        successReloadActions: [AppActions.loadDomainsTree(), AppActions.loadDomains()],
        errorAction: AppActions.setAdminDomainsError,
        errorMessage: 'Failed to update domain',
      }),
    { dispatch: false },
  );

  deleteDomain$ = createEffect(
    () =>
      createAdminCrudEffect(this.actions$, this.store, {
        requestAction: AppActions.deleteDomainRequest,
        apiCall: (action: unknown) => this.api.deleteDomain((action as { id: number }).id),
        successReloadActions: [AppActions.loadDomainsTree(), AppActions.loadDomains()],
        errorAction: AppActions.setAdminDomainsError,
        errorMessage: 'Failed to delete domain',
      }),
    { dispatch: false },
  );

  // --- Admin: users list and CRUD (effect helpers) ---
  loadUsers$ = createEffect(() =>
    createLoadAdminListEffect(this.actions$, this.store, {
      loadAction: AppActions.loadUsers,
      loadingKey: 'adminUsers',
      setAction: AppActions.setUsers as unknown as (p: Record<string, unknown>) => ReturnType<typeof AppActions.setUsers>,
      setErrorAction: AppActions.setAdminUsersError,
      stateKey: 'users',
      emptyValue: [],
      apiCall: () => this.api.getUsers(),
      errorMessage: 'Failed to load users',
    })
  );

  createUser$ = createEffect(
    () =>
      createAdminCrudEffect(this.actions$, this.store, {
        requestAction: AppActions.createUserRequest,
        apiCall: (action: unknown) => this.api.createUser((action as { body: Parameters<ApiService['createUser']>[0] }).body),
        successReloadActions: [AppActions.loadUsers()],
        errorAction: AppActions.setAdminUsersError,
        errorMessage: 'Failed to create user',
      }),
    { dispatch: false },
  );

  updateUser$ = createEffect(
    () =>
      createAdminCrudEffect(this.actions$, this.store, {
        requestAction: AppActions.updateUserRequest,
        apiCall: (action: unknown) => {
          const { id, body } = action as { id: number; body: Parameters<ApiService['updateUser']>[1] };
          return this.api.updateUser(id, body);
        },
        successReloadActions: [AppActions.loadUsers()],
        errorAction: AppActions.setAdminUsersError,
        errorMessage: 'Failed to update user',
      }),
    { dispatch: false },
  );

  deleteUser$ = createEffect(
    () =>
      createAdminCrudEffect(this.actions$, this.store, {
        requestAction: AppActions.deleteUserRequest,
        apiCall: (action: unknown) => this.api.deleteUser((action as { id: number }).id),
        successReloadActions: [AppActions.loadUsers()],
        errorAction: AppActions.setAdminUsersError,
        errorMessage: 'Failed to delete user',
      }),
    { dispatch: false },
  );

  // --- Auth: login, session, clear, check ---
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loginRequest),
      mergeMap(({ credentials }) =>
        this.api.login(credentials).pipe(
          mergeMap((res) => {
            this.authService.setToken(res.access_token);
            return this.api.getMe().pipe(
              map((user) => AppActions.setAuthSession({ user, token: res.access_token })),
            );
          }),
          catchError((err) => {
            const msg = err?.error?.detail || err?.message || 'Login failed';
            return of(AppActions.setAuthError({ error: typeof msg === 'string' ? msg : 'Login failed' }));
          }),
        ),
      ),
    ),
  );

  loginSuccessNavigate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActions.setAuthSession),
        tap((action) => {
          if (action.token) {
            this.router.navigate(['/']);
          }
        }),
      ),
    { dispatch: false },
  );

  clearAuth$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActions.clearAuth),
        tap(() => {
          this.authService.clearToken();
          this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );

  checkAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.checkAuth),
      mergeMap(() =>
        this.api.getMe().pipe(
          map((user) => AppActions.setAuthSession({ user, token: '' })),
          catchError(() => of(AppActions.clearAuth())),
        ),
      ),
    ),
  );
}
