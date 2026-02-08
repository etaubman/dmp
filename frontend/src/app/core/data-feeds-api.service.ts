import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { buildDomainScopeParams, type DomainScope } from './http-params';
import type { DataFeed, DataFeedDetail } from './models';

const API = environment.apiUrl + '/api';

@Injectable({ providedIn: 'root' })
export class DataFeedsApiService {
  constructor(private http: HttpClient) {}

  getDataFeeds(domainId: number, scope: DomainScope = 'owned'): Observable<DataFeed[]> {
    const params = buildDomainScopeParams(domainId, scope);
    return this.http.get<DataFeed[]>(`${API}/data-feeds`, { params });
  }

  getDataFeed(id: number): Observable<DataFeedDetail> {
    return this.http.get<DataFeedDetail>(`${API}/data-feeds/${id}`);
  }
}
