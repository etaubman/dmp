import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { buildDomainScopeParams, type DomainScope } from './http-params';
import type { DataElement, DataElementSORSummary, LineageResponse, LineageApplication } from './models';

const API = environment.apiUrl + '/api';

@Injectable({ providedIn: 'root' })
export class DataElementsApiService {
  constructor(private http: HttpClient) {}

  getDataElements(domainId: number, scope: DomainScope = 'owned'): Observable<DataElement[]> {
    const params = buildDomainScopeParams(domainId, scope);
    return this.http.get<DataElement[]>(`${API}/data-elements`, { params });
  }

  getDataElementSorByDomain(domainId: number, scope: DomainScope = 'owned'): Observable<DataElementSORSummary[]> {
    const params = buildDomainScopeParams(domainId, scope);
    return this.http.get<DataElementSORSummary[]>(`${API}/data-elements/sor`, { params });
  }

  getDataElementLineage(dataElementId: number): Observable<LineageResponse> {
    return this.http.get<LineageResponse>(`${API}/data-elements/${dataElementId}/lineage`);
  }

  getDataElementLineageApplications(dataElementId: number): Observable<LineageApplication[]> {
    return this.http.get<LineageApplication[]>(`${API}/data-elements/${dataElementId}/lineage-applications`);
  }
}
