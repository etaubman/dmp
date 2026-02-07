import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Subject, takeUntil } from 'rxjs';
import { selectDomains, selectCurrentDomainId } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { Domain } from '../../core/api.service';

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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectDomain(id: number | null): void {
    this.store.dispatch(AppActions.setCurrentDomainId({ id: id ?? null }));
  }
}
