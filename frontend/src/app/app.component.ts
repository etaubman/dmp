import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '../environments/environment';
import * as AppActions from './store/app.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend-app';

  constructor(private store: Store) {}

  ngOnInit(): void {
    if (environment.devAlwaysLoggedIn) {
      this.store.dispatch(AppActions.checkAuth());
    }
  }
}
