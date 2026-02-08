import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Store } from '@ngrx/store';
import * as AppActions from '../store/app.actions';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private store: Store,
    private router: Router,
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    const token = this.auth.getToken();
    let reqWithAuth = req;
    if (token) {
      reqWithAuth = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(reqWithAuth).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !environment.devAlwaysLoggedIn) {
          this.auth.clearToken();
          this.store.dispatch(AppActions.clearAuth());
          this.router.navigate(['/login']);
        }
        return throwError(() => err);
      }),
    );
  }
}
