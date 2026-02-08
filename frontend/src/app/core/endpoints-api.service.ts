import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { buildOptionalDomainScopeParams, withOptionalParam, type DomainScope } from './http-params';
import type { Endpoint } from './models';

const API = environment.apiUrl + '/api';

@Injectable({ providedIn: 'root' })
export class EndpointsApiService {
  constructor(private http: HttpClient) {}

  getEndpoints(
    domainId?: number,
    applicationId?: number,
    scope: DomainScope = 'owned'
  ): Observable<Endpoint[]> {
    let params = buildOptionalDomainScopeParams(domainId ?? undefined, scope);
    params = withOptionalParam(params, 'application_id', applicationId);
    return this.http.get<Endpoint[]>(`${API}/endpoints`, { params });
  }
}
