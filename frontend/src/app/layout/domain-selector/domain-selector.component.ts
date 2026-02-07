import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Subject, takeUntil, take, withLatestFrom, filter } from 'rxjs';
import { selectDomains, selectCurrentDomainId } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { Domain } from '../../core/api.service';

const DOMAIN_STORAGE_KEY = 'dmp_selected_domain_id';

@Component({
  selector: 'app-domain-selector',
  templateUrl: './domain-selector.component.html',
  styleUrls: ['./domain-selector.component.css'],
})
export class DomainSelectorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  domains$!: Observable<Domain[]>;
  currentDomainId: number | null = null;

  constructor(private store: Store) {
    this.domains$ = this.store.select(selectDomains);
  }

  ngOnInit(): void {
    this.store.dispatch(AppActions.loadDomains());
    this.store.select(selectCurrentDomainId).pipe(takeUntil(this.destroy$)).subscribe((id) => (this.currentDomainId = id));
    // Restore persisted domain once when domains have loaded and we don't have a selection yet
    this.store
      .select(selectDomains)
      .pipe(
        filter((domains) => domains.length > 0),
        withLatestFrom(this.store.select(selectCurrentDomainId)),
        filter(([, currentId]) => currentId == null),
        take(1),
      )
      .subscribe(([domains]) => {
        const saved = localStorage.getItem(DOMAIN_STORAGE_KEY);
        if (saved != null) {
          const id = Number(saved);
          if (Number.isInteger(id) && domains.some((d) => d.id === id)) {
            this.store.dispatch(AppActions.setCurrentDomainId({ id }));
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
