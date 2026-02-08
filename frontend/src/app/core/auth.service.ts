/**
 * Holds the current JWT so the HTTP interceptor can attach it.
 * Token is set on login and cleared on logout.
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
