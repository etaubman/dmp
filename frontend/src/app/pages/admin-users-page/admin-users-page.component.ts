/**
 * Admin User Management page: loads users, displays list with search (email/name/role), and
 * supports add/edit/delete via createUserRequest, updateUserRequest, deleteUserRequest.
 * Errors shown from adminUsersError.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import {
  selectAdminUsers,
  selectAdminUsersError,
  selectLoading,
} from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import type { User } from '../../core/api.service';

@Component({
  selector: 'app-admin-users-page',
  templateUrl: './admin-users-page.component.html',
  styleUrls: ['./admin-users-page.component.css'],
})
export class AdminUsersPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  users: User[] = [];
  error: string | null = null;
  loading = false;
  showAddForm = false;
  editingId: number | null = null;
  formEmail = '';
  formName = '';
  formRole = '';
  searchFilter = '';

  constructor(private store: Store) {}

  /** Users filtered by search (email, name, role, case-insensitive). */
  get filteredList(): User[] {
    const q = this.searchFilter?.trim().toLowerCase();
    if (!q) return this.users;
    return this.users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.name != null && u.name.toLowerCase().includes(q)) ||
        (u.role != null && u.role.toLowerCase().includes(q)),
    );
  }

  ngOnInit(): void {
    this.store.dispatch(AppActions.loadUsers());
    combineLatest([
      this.store.select(selectAdminUsers),
      this.store.select(selectAdminUsersError),
      this.store.select(selectLoading('adminUsers')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([users, err, loading]) => {
        this.users = users;
        this.error = err;
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAdd(): void {
    this.store.dispatch(AppActions.setAdminUsersError({ error: null }));
    this.showAddForm = true;
    this.editingId = null;
    this.formEmail = '';
    this.formName = '';
    this.formRole = '';
  }

  openEdit(user: User): void {
    this.store.dispatch(AppActions.setAdminUsersError({ error: null }));
    this.showAddForm = false;
    this.editingId = user.id;
    this.formEmail = user.email;
    this.formName = user.name ?? '';
    this.formRole = user.role ?? '';
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingId = null;
  }

  submitForm(): void {
    const email = this.formEmail?.trim();
    if (!email) {
      this.store.dispatch(AppActions.setAdminUsersError({ error: 'Email is required.' }));
      return;
    }
    if (this.editingId != null) {
      this.store.dispatch(
        AppActions.updateUserRequest({
          id: this.editingId,
          body: {
            email,
            name: this.formName?.trim() || undefined,
            role: this.formRole?.trim() || undefined,
          },
        }),
      );
      this.cancelForm();
    } else {
      this.store.dispatch(
        AppActions.createUserRequest({
          body: {
            email,
            name: this.formName?.trim() || undefined,
            role: this.formRole?.trim() || undefined,
          },
        }),
      );
      this.showAddForm = false;
      this.formEmail = '';
      this.formName = '';
      this.formRole = '';
    }
  }

  deleteUser(user: User): void {
    if (!confirm(`Delete user "${user.email}"? This cannot be undone.`)) return;
    this.store.dispatch(AppActions.setAdminUsersError({ error: null }));
    this.store.dispatch(AppActions.deleteUserRequest({ id: user.id }));
  }

  clearError(): void {
    this.store.dispatch(AppActions.setAdminUsersError({ error: null }));
  }
}
