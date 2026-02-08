/**
 * Main app shell shown after login (wrapped by authGuard).
 *
 * Provides: sidebar with nav links and domain selector, header with governance dropdowns
 * and user menu (logout), main content area with router-outlet, and the global data concern
 * detail modal. User menu closes on document click via HostListener.
 */
import { Component, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DataConcernModalService } from '../core/data-concern-modal.service';
import { selectAuthUser } from '../store/app.selectors';
import * as AppActions from '../store/app.actions';
import type { AuthUser } from '../core/models';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  authUser$: Observable<AuthUser | null>;
  userMenuOpen = false;
  avatarUrl = '/profile.png';

  constructor(
    public concernModal: DataConcernModalService,
    private store: Store,
  ) {
    this.authUser$ = this.store.select(selectAuthUser);
  }

  /** Close user dropdown when clicking outside (avoids needing to track panel ref). */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.userMenuOpen = false;
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout(): void {
    this.userMenuOpen = false;
    this.store.dispatch(AppActions.clearAuth());
  }

  /** Sync modal close from template (e.g. overlay click) with DataConcernModalService. */
  onConcernModalOpenChange(open: boolean): void {
    if (!open) this.concernModal.close();
  }
}
