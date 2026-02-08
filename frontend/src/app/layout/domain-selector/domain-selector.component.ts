/**
 * Sidebar domain dropdown: loads domain tree from API, syncs selection with NgRx store and localStorage.
 *
 * - On init: loads domain tree via getDomainsTree(), flattens to list for store, syncs store
 *   currentDomainId to local state, and restores selection from localStorage when none set.
 * - Displays a hierarchical dropdown (L0→L1→L2→L3) with indentation and level badges.
 */
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { selectCurrentDomainId } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { ApiService } from '../../core/api.service';
import type { Domain, DomainTreeNode } from '../../core/models';

const DOMAIN_STORAGE_KEY = 'dmp_selected_domain_id';

function flattenTree(nodes: DomainTreeNode[]): Domain[] {
  const out: Domain[] = [];
  function visit(n: DomainTreeNode) {
    out.push({ id: n.id, name: n.name, description: n.description, parent_id: n.parent_id });
    (n.children || []).forEach(visit);
  }
  nodes.forEach(visit);
  return out;
}

@Component({
  selector: 'app-domain-selector',
  templateUrl: './domain-selector.component.html',
  styleUrls: ['./domain-selector.component.css'],
})
export class DomainSelectorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  domainsTree: DomainTreeNode[] = [];
  domains: Domain[] = [];
  loading = false;
  error: string | null = null;
  currentDomainId: number | null = null;
  dropdownOpen = false;

  constructor(private store: Store, private api: ApiService) {}

  ngOnInit(): void {
    this.loadDomains();
    this.store.select(selectCurrentDomainId).pipe(takeUntil(this.destroy$)).subscribe((id) => (this.currentDomainId = id));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const el = (event.target as HTMLElement).closest('.domain-selector');
    if (!el) this.dropdownOpen = false;
  }

  get currentDomainName(): string {
    if (this.currentDomainId == null) return 'Select domain';
    const d = this.domains.find((x) => x.id === this.currentDomainId);
    return d?.name ?? 'Select domain';
  }

  /** Fetches domain tree, flattens for store; on success restores selection from localStorage if none set. */
  loadDomains(): void {
    this.loading = true;
    this.error = null;
    this.api
      .getDomainsTree()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tree) => {
          this.domainsTree = tree ?? [];
          this.domains = flattenTree(this.domainsTree);
          this.loading = false;
          this.store.dispatch(AppActions.setDomains({ domains: this.domains }));
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
          this.domainsTree = [];
          this.domains = [];
          this.store.dispatch(AppActions.setDomains({ domains: [] }));
        },
      });
  }

  refreshDomains(): void {
    this.loadDomains();
  }

  toggleDropdown(): void {
    if (this.domains.length === 0 && !this.loading && !this.error) return;
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectDomain(id: number | null): void {
    const toStore = id === null || !Number.isInteger(id) ? null : id;
    this.store.dispatch(AppActions.setCurrentDomainId({ id: toStore }));
    if (toStore != null) {
      localStorage.setItem(DOMAIN_STORAGE_KEY, String(toStore));
    } else {
      localStorage.removeItem(DOMAIN_STORAGE_KEY);
    }
    this.dropdownOpen = false;
  }
}
