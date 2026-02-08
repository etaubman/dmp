/**
 * Data Concerns page: AG Grid of data concerns for the current domain, concept metrics
 * (total, open, with description), and detail panel for selected row.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { selectDataConcerns, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { DataConcern } from '../../core/api.service';
import { KebabActionsCellComponent } from '../../shared/kebab-actions-cell/kebab-actions-cell.component';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';
import { MetricItem } from '../../shared/concept-metrics/concept-metrics.component';
import { mockSparklineFromValue, mockChangeFromValue } from '../../shared/concept-metrics/mock-kpi';

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
    {
      headerName: '',
      width: 56,
      sortable: false,
      filter: false,
      headerClass: 'ag-header-cell-centered',
      cellClass: 'ag-cell-centered',
      cellRenderer: KebabActionsCellComponent,
    },
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
        const total = list.length;
        const open = list.filter((c) => c.status === 'open').length;
        const withDesc = list.filter((c) => c.description?.trim()).length;
        const tCh = mockChangeFromValue(total, 0);
        const oCh = mockChangeFromValue(open, 1);
        const wCh = mockChangeFromValue(withDesc, 2);
        this.metrics = [
          { label: 'Total', value: total, sparklineData: mockSparklineFromValue(total, 0), change: tCh.change, changePercent: tCh.changePercent },
          { label: 'Open', value: open, sparklineData: mockSparklineFromValue(open, 1), change: oCh.change, changePercent: oCh.changePercent },
          { label: 'With description', value: withDesc, sparklineData: mockSparklineFromValue(withDesc, 2), change: wCh.change, changePercent: wCh.changePercent },
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
