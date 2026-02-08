import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { selectDataQualityExceptions, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { DataQualityException } from '../../core/api.service';
import { KebabActionsCellComponent } from '../../shared/kebab-actions-cell/kebab-actions-cell.component';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';
import { MetricItem } from '../../shared/concept-metrics/concept-metrics.component';
import { mockSparklineFromValue, mockChangeFromValue } from '../../shared/concept-metrics/mock-kpi';

@Component({
  selector: 'app-dq-exceptions-page',
  templateUrl: './dq-exceptions-page.component.html',
  styleUrls: ['./dq-exceptions-page.component.css'],
})
export class DqExceptionsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  exceptions: DataQualityException[] = [];
  loading = false;
  selectedItem: DataQualityException | null = null;
  panelRows: DetailRow[] = [];
  panelTitle = '';
  metrics: MetricItem[] = [];
  columnDefs: ColDef<DataQualityException>[] = [
    {
      headerName: '',
      width: 56,
      sortable: false,
      filter: false,
      headerClass: 'ag-header-cell-centered',
      cellClass: 'ag-cell-centered',
      cellRenderer: KebabActionsCellComponent,
    },
    { field: 'rule_id', headerName: 'Rule ID', width: 100 },
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
        const total = list.length;
        const open = list.filter((e) => e.status === 'open').length;
        const closed = list.filter((e) => e.status === 'closed').length;
        const tCh = mockChangeFromValue(total, 0);
        const oCh = mockChangeFromValue(open, 1);
        const cCh = mockChangeFromValue(closed, 2);
        this.metrics = [
          { label: 'Total', value: total, sparklineData: mockSparklineFromValue(total, 0), change: tCh.change, changePercent: tCh.changePercent },
          { label: 'Open', value: open, sparklineData: mockSparklineFromValue(open, 1), change: oCh.change, changePercent: oCh.changePercent },
          { label: 'Closed', value: closed, sparklineData: mockSparklineFromValue(closed, 2), change: cCh.change, changePercent: cCh.changePercent },
        ];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRowClicked(item: DataQualityException | undefined): void {
    if (!item) return;
    this.selectedItem = item;
    this.panelTitle = `Exception #${item.id}`;
    this.panelRows = [
      { label: 'ID', value: item.id },
      { label: 'Rule ID', value: item.rule_id },
      { label: 'Status', value: item.status },
      { label: 'Description', value: item.description },
      { label: 'Identified at', value: item.identified_at },
    ];
  }

  closePanel(): void {
    this.selectedItem = null;
  }

  getRowId = (params: { data: DataQualityException }) => String(params.data.id);
}
