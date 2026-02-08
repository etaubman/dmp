/**
 * Route guard: allows activation only when the user is authenticated.
 *
 * Used on the root '' path (LayoutComponent and all its children). If not authenticated,
 * redirects to /login. When environment.devAlwaysLoggedIn is true, always allows access
 * (for local dev without real login).
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { selectIsAuthenticated } from '../store/app.selectors';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(Store);

  if (environment.devAlwaysLoggedIn) {
    return true;
  }

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map((authenticated) => {
      if (!authenticated) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    }),
  );
};
