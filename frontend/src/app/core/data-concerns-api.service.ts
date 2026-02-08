import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { withOptionalParam } from './http-params';
import type { DataConcern } from './models';

const API = environment.apiUrl + '/api';

@Injectable({ providedIn: 'root' })
export class DataConcernsApiService {
  constructor(private http: HttpClient) {}

  getDataConcerns(
    domainId: number,
    filters?: {
      application_id?: number;
      euc_id?: number;
      endpoint_id?: number;
      data_element_id?: number;
    }
  ): Observable<DataConcern[]> {
    let params = new HttpParams().set('domain_id', domainId);
    params = withOptionalParam(params, 'application_id', filters?.application_id);
    params = withOptionalParam(params, 'euc_id', filters?.euc_id);
    params = withOptionalParam(params, 'endpoint_id', filters?.endpoint_id);
    params = withOptionalParam(params, 'data_element_id', filters?.data_element_id);
    return this.http.get<DataConcern[]>(`${API}/data-concerns`, { params });
  }
}
