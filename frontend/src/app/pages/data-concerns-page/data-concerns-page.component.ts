import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { selectDataConcerns, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { DataConcern } from '../../core/api.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';

@Component({
  selector: 'app-data-concerns-page',
  templateUrl: './data-concerns-page.component.html',
  styleUrls: ['./data-concerns-page.component.css'],
})
export class DataConcernsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  concerns: DataConcern[] = [];
  loading = false;
  modalOpen = false;
  modalRows: DetailRow[] = [];
  modalTitle = '';

  constructor(private store: Store) {}

  ngOnInit(): void {
    combineLatest([
      this.store.select(selectCurrentDomainId),
      this.store.select(selectDataConcerns),
      this.store.select(selectLoading('dataConcerns')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([domainId, list, loading]) => {
        this.concerns = list;
        this.loading = loading;
        if (domainId != null) this.store.dispatch(AppActions.loadDataConcerns({ domainId }));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDetail(item: DataConcern): void {
    this.modalTitle = item.title;
    this.modalRows = [
      { label: 'ID', value: item.id },
      { label: 'Title', value: item.title },
      { label: 'Status', value: item.status },
      { label: 'Description', value: item.description },
    ];
    this.modalOpen = true;
  }
}
