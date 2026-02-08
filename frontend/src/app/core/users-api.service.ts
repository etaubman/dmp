import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { User, UserCreate, UserUpdate } from './models';

const API = environment.apiUrl + '/api';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  constructor(private http: HttpClient) {}

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
}
