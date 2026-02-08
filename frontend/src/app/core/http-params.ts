/**
 * Typed query parameter builders for API clients.
 * Use these to keep domain_id, scope, and optional filters consistent across clients.
 */
import { HttpParams } from '@angular/common/http';

export type DomainScope = 'owned' | 'upstream' | 'downstream';

/**
 * Build params with required domain_id and optional scope (omit when 'owned').
 */
export function buildDomainScopeParams(
  domainId: number,
  scope: DomainScope = 'owned'
): HttpParams {
  let params = new HttpParams().set('domain_id', domainId);
  if (scope !== 'owned') {
    params = params.set('scope', scope);
  }
  return params;
}

/**
 * Add an optional query parameter only when the value is defined and not null.
 */
export function withOptionalParam<T>(
  params: HttpParams,
  key: string,
  value: T | null | undefined,
  toString: (v: T) => string = String
): HttpParams {
  if (value == null) return params;
  return params.set(key, toString(value));
}

/**
 * Build params with optional domain_id and scope (for endpoints that support both).
 */
export function buildOptionalDomainScopeParams(
  domainId?: number | null,
  scope: DomainScope = 'owned'
): HttpParams {
  let params = new HttpParams();
  if (domainId != null) {
    params = params.set('domain_id', domainId);
    if (scope !== 'owned') params = params.set('scope', scope);
  }
  return params;
}

/**
 * Build params from a record of optional filters (only defined values are added).
 */
export function buildFilterParams(
  filters: Record<string, number | string | boolean | null | undefined>
): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value != null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}
