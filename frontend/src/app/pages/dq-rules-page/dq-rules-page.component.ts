import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { selectDataQualityRules, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { DataQualityRule } from '../../core/api.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';

@Component({
  selector: 'app-dq-rules-page',
  templateUrl: './dq-rules-page.component.html',
  styleUrls: ['./dq-rules-page.component.css'],
})
export class DqRulesPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  rules: DataQualityRule[] = [];
  loading = false;
  modalOpen = false;
  modalRows: DetailRow[] = [];
  modalTitle = '';

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store
      .select(selectCurrentDomainId)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((domainId) => {
        if (domainId != null) this.store.dispatch(AppActions.loadDataQualityRules({ domainId }));
      });
    combineLatest([
      this.store.select(selectDataQualityRules),
      this.store.select(selectLoading('dataQualityRules')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([list, loading]) => {
        this.rules = list;
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDetail(item: DataQualityRule): void {
    this.modalTitle = item.name;
    this.modalRows = [
      { label: 'ID', value: item.id },
      { label: 'Name', value: item.name },
      { label: 'Rule type', value: item.rule_type },
      { label: 'Description', value: item.description },
    ];
    this.modalOpen = true;
  }
}
