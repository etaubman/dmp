import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { AuthUser, LoginCredentials, TokenResponse } from './models';

const API = environment.apiUrl + '/api';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${API}/auth/login`, credentials);
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API}/auth/logout`, {});
  }

  getMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${API}/auth/me`);
  }
}
