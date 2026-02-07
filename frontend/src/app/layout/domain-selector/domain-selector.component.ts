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
