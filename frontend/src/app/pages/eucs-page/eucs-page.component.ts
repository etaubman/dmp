import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { selectEucs, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { EUC } from '../../core/api.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';

@Component({
  selector: 'app-eucs-page',
  templateUrl: './eucs-page.component.html',
  styleUrls: ['./eucs-page.component.css'],
})
export class EucsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  eucs: EUC[] = [];
  loading = false;
  modalOpen = false;
  modalRows: DetailRow[] = [];
  modalTitle = '';

  constructor(private store: Store) {}

  ngOnInit(): void {
    combineLatest([
      this.store.select(selectCurrentDomainId),
      this.store.select(selectEucs),
      this.store.select(selectLoading('eucs')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([domainId, list, loading]) => {
        this.eucs = list;
        this.loading = loading;
        if (domainId != null) this.store.dispatch(AppActions.loadEucs({ domainId }));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDetail(item: EUC): void {
    this.modalTitle = item.name;
    this.modalRows = [
      { label: 'ID', value: item.id },
      { label: 'Name', value: item.name },
      { label: 'Type', value: item.euc_type },
      { label: 'Description', value: item.description },
    ];
    this.modalOpen = true;
  }
}
