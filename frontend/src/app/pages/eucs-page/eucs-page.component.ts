/**
 * EUCs (End User Computing) page: AG Grid of EUCs for the current domain (scope: owned/upstream/downstream),
 * concept metrics (total, EUC type, ITESS), and detail panel for selected row.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { selectEucs, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import type { DomainScope } from '../../store/app.actions';
import { EUC } from '../../core/api.service';
import { KebabActionsCellComponent } from '../../shared/kebab-actions-cell/kebab-actions-cell.component';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';
import { MetricItem } from '../../shared/concept-metrics/concept-metrics.component';
import { mockSparklineFromValue, mockChangeFromValue } from '../../shared/concept-metrics/mock-kpi';

@Component({
  selector: 'app-eucs-page',
  templateUrl: './eucs-page.component.html',
  styleUrls: ['./eucs-page.component.css'],
})
export class EucsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  eucs: EUC[] = [];
  loading = false;
  selectedItem: EUC | null = null;
  domainScope: DomainScope = 'owned';
  currentDomainId: number | null = null;
  searchTerm = '';
  panelRows: DetailRow[] = [];
  panelTitle = '';
  metrics: MetricItem[] = [];
  columnDefs: ColDef<EUC>[] = [
    {
      headerName: '',
      width: 56,
      sortable: false,
      filter: false,
      headerClass: 'ag-header-cell-centered',
      cellClass: 'ag-cell-centered',
      cellRenderer: KebabActionsCellComponent,
    },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'euc_type', headerName: 'Type', width: 100 },
    { field: 'description', headerName: 'Description', flex: 1 },
  ];
  defaultColDef: ColDef = { sortable: true, filter: true };

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store
      .select(selectCurrentDomainId)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((domainId) => {
        this.currentDomainId = domainId ?? null;
        if (domainId != null) this.store.dispatch(AppActions.loadEucs({ domainId, scope: this.domainScope }));
      });
    combineLatest([
      this.store.select(selectEucs),
      this.store.select(selectLoading('eucs')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([list, loading]) => {
        this.eucs = list;
        this.loading = loading;
        const total = list.length;
        const eucType = list.filter((e) => e.euc_type === 'euc').length;
        const itess = list.filter((e) => e.euc_type === 'itess').length;
        const tCh = mockChangeFromValue(total, 0);
        const eCh = mockChangeFromValue(eucType, 1);
        const iCh = mockChangeFromValue(itess, 2);
        this.metrics = [
          { label: 'Total', value: total, sparklineData: mockSparklineFromValue(total, 0), change: tCh.change, changePercent: tCh.changePercent },
          { label: 'EUC type', value: eucType, sparklineData: mockSparklineFromValue(eucType, 1), change: eCh.change, changePercent: eCh.changePercent },
          { label: 'ITESS', value: itess, sparklineData: mockSparklineFromValue(itess, 2), change: iCh.change, changePercent: iCh.changePercent },
        ];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRowClicked(item: EUC | undefined): void {
    if (!item) return;
    this.selectedItem = item;
    this.panelTitle = item.name;
    this.panelRows = [
      { label: 'ID', value: item.id },
      { label: 'Name', value: item.name },
      { label: 'Type', value: item.euc_type },
      { label: 'Description', value: item.description },
    ];
  }

  closePanel(): void {
    this.selectedItem = null;
  }

  getRowId = (params: { data: EUC }) => String(params.data.id);

  setDomainScope(scope: DomainScope): void {
    this.domainScope = scope;
    if (this.currentDomainId != null) {
      this.store.dispatch(AppActions.loadEucs({ domainId: this.currentDomainId, scope }));
    }
  }
}
