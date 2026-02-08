/**
 * Helpers to reduce NgRx effect boilerplate for load/list, single-object, and admin CRUD flows.
 */
import { Action } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as AppActions from './app.actions';

/**
 * Config for a list-load effect: dispatch loading, call API, then set list or empty on error.
 * Uses loose typing so any load/set action pair and apiCall can be passed without generic noise.
 */
export interface LoadListEffectConfig {
  loadAction: Parameters<typeof ofType>[0];
  loadingKey: string;
  stateKey: string;
  setAction: (payload: Record<string, unknown>) => Action;
  emptyValue: unknown[];
  /** (action) => Observable<list>. Action shape depends on load action; typed loosely for reuse. */
  apiCall: (action: unknown) => Observable<unknown[]>;
  onError?: (err: unknown) => void;
}

/**
 * Creates an effect that: on loadAction, sets loading true → calls apiCall → on success sets data and loading false;
 * on error sets loading false, optionally calls onError, and dispatches setAction with emptyValue.
 */
export function createLoadListEffect(
  actions$: Actions,
  store: Store,
  config: LoadListEffectConfig
): Observable<Action> {
  return actions$.pipe(
    ofType(config.loadAction),
    mergeMap((action: unknown) => {
      store.dispatch(AppActions.setLoading({ key: config.loadingKey, loading: true }));
      return (config.apiCall(action) as Observable<unknown[]>).pipe(
        map((data) => {
          store.dispatch(AppActions.setLoading({ key: config.loadingKey, loading: false }));
          return config.setAction({ [config.stateKey]: data });
        }),
        catchError((err) => {
          store.dispatch(AppActions.setLoading({ key: config.loadingKey, loading: false }));
          config.onError?.(err);
          return of(config.setAction({ [config.stateKey]: config.emptyValue }));
        })
      );
    })
  );
}

/**
 * Config for a single-object load effect (e.g. metrics): loading key, set action, fallback value on error.
 */
export interface LoadSingleEffectConfig<T> {
  loadAction: Parameters<typeof ofType>[0];
  loadingKey: string;
  setAction: (payload: { [key: string]: T }) => Action;
  setActionKey: string;
  fallbackValue: T;
  apiCall: (action: unknown) => Observable<T>;
}

/**
 * Creates an effect that: on loadAction, sets loading true → apiCall → on success sets data and loading false;
 * on error sets loading false and dispatches setAction with fallbackValue.
 */
export function createLoadSingleEffect<T>(
  actions$: Actions,
  store: Store,
  config: LoadSingleEffectConfig<T>
): Observable<Action> {
  return actions$.pipe(
    ofType(config.loadAction),
    mergeMap((action: unknown) => {
      store.dispatch(AppActions.setLoading({ key: config.loadingKey, loading: true }));
      return config.apiCall(action).pipe(
        map((data) => {
          store.dispatch(AppActions.setLoading({ key: config.loadingKey, loading: false }));
          return config.setAction({ [config.setActionKey]: data } as { [key: string]: T });
        }),
        catchError(() => {
          store.dispatch(AppActions.setLoading({ key: config.loadingKey, loading: false }));
          return of(config.setAction({ [config.setActionKey]: config.fallbackValue } as { [key: string]: T }));
        })
      );
    })
  );
}

/**
 * Config for admin list load (e.g. domains tree, users): loading key, set action, set error action, empty value.
 */
export interface LoadAdminListEffectConfig {
  loadAction: Parameters<typeof ofType>[0];
  loadingKey: string;
  setAction: (payload: Record<string, unknown>) => Action;
  setErrorAction: (payload: { error: string | null }) => Action;
  stateKey: string;
  emptyValue: unknown[];
  apiCall: () => Observable<unknown[]>;
  /** Default message when error has no detail. */
  errorMessage: string;
}

/**
 * Creates an effect that: on loadAction, sets loading true → apiCall → on success sets data;
 * on error sets loading false, dispatches setErrorAction with extracted message, and sets empty list.
 */
export function createLoadAdminListEffect(
  actions$: Actions,
  store: Store,
  config: LoadAdminListEffectConfig
): Observable<Action> {
  return actions$.pipe(
    ofType(config.loadAction),
    mergeMap(() => {
      store.dispatch(AppActions.setLoading({ key: config.loadingKey, loading: true }));
      return (config.apiCall() as Observable<unknown[]>).pipe(
        map((data) => {
          store.dispatch(AppActions.setLoading({ key: config.loadingKey, loading: false }));
          return config.setAction({ [config.stateKey]: data });
        }),
        catchError((err: unknown) => {
          store.dispatch(AppActions.setLoading({ key: config.loadingKey, loading: false }));
          const msg = (err as { error?: { detail?: unknown }; message?: string })?.error?.detail
            ?? (err as { message?: string })?.message
            ?? config.errorMessage;
          store.dispatch(config.setErrorAction({ error: typeof msg === 'string' ? msg : JSON.stringify(msg) }));
          return of(config.setAction({ [config.stateKey]: config.emptyValue }));
        })
      );
    })
  );
}

/** Extract error message from typical API error for admin CRUD. */
export function extractApiErrorMessage(err: unknown, fallback: string): string {
  const e = err as { error?: { detail?: unknown }; message?: string };
  const msg = e?.error?.detail ?? e?.message ?? fallback;
  return typeof msg === 'string' ? msg : JSON.stringify(msg);
}

/**
 * Config for admin CRUD effect (create/update/delete): request action, API call from action, reload actions on success, set error on failure.
 */
export interface AdminCrudEffectConfig {
  requestAction: Parameters<typeof ofType>[0];
  apiCall: (action: unknown) => Observable<unknown>;
  successReloadActions: Action[];
  errorAction: (payload: { error: string | null }) => Action;
  errorMessage: string;
}

/**
 * Creates an effect that: on requestAction, calls apiCall → on success dispatches successReloadActions;
 * on error dispatches errorAction with extracted message. Use with { dispatch: false }.
 */
export function createAdminCrudEffect(
  actions$: Actions,
  store: Store,
  config: AdminCrudEffectConfig
): Observable<unknown> {
  return actions$.pipe(
    ofType(config.requestAction),
    mergeMap((action: unknown) =>
      (config.apiCall(action) as Observable<unknown>).pipe(
        map(() => {
          config.successReloadActions.forEach((a) => store.dispatch(a));
          return undefined;
        }),
        catchError((err: unknown) => {
          store.dispatch(config.errorAction({ error: extractApiErrorMessage(err, config.errorMessage) }));
          return of(undefined);
        })
      )
    )
  );
}
