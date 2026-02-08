/**
 * Data Quality Rules page: AG Grid of DQ rules with instance count badge and health,
 * detail panel with instance cards (health on each card). Clicking an instance card opens the full-details modal.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { selectDataQualityRules, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { ApiService } from '../../core/api.service';
import type { DataQualityRule, DataQualityRuleInstance } from '../../core/api.service';
import { KebabActionsCellComponent } from '../../shared/kebab-actions-cell/kebab-actions-cell.component';
import { InstanceCountBadgeCellComponent } from './instance-count-badge-cell/instance-count-badge-cell.component';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';
import { MetricItem } from '../../shared/concept-metrics/concept-metrics.component';
import { mockSparklineFromValue, mockChangeFromValue } from '../../shared/concept-metrics/mock-kpi';

export type DqRuleRow = DataQualityRule & { instanceCount?: number; lastPassed?: boolean | null };

@Component({
  selector: 'app-dq-rules-page',
  templateUrl: './dq-rules-page.component.html',
  styleUrls: ['./dq-rules-page.component.css'],
})
export class DqRulesPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  rules: DataQualityRule[] = [];
  /** Rules merged with instance count and last run status for grid. */
  enrichedRules: DqRuleRow[] = [];
  loading = false;
  selectedItem: DataQualityRule | null = null;
  panelRows: DetailRow[] = [];
  panelTitle = '';
  metrics: MetricItem[] = [];
  modalOpen = false;
  panelInstances: DataQualityRuleInstance[] = [];
  panelInstancesLoading = false;
  /** When opening modal from an instance card, pass this so modal can show that instance's SQL. */
  selectedInstanceIdForModal: number | null = null;
  columnDefs: ColDef<DqRuleRow>[] = [
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
    { field: 'rule_type', headerName: 'Type', width: 110 },
    {
      headerName: 'Runs',
      width: 100,
      minWidth: 90,
      sortable: false,
      suppressSizeToFit: true,
      cellRenderer: InstanceCountBadgeCellComponent,
    },
    { field: 'exception_threshold_pct', headerName: 'Threshold %', width: 100 },
    {
      headerName: 'Flagged',
      width: 90,
      valueGetter: (p) => (p.data?.flagged_for_monitoring ? 'Yes' : '—'),
    },
    { field: 'description', headerName: 'Description', flex: 1 },
  ];
  defaultColDef: ColDef = { sortable: true, filter: true };

  constructor(private store: Store, private api: ApiService) {}

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
      this.store.select(selectCurrentDomainId),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([list, loading, domainId]) => {
        this.rules = list;
        this.loading = loading;
        this.enrichedRules = [...list];
        if (domainId != null && list.length > 0) {
          this.api.getRuleInstanceCounts(domainId).subscribe({
            next: (counts) => {
              const map = new Map(counts.map((c) => [c.rule_id, { instanceCount: c.instance_count, lastPassed: c.last_passed }]));
              this.enrichedRules = list.map((r) => ({
                ...r,
                instanceCount: map.get(r.id)?.instanceCount ?? 0,
                lastPassed: map.get(r.id)?.lastPassed ?? null,
              }));
            },
          });
        }
        const total = list.length;
        const validity = list.filter((r) => r.rule_type === 'validity').length;
        const timeliness = list.filter((r) => r.rule_type === 'timeliness').length;
        const accuracy = list.filter((r) => r.rule_type === 'accuracy').length;
        const tCh = mockChangeFromValue(total, 0);
        const vCh = mockChangeFromValue(validity, 1);
        const tiCh = mockChangeFromValue(timeliness, 2);
        const aCh = mockChangeFromValue(accuracy, 3);
        this.metrics = [
          { label: 'Total', value: total, sparklineData: mockSparklineFromValue(total, 0), change: tCh.change, changePercent: tCh.changePercent },
          { label: 'Validity', value: validity, sparklineData: mockSparklineFromValue(validity, 1), change: vCh.change, changePercent: vCh.changePercent },
          { label: 'Timeliness', value: timeliness, sparklineData: mockSparklineFromValue(timeliness, 2), change: tiCh.change, changePercent: tiCh.changePercent },
          { label: 'Accuracy', value: accuracy, sparklineData: mockSparklineFromValue(accuracy, 3), change: aCh.change, changePercent: aCh.changePercent },
        ];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRowClicked(item: DqRuleRow | undefined): void {
    if (!item) return;
    this.selectedItem = item;
    this.selectedInstanceIdForModal = null;
    this.panelTitle = item.name;
    this.panelRows = [
      { label: 'ID', value: item.id },
      { label: 'Name', value: item.name },
      { label: 'Rule type', value: item.rule_type ?? '—' },
      { label: 'Threshold %', value: item.exception_threshold_pct != null ? String(item.exception_threshold_pct) : '—' },
      { label: 'Flagged for monitoring', value: item.flagged_for_monitoring ? 'Yes' : 'No' },
      { label: 'Description', value: item.description ?? '—' },
    ];
    this.loadPanelInstances(item.id);
  }

  private loadPanelInstances(ruleId: number): void {
    this.panelInstancesLoading = true;
    this.panelInstances = [];
    this.api.getRuleInstances({ rule_id: ruleId }).subscribe({
      next: (list) => {
        this.panelInstances = list;
        this.panelInstancesLoading = false;
      },
      error: () => { this.panelInstancesLoading = false; },
    });
  }

  onInstanceCardClick(inst: DataQualityRuleInstance): void {
    this.selectedInstanceIdForModal = inst.id;
    this.modalOpen = true;
  }

  closeDetailModal(): void {
    this.modalOpen = false;
    this.selectedInstanceIdForModal = null;
  }

  closePanel(): void {
    this.selectedItem = null;
    this.selectedInstanceIdForModal = null;
    this.panelInstances = [];
  }

  getRowId = (params: { data: DqRuleRow }) => String(params.data.id);
}
