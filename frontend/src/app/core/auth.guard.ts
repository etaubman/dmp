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
