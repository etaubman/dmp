/**
 * Admin Domain Management page: loads domain tree, flattens for list view with search, and
 * supports add/edit/delete via store actions (createDomainRequest, updateDomainRequest,
 * deleteDomainRequest). Errors shown from adminDomainsError.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import {
  selectDomainsTree,
  selectAdminDomainsError,
  selectLoading,
} from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import type { DomainTreeNode } from '../../core/api.service';

/** Flattened node for list display (id, name, description, parent_id, level). */
export interface FlatDomainNode {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  level: number;
}

@Component({
  selector: 'app-admin-domains-page',
  templateUrl: './admin-domains-page.component.html',
  styleUrls: ['./admin-domains-page.component.css'],
})
export class AdminDomainsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  tree: DomainTreeNode[] | null = null;
  flatList: FlatDomainNode[] = [];
  error: string | null = null;
  loading = false;
  showAddForm = false;
  editingId: number | null = null;
  formName = '';
  formDescription = '';
  formParentId: number | null = null;
  formOwner = '';
  formSponsor = '';
  formManager = '';
  searchFilter = '';

  constructor(private store: Store) {}

  /** Domains filtered by search (name and description, case-insensitive). */
  get filteredList(): FlatDomainNode[] {
    const q = this.searchFilter?.trim().toLowerCase();
    if (!q) return this.flatList;
    return this.flatList.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        (n.description != null && n.description.toLowerCase().includes(q)),
    );
  }

  ngOnInit(): void {
    this.store.dispatch(AppActions.loadDomainsTree());
    combineLatest([
      this.store.select(selectDomainsTree),
      this.store.select(selectAdminDomainsError),
      this.store.select(selectLoading('adminDomainsTree')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([t, err, loading]) => {
        this.tree = t;
        this.flatList = t ? this.flattenTree(t) : [];
        this.error = err;
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  flattenTree(nodes: DomainTreeNode[], level = 0): FlatDomainNode[] {
    let out: FlatDomainNode[] = [];
    for (const n of nodes) {
      out.push({
        id: n.id,
        name: n.name,
        description: n.description,
        parent_id: n.parent_id,
        level: n.level,
      });
      if (n.children?.length) {
        out = out.concat(this.flattenTree(n.children, level + 1));
      }
    }
    return out;
  }

  /** Options for parent dropdown: "None (L0)" + nodes with level < 3. Exclude node being edited to avoid self-parent. */
  get parentOptions(): { id: number | null; label: string }[] {
    return this.tree ? this.buildParentOptions(this.tree) : [];
  }

  private buildParentOptions(nodes: DomainTreeNode[], prefix = ''): { id: number | null; label: string }[] {
    const opts: { id: number | null; label: string }[] = [];
    if (!prefix) opts.push({ id: null, label: 'None (L0 root)' });
    for (const n of nodes) {
      if (this.editingId != null && n.id === this.editingId) continue;
      if (n.level < 3) {
        opts.push({ id: n.id, label: prefix + n.name });
        if (n.children?.length) {
          opts.push(...this.buildParentOptions(n.children, prefix + '— '));
        }
      }
    }
    return opts;
  }

  openAdd(): void {
    this.store.dispatch(AppActions.setAdminDomainsError({ error: null }));
    this.showAddForm = true;
    this.editingId = null;
    this.formName = '';
    this.formDescription = '';
    this.formParentId = null;
    this.formOwner = '';
    this.formSponsor = '';
    this.formManager = '';
  }

  openEdit(node: FlatDomainNode): void {
    this.store.dispatch(AppActions.setAdminDomainsError({ error: null }));
    this.showAddForm = false;
    this.editingId = node.id;
    this.formName = node.name;
    this.formDescription = node.description ?? '';
    this.formParentId = node.parent_id ?? null;
    this.formOwner = '';
    this.formSponsor = '';
    this.formManager = '';
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingId = null;
  }

  submitForm(): void {
    const name = this.formName?.trim();
    if (!name) {
      this.store.dispatch(AppActions.setAdminDomainsError({ error: 'Name is required.' }));
      return;
    }
    if (this.editingId != null) {
      this.store.dispatch(
        AppActions.updateDomainRequest({
          id: this.editingId,
          body: {
            name,
            description: this.formDescription?.trim() || undefined,
            parent_id: this.formParentId,
          },
        }),
      );
      this.cancelForm();
    } else {
      this.store.dispatch(
        AppActions.createDomainRequest({
          body: {
            name,
            description: this.formDescription?.trim() || undefined,
            parent_id: this.formParentId ?? undefined,
          },
        }),
      );
      this.showAddForm = false;
      this.formName = '';
      this.formDescription = '';
      this.formParentId = null;
      this.formOwner = '';
      this.formSponsor = '';
      this.formManager = '';
    }
  }

  deleteNode(id: number): void {
    if (!confirm('Delete this domain? This is only allowed if it has no children and no related data.')) return;
    this.store.dispatch(AppActions.setAdminDomainsError({ error: null }));
    this.store.dispatch(AppActions.deleteDomainRequest({ id }));
  }

  clearError(): void {
    this.store.dispatch(AppActions.setAdminDomainsError({ error: null }));
  }
}
