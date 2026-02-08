import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Domain, DomainTreeNode, DomainCreate, DomainUpdate } from './models';

const API = environment.apiUrl + '/api';

@Injectable({ providedIn: 'root' })
export class DomainsApiService {
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
}
