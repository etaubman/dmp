/**
 * Sidebar domain dropdown: loads domains from API, syncs selection with NgRx store and localStorage.
 *
 * - On init: loads domains via ApiService, syncs store currentDomainId to local state, and
 *   restores selection from localStorage (dmp_selected_domain_id) when no domain is selected.
 * - On select: dispatches setCurrentDomainId and persists id to localStorage so the choice
 *   survives refresh. Other components and effects use the store's currentDomainId for
 *   domain-scoped data.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { selectCurrentDomainId } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { ApiService, Domain } from '../../core/api.service';

const DOMAIN_STORAGE_KEY = 'dmp_selected_domain_id';

@Component({
  selector: 'app-domain-selector',
  templateUrl: './domain-selector.component.html',
  styleUrls: ['./domain-selector.component.css'],
})
export class DomainSelectorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  domains: Domain[] = [];
  loading = false;
  error: string | null = null;
  currentDomainId: number | null = null;

  constructor(private store: Store, private api: ApiService) {}

  ngOnInit(): void {
    this.loadDomains();
    this.store.select(selectCurrentDomainId).pipe(takeUntil(this.destroy$)).subscribe((id) => (this.currentDomainId = id));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Fetches domains, updates store and local list; on success restores selection from localStorage if none set. */
  loadDomains(): void {
    this.loading = true;
    this.error = null;
    this.api
      .getDomains()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => {
          this.domains = list;
          this.loading = false;
          this.store.dispatch(AppActions.setDomains({ domains: list }));
          // Restore saved selection if we now have domains and none selected
          if (this.currentDomainId == null && this.domains.length > 0) {
            const saved = localStorage.getItem(DOMAIN_STORAGE_KEY);
            if (saved != null) {
              const id = Number(saved);
              if (Number.isInteger(id) && this.domains.some((d) => d.id === id)) {
                this.store.dispatch(AppActions.setCurrentDomainId({ id }));
              }
            }
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'Failed to load domains';
          this.domains = [];
          this.store.dispatch(AppActions.setDomains({ domains: [] }));
        },
      });
  }

  refreshDomains(): void {
    this.loadDomains();
  }

  /** Updates store and localStorage with the selected domain id (or null for "Select domain"). */
  selectDomain(value: number | string | null): void {
    const id = value === null || value === undefined ? null : Number(value);
    const toStore = id === null || !Number.isInteger(id) ? null : id;
    this.store.dispatch(AppActions.setCurrentDomainId({ id: toStore }));
    if (toStore != null) {
      localStorage.setItem(DOMAIN_STORAGE_KEY, String(toStore));
    } else {
      localStorage.removeItem(DOMAIN_STORAGE_KEY);
    }
  }
}
