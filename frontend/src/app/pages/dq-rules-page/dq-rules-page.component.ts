import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { selectDataQualityRules, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { DataQualityRule } from '../../core/api.service';
import { KebabActionsCellComponent } from '../../shared/kebab-actions-cell/kebab-actions-cell.component';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';
import { MetricItem } from '../../shared/concept-metrics/concept-metrics.component';
import { mockSparklineFromValue, mockChangeFromValue } from '../../shared/concept-metrics/mock-kpi';

@Component({
  selector: 'app-dq-rules-page',
  templateUrl: './dq-rules-page.component.html',
  styleUrls: ['./dq-rules-page.component.css'],
})
export class DqRulesPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  rules: DataQualityRule[] = [];
  loading = false;
  selectedItem: DataQualityRule | null = null;
  panelRows: DetailRow[] = [];
  panelTitle = '';
  metrics: MetricItem[] = [];
  columnDefs: ColDef<DataQualityRule>[] = [
    {
      headerName: '',
      width: 56,
      sortable: false,
      filter: false,
      cellRenderer: KebabActionsCellComponent,
    },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'rule_type', headerName: 'Type', width: 120 },
    { field: 'description', headerName: 'Description', flex: 1 },
  ];
  defaultColDef: ColDef = { sortable: true, filter: true };

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
        const total = list.length;
        const validity = list.filter((r) => r.rule_type === 'validity').length;
        const timeliness = list.filter((r) => r.rule_type === 'timeliness').length;
        const tCh = mockChangeFromValue(total, 0);
        const vCh = mockChangeFromValue(validity, 1);
        const tiCh = mockChangeFromValue(timeliness, 2);
        this.metrics = [
          { label: 'Total', value: total, sparklineData: mockSparklineFromValue(total, 0), change: tCh.change, changePercent: tCh.changePercent },
          { label: 'Validity', value: validity, sparklineData: mockSparklineFromValue(validity, 1), change: vCh.change, changePercent: vCh.changePercent },
          { label: 'Timeliness', value: timeliness, sparklineData: mockSparklineFromValue(timeliness, 2), change: tiCh.change, changePercent: tiCh.changePercent },
        ];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRowClicked(item: DataQualityRule | undefined): void {
    if (!item) return;
    this.selectedItem = item;
    this.panelTitle = item.name;
    this.panelRows = [
      { label: 'ID', value: item.id },
      { label: 'Name', value: item.name },
      { label: 'Rule type', value: item.rule_type },
      { label: 'Description', value: item.description },
    ];
  }

  closePanel(): void {
    this.selectedItem = null;
  }

  getRowId = (params: { data: DataQualityRule }) => String(params.data.id);
}
