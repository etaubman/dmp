import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API = environment.apiUrl + '/api';

export interface BulkUploadResult {
  created: number;
  updated: number;
  errors: { row: number; error: string }[];
}

@Injectable({ providedIn: 'root' })
export class BulkApiService {
  constructor(private http: HttpClient) {}

  uploadBulk(entityType: string, file: File): Observable<BulkUploadResult> {
    const form = new FormData();
    form.append('entity_type', entityType);
    form.append('file', file);
    return this.http.post<BulkUploadResult>(`${API}/bulk/upload`, form);
  }

  downloadBulk(entityType: string, domainId?: number): string {
    let url = `${API}/bulk/download?entity_type=${encodeURIComponent(entityType)}`;
    if (domainId != null) url += `&domain_id=${domainId}`;
    return url;
  }
}
