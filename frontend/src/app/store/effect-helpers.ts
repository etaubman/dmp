/**
 * Helpers to reduce NgRx effect boilerplate for "load list → set loading → api → set data / catchError" flows.
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
