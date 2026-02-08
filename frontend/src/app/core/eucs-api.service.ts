import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { buildDomainScopeParams, type DomainScope } from './http-params';
import type { EUC } from './models';

const API = environment.apiUrl + '/api';

@Injectable({ providedIn: 'root' })
export class EucsApiService {
  constructor(private http: HttpClient) {}

  getEucs(domainId: number, scope: DomainScope = 'owned'): Observable<EUC[]> {
    const params = buildDomainScopeParams(domainId, scope);
    return this.http.get<EUC[]>(`${API}/eucs`, { params });
  }
}
