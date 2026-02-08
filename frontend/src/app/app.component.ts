import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '../environments/environment';
import * as AppActions from './store/app.actions';

/**
 * Root application component.
 *
 * Renders only <router-outlet>; actual UI is in LayoutComponent and page components.
 * In development (when environment.devAlwaysLoggedIn is true), dispatches checkAuth
 * so the app can simulate being logged in without going through login.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend-app';

  constructor(private store: Store) {}

  ngOnInit(): void {
    // Dev convenience: auto "log in" so protected routes work without real auth
    if (environment.devAlwaysLoggedIn) {
      this.store.dispatch(AppActions.checkAuth());
    }
  }
}
