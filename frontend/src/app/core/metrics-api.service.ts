import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { withOptionalParam } from './http-params';
import type { Metrics } from './models';

const API = environment.apiUrl + '/api';

@Injectable({ providedIn: 'root' })
export class MetricsApiService {
  constructor(private http: HttpClient) {}

  getMetrics(domainId?: number): Observable<Metrics> {
    const params = domainId != null ? withOptionalParam(new HttpParams(), 'domain_id', domainId) : undefined;
    return this.http.get<Metrics>(`${API}/metrics`, { params });
  }
}
