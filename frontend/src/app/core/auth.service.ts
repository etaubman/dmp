/**
 * Holds the current JWT in memory for the HTTP interceptor to attach to requests.
 *
 * - setToken(token): called by login effect after successful login.
 * - getToken(): used by AuthInterceptor to add Authorization header.
 * - clearToken(): called on logout or on 401 response (interceptor).
 *
 * Token is not persisted to localStorage in this implementation; refresh requires re-login
 * unless devAlwaysLoggedIn is used (checkAuth then uses getMe with existing token).
 */
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token: string | null = null;

  setToken(token: string): void {
    this._token = token;
  }

  getToken(): string | null {
    return this._token;
  }

  clearToken(): void {
    this._token = null;
  }
}
