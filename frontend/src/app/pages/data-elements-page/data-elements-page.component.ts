import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { selectDataElements, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { DataElement } from '../../core/api.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';

@Component({
  selector: 'app-data-elements-page',
  templateUrl: './data-elements-page.component.html',
  styleUrls: ['./data-elements-page.component.css'],
})
export class DataElementsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  dataElements: DataElement[] = [];
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
        if (domainId != null) this.store.dispatch(AppActions.loadDataElements({ domainId }));
      });
    combineLatest([
      this.store.select(selectDataElements),
      this.store.select(selectLoading('dataElements')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([list, loading]) => {
        this.dataElements = list;
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDetail(item: DataElement): void {
    this.modalTitle = item.name;
    this.modalRows = [
      { label: 'ID', value: item.id },
      { label: 'Name', value: item.name },
      { label: 'Description', value: item.description },
      { label: 'Element type', value: item.element_type },
    ];
    this.modalOpen = true;
  }
}
