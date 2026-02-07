import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { selectDataQualityExceptions, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { DataQualityException } from '../../core/api.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';

@Component({
  selector: 'app-dq-exceptions-page',
  templateUrl: './dq-exceptions-page.component.html',
  styleUrls: ['./dq-exceptions-page.component.css'],
})
export class DqExceptionsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  exceptions: DataQualityException[] = [];
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
        if (domainId != null) this.store.dispatch(AppActions.loadDataQualityExceptions({ domainId }));
      });
    combineLatest([
      this.store.select(selectDataQualityExceptions),
      this.store.select(selectLoading('dataQualityExceptions')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([list, loading]) => {
        this.exceptions = list;
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDetail(item: DataQualityException): void {
    this.modalTitle = `Exception #${item.id}`;
    this.modalRows = [
      { label: 'ID', value: item.id },
      { label: 'Rule ID', value: item.rule_id },
      { label: 'Status', value: item.status },
      { label: 'Description', value: item.description },
      { label: 'Identified at', value: item.identified_at },
    ];
    this.modalOpen = true;
  }
}
