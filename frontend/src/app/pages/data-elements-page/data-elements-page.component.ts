import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { KebabActionsCellComponent } from '../../shared/kebab-actions-cell/kebab-actions-cell.component';
import { LineageButtonCellComponent } from './lineage-button-cell/lineage-button-cell.component';
import { selectDataElements, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { DataElement } from '../../core/api.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';
import { MetricItem } from '../../shared/concept-metrics/concept-metrics.component';
import { mockSparklineFromValue, mockChangeFromValue } from '../../shared/concept-metrics/mock-kpi';

@Component({
  selector: 'app-data-elements-page',
  templateUrl: './data-elements-page.component.html',
  styleUrls: ['./data-elements-page.component.css'],
})
export class DataElementsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  dataElements: DataElement[] = [];
  loading = false;
  selectedItem: DataElement | null = null;
  panelRows: DetailRow[] = [];
  panelTitle = '';

  lineageModalOpen = false;
  lineageElement: DataElement | null = null;

  metrics: MetricItem[] = [];

  columnDefs: ColDef<DataElement>[] = [
    {
      headerName: '',
      width: 56,
      sortable: false,
      filter: false,
      cellRenderer: KebabActionsCellComponent,
    },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'element_type', headerName: 'Type', width: 120 },
    {
      headerName: 'Lineage',
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: LineageButtonCellComponent,
      cellRendererParams: {
        onOpenLineage: (data: DataElement) => this.openLineage(data),
      },
    },
  ];
  defaultColDef: ColDef = { sortable: true, filter: true };

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
        this.updateMetrics();
      });
  }

  private updateMetrics(): void {
    const total = this.dataElements.length;
    const withDesc = this.dataElements.filter((e) => e.description?.trim()).length;
    const logical = this.dataElements.filter((e) => e.element_type === 'logical').length;
    const tCh = mockChangeFromValue(total, 0);
    const wCh = mockChangeFromValue(withDesc, 1);
    const lCh = mockChangeFromValue(logical, 2);
    this.metrics = [
      { label: 'Total', value: total, sparklineData: mockSparklineFromValue(total, 0), change: tCh.change, changePercent: tCh.changePercent },
      { label: 'With description', value: withDesc, sparklineData: mockSparklineFromValue(withDesc, 1), change: wCh.change, changePercent: wCh.changePercent },
      { label: 'Logical', value: logical, sparklineData: mockSparklineFromValue(logical, 2), change: lCh.change, changePercent: lCh.changePercent },
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRowClicked(item: DataElement | undefined): void {
    if (!item) return;
    this.selectedItem = item;
    this.panelTitle = item.name;
    this.panelRows = [
      { label: 'ID', value: item.id },
      { label: 'Name', value: item.name },
      { label: 'Description', value: item.description },
      { label: 'Element type', value: item.element_type },
    ];
  }

  closePanel(): void {
    this.selectedItem = null;
  }

  openLineage(data: DataElement): void {
    this.lineageElement = data;
    this.lineageModalOpen = true;
  }

  onLineageOpenChange(open: boolean): void {
    this.lineageModalOpen = open;
    if (!open) this.lineageElement = null;
  }

  getRowId = (params: { data: DataElement }) => String(params.data.id);
}
