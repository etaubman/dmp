import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API = environment.apiUrl + '/api';

export interface Domain {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
}

/** Tree node for admin domain hierarchy (L0→L1→L2→L3). */
export interface DomainTreeNode {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  level: number;
  children: DomainTreeNode[];
}

export interface DomainCreate {
  name: string;
  description?: string;
  parent_id?: number;
}

export interface DomainUpdate {
  name?: string;
  description?: string;
  parent_id?: number | null;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserCreate {
  email: string;
  name?: string;
  role?: string;
}

export interface UserUpdate {
  email?: string;
  name?: string;
  role?: string;
}

export interface DataElement {
  id: number;
  domain_id: number;
  name: string;
  description?: string;
  element_type?: string;
}

export interface Application {
  id: number;
  domain_id: number;
  name: string;
  description?: string;
}

export interface EUC {
  id: number;
  domain_id: number;
  name: string;
  description?: string;
  euc_type?: string;
}

export interface Endpoint {
  id: number;
  domain_id?: number;
  application_id?: number;
  name: string;
  description?: string;
}

export interface DataQualityRule {
  id: number;
  domain_id?: number;
  data_element_id?: number;
  endpoint_id?: number;
  name: string;
  description?: string;
  rule_type?: string;
}

export interface DataQualityException {
  id: number;
  rule_id: number;
  data_element_id?: number;
  description?: string;
  status?: string;
  identified_at?: string;
}

export interface DataConcern {
  id: number;
  domain_id: number;
  application_id?: number;
  euc_id?: number;
  endpoint_id?: number;
  data_element_id?: number;
  title: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Metrics {
  domain_id?: number;
  domains_count: number;
  data_elements_count: number;
  applications_count: number;
  eucs_count: number;
  endpoints_count: number;
  data_quality_rules_count: number;
  data_quality_exceptions_count: number;
  data_concerns_count: number;
  attestation_count?: number;
}

export interface LineageNode {
  id: string;
  type: string;
  label: string;
  data: Record<string, unknown>;
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: Record<string, unknown>;
}

export interface LineageResponse {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

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

  getDataElements(domainId: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<DataElement[]> {
    let params = new HttpParams().set('domain_id', domainId);
    if (scope !== 'owned') params = params.set('scope', scope);
    return this.http.get<DataElement[]>(`${API}/data-elements`, { params });
  }

  getDataElementLineage(dataElementId: number): Observable<LineageResponse> {
    return this.http.get<LineageResponse>(`${API}/data-elements/${dataElementId}/lineage`);
  }

  getApplications(domainId: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<Application[]> {
    let params = new HttpParams().set('domain_id', domainId);
    if (scope !== 'owned') params = params.set('scope', scope);
    return this.http.get<Application[]>(`${API}/applications`, { params });
  }

  getEucs(domainId: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<EUC[]> {
    let params = new HttpParams().set('domain_id', domainId);
    if (scope !== 'owned') params = params.set('scope', scope);
    return this.http.get<EUC[]>(`${API}/eucs`, { params });
  }

  getEndpoints(domainId?: number, applicationId?: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<Endpoint[]> {
    let params = new HttpParams();
    if (domainId != null) {
      params = params.set('domain_id', domainId);
      if (scope !== 'owned') params = params.set('scope', scope);
    }
    if (applicationId != null) params = params.set('application_id', applicationId);
    return this.http.get<Endpoint[]>(`${API}/endpoints`, { params });
  }

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

  getDataConcerns(domainId: number, filters?: { application_id?: number; euc_id?: number; endpoint_id?: number; data_element_id?: number }): Observable<DataConcern[]> {
    let params = new HttpParams().set('domain_id', domainId);
    if (filters?.application_id != null) params = params.set('application_id', filters.application_id);
    if (filters?.euc_id != null) params = params.set('euc_id', filters.euc_id);
    if (filters?.endpoint_id != null) params = params.set('endpoint_id', filters.endpoint_id);
    if (filters?.data_element_id != null) params = params.set('data_element_id', filters.data_element_id);
    return this.http.get<DataConcern[]>(`${API}/data-concerns`, { params });
  }

  getMetrics(domainId?: number): Observable<Metrics> {
    const params = domainId != null ? new HttpParams().set('domain_id', domainId) : undefined;
    return this.http.get<Metrics>(`${API}/metrics`, { params });
  }

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
