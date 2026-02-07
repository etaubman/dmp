import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { selectDataConcerns, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { DataConcern } from '../../core/api.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';
import { MetricItem } from '../../shared/concept-metrics/concept-metrics.component';

@Component({
  selector: 'app-data-concerns-page',
  templateUrl: './data-concerns-page.component.html',
  styleUrls: ['./data-concerns-page.component.css'],
})
export class DataConcernsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  concerns: DataConcern[] = [];
  loading = false;
  selectedItem: DataConcern | null = null;
  panelRows: DetailRow[] = [];
  panelTitle = '';
  metrics: MetricItem[] = [];
  columnDefs: ColDef<DataConcern>[] = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'description', headerName: 'Description', flex: 1 },
  ];
  defaultColDef: ColDef = { sortable: true, filter: true };

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store
      .select(selectCurrentDomainId)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((domainId) => {
        if (domainId != null) this.store.dispatch(AppActions.loadDataConcerns({ domainId }));
      });
    combineLatest([
      this.store.select(selectDataConcerns),
      this.store.select(selectLoading('dataConcerns')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([list, loading]) => {
        this.concerns = list;
        this.loading = loading;
        this.metrics = [
          { label: 'Total', value: list.length },
          { label: 'Open', value: list.filter((c) => c.status === 'open').length },
          { label: 'With description', value: list.filter((c) => c.description?.trim()).length },
        ];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRowClicked(item: DataConcern | undefined): void {
    if (!item) return;
    this.selectedItem = item;
    this.panelTitle = item.title;
    this.panelRows = [
      { label: 'ID', value: item.id },
      { label: 'Title', value: item.title },
      { label: 'Status', value: item.status },
      { label: 'Description', value: item.description },
    ];
  }

  closePanel(): void {
    this.selectedItem = null;
  }

  getRowId = (params: { data: DataConcern }) => String(params.data.id);
}
