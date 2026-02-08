/**
 * Central API client for the Data Manager Portal backend.
 * All HTTP calls live here; DTOs are in core/models. Components and effects use ApiService.
 */
export * from './models';

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  Domain,
  DomainTreeNode,
  DomainCreate,
  DomainUpdate,
  User,
  UserCreate,
  UserUpdate,
  DataElement,
  DataElementSORSummary,
  Application,
  EUC,
  Endpoint,
  DataQualityRule,
  DataQualityException,
  DataConcern,
  Metrics,
  LineageResponse,
} from './models';

const API = environment.apiUrl + '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ——— Domains ———
  getDomains(): Observable<Domain[]> {
    return this.http.get<Domain[]>(`${API}/domains`);
  }

  getDomain(id: number): Observable<Domain> {
    return this.http.get<Domain>(`${API}/domains/${id}`);
  }

  getDomainsTree(): Observable<DomainTreeNode[]> {
    return this.http.get<DomainTreeNode[]>(`${API}/domain-tree`);
  }

  createDomain(body: DomainCreate): Observable<Domain> {
    return this.http.post<Domain>(`${API}/domains`, body);
  }

  updateDomain(id: number, body: DomainUpdate): Observable<Domain> {
    return this.http.patch<Domain>(`${API}/domains/${id}`, body);
  }

  deleteDomain(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/domains/${id}`);
  }

  // ——— Users ———
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API}/users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${API}/users/${id}`);
  }

  createUser(body: UserCreate): Observable<User> {
    return this.http.post<User>(`${API}/users`, body);
  }

  updateUser(id: number, body: UserUpdate): Observable<User> {
    return this.http.patch<User>(`${API}/users/${id}`, body);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/users/${id}`);
  }

  // ——— Data Elements ———
  getDataElements(domainId: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<DataElement[]> {
    let params = new HttpParams().set('domain_id', domainId);
    if (scope !== 'owned') params = params.set('scope', scope);
    return this.http.get<DataElement[]>(`${API}/data-elements`, { params });
  }

  getDataElementSorByDomain(domainId: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<DataElementSORSummary[]> {
    let params = new HttpParams().set('domain_id', domainId);
    if (scope !== 'owned') params = params.set('scope', scope);
    return this.http.get<DataElementSORSummary[]>(`${API}/data-elements/sor`, { params });
  }

  getDataElementLineage(dataElementId: number): Observable<LineageResponse> {
    return this.http.get<LineageResponse>(`${API}/data-elements/${dataElementId}/lineage`);
  }

  // ——— Applications ———
  getApplications(domainId: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<Application[]> {
    let params = new HttpParams().set('domain_id', domainId);
    if (scope !== 'owned') params = params.set('scope', scope);
    return this.http.get<Application[]>(`${API}/applications`, { params });
  }

  // ——— EUCs ———
  getEucs(domainId: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<EUC[]> {
    let params = new HttpParams().set('domain_id', domainId);
    if (scope !== 'owned') params = params.set('scope', scope);
    return this.http.get<EUC[]>(`${API}/eucs`, { params });
  }

  // ——— Endpoints ———
  getEndpoints(domainId?: number, applicationId?: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<Endpoint[]> {
    let params = new HttpParams();
    if (domainId != null) {
      params = params.set('domain_id', domainId);
      if (scope !== 'owned') params = params.set('scope', scope);
    }
    if (applicationId != null) params = params.set('application_id', applicationId);
    return this.http.get<Endpoint[]>(`${API}/endpoints`, { params });
  }

  // ——— Data Quality ———
  getDataQualityRules(domainId?: number, dataElementId?: number): Observable<DataQualityRule[]> {
    let params = new HttpParams();
    if (domainId != null) params = params.set('domain_id', domainId);
    if (dataElementId != null) params = params.set('data_element_id', dataElementId);
    return this.http.get<DataQualityRule[]>(`${API}/data-quality-rules`, { params });
  }

  getDataQualityExceptions(domainId?: number, dataElementId?: number): Observable<DataQualityException[]> {
    let params = new HttpParams();
    if (domainId != null) params = params.set('domain_id', domainId);
    if (dataElementId != null) params = params.set('data_element_id', dataElementId);
    return this.http.get<DataQualityException[]>(`${API}/data-quality-exceptions`, { params });
  }

  // ——— Data Concerns ———
  getDataConcerns(domainId: number, filters?: { application_id?: number; euc_id?: number; endpoint_id?: number; data_element_id?: number }): Observable<DataConcern[]> {
    let params = new HttpParams().set('domain_id', domainId);
    if (filters?.application_id != null) params = params.set('application_id', filters.application_id);
    if (filters?.euc_id != null) params = params.set('euc_id', filters.euc_id);
    if (filters?.endpoint_id != null) params = params.set('endpoint_id', filters.endpoint_id);
    if (filters?.data_element_id != null) params = params.set('data_element_id', filters.data_element_id);
    return this.http.get<DataConcern[]>(`${API}/data-concerns`, { params });
  }

  // ——— Metrics ———
  getMetrics(domainId?: number): Observable<Metrics> {
    const params = domainId != null ? new HttpParams().set('domain_id', domainId) : undefined;
    return this.http.get<Metrics>(`${API}/metrics`, { params });
  }

  // ——— Bulk upload/download ———
  uploadBulk(entityType: string, file: File): Observable<{ created: number; updated: number; errors: { row: number; error: string }[] }> {
    const form = new FormData();
    form.append('entity_type', entityType);
    form.append('file', file);
    return this.http.post<{ created: number; updated: number; errors: { row: number; error: string }[] }>(`${API}/bulk/upload`, form);
  }

  downloadBulk(entityType: string, domainId?: number): string {
    let url = `${API}/bulk/download?entity_type=${encodeURIComponent(entityType)}`;
    if (domainId != null) url += `&domain_id=${domainId}`;
    return url;
  }
}
