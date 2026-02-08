/**
 * Login page: email/password form; dispatches loginRequest; redirects to / when user becomes set.
 *
 * Shown at /login (no authGuard). On init, if authUser$ emits a user (e.g. already logged in
 * or after successful login), navigates to /. authError$ is bound in template for error message.
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import * as AppActions from '../../store/app.actions';
import { selectAuthError, selectAuthUser } from '../../store/app.selectors';
import type { AuthUser } from '../../core/models';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent implements OnInit {
  email = '';
  password = '';
  authError$!: Observable<string | null>;
  authUser$!: Observable<AuthUser | null>;

  constructor(
    private store: Store,
    private router: Router,
  ) {
    this.authError$ = this.store.select(selectAuthError);
    this.authUser$ = this.store.select(selectAuthUser);
  }

  /** When user becomes non-null (e.g. after login success), redirect to home. */
  ngOnInit(): void {
    this.authUser$.pipe(filter((u) => u != null), take(1)).subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  onSubmit(): void {
    this.store.dispatch(
      AppActions.loginRequest({
        credentials: { email: this.email.trim(), password: this.password },
      }),
    );
  }
}
