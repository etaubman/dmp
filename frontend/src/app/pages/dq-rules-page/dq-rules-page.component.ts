import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { selectDataQualityRules, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { DataQualityRule } from '../../core/api.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';
import { MetricItem } from '../../shared/concept-metrics/concept-metrics.component';

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
        this.metrics = [
          { label: 'Total', value: list.length },
          { label: 'Validity', value: list.filter((r) => r.rule_type === 'validity').length },
          { label: 'Timeliness', value: list.filter((r) => r.rule_type === 'timeliness').length },
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
