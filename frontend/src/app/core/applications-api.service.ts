import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { buildDomainScopeParams, type DomainScope } from './http-params';
import type { Application } from './models';

const API = environment.apiUrl + '/api';

@Injectable({ providedIn: 'root' })
export class ApplicationsApiService {
  constructor(private http: HttpClient) {}

  getApplications(domainId: number, scope: DomainScope = 'owned'): Observable<Application[]> {
    const params = buildDomainScopeParams(domainId, scope);
    return this.http.get<Application[]>(`${API}/applications`, { params });
  }
}
