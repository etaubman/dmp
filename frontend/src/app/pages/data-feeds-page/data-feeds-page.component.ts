/**
 * Data Feeds page: list data feeds for the current domain (scope: owned/upstream/downstream),
 * with detail panel showing format, transmission, producer/consumer, data elements, and controls.
 */
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { selectDataFeeds, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import type { DomainScope } from '../../store/app.actions';
import type { DataFeed, DataFeedDetail, DataFeedDataElementRef, DataFeedControl } from '../../core/models';
import type { DataElement } from '../../core/models';
import { ApiService } from '../../core/api.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';
import { MetricItem } from '../../shared/concept-metrics/concept-metrics.component';
import { mockSparklineFromValue, mockChangeFromValue } from '../../shared/concept-metrics/mock-kpi';

@Component({
  selector: 'app-data-feeds-page',
  templateUrl: './data-feeds-page.component.html',
  styleUrls: ['./data-feeds-page.component.css'],
})
export class DataFeedsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  dataFeeds: DataFeed[] = [];
  loading = false;
  selectedItem: DataFeed | null = null;
  selectedDetail: DataFeedDetail | null = null;
  detailLoading = false;
  domainScope: DomainScope = 'owned';
  currentDomainId: number | null = null;
  panelTitle = '';
  panelRows: DetailRow[] = [];
  panelFeedDataElements: DataFeedDataElementRef[] = [];
  panelFeedControls: DataFeedControl[] = [];
  metrics: MetricItem[] = [];

  dataElementModalOpen = false;
  dataElementForModal: DataElement | null = null;
  controlModalOpen = false;
  controlModalTitle = '';
  controlModalRows: DetailRow[] = [];

  columnDefs: ColDef<DataFeed>[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'source_type', headerName: 'Source', flex: 0 },
    { field: 'format', headerName: 'Format', flex: 0 },
    { field: 'transmission_method', headerName: 'Transmission', flex: 0 },
    { field: 'producer_application_name', headerName: 'Producer', flex: 1 },
    { field: 'consumer_application_name', headerName: 'Consumer', flex: 1 },
    {
      headerName: '# Elements',
      width: 100,
      sortable: false,
      filter: false,
      headerClass: 'ag-header-cell-centered',
      cellClass: 'ag-cell-centered',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: { data?: DataFeed }) => {
        const count = params.data?.data_element_count ?? 0;
        if (count <= 0) return '';
        return `<span class="count-badge count-badge--elements" title="${count} data element(s)">${count}</span>`;
      },
    },
    {
      headerName: '# Controls',
      width: 100,
      sortable: false,
      filter: false,
      headerClass: 'ag-header-cell-centered',
      cellClass: 'ag-cell-centered',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: { data?: DataFeed }) => {
        const count = params.data?.control_count ?? 0;
        if (count <= 0) return '';
        return `<span class="count-badge count-badge--controls" title="${count} control(s)">${count}</span>`;
      },
    },
  ];
  defaultColDef: ColDef = { sortable: true, filter: true };

  constructor(
    private store: Store,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectCurrentDomainId)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((domainId) => {
        this.currentDomainId = domainId ?? null;
        if (domainId != null) {
          this.store.dispatch(AppActions.loadDataFeeds({ domainId, scope: this.domainScope }));
        }
      });
    combineLatest([
      this.store.select(selectDataFeeds),
      this.store.select(selectLoading('dataFeeds')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([list, loading]) => {
        this.dataFeeds = list;
        this.loading = loading;
        const total = list.length;
        const external = list.filter((f) => f.source_type === 'external').length;
        const internal = list.filter((f) => f.source_type === 'internal').length;
        this.metrics = [
          { label: 'Total', value: total, sparklineData: mockSparklineFromValue(total, 0), change: mockChangeFromValue(total, 0).change, changePercent: mockChangeFromValue(total, 0).changePercent },
          { label: 'External', value: external, sparklineData: mockSparklineFromValue(external, 0), change: mockChangeFromValue(external, 0).change, changePercent: mockChangeFromValue(external, 0).changePercent },
          { label: 'Internal', value: internal, sparklineData: mockSparklineFromValue(internal, 0), change: mockChangeFromValue(internal, 0).change, changePercent: mockChangeFromValue(internal, 0).changePercent },
        ];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRowClicked(item: DataFeed | undefined): void {
    if (!item) return;
    this.selectedItem = item;
    this.panelTitle = item.name;
    this.panelRows = [
      { label: 'ID', value: item.id },
      { label: 'Name', value: item.name },
      { label: 'Description', value: item.description },
      { label: 'Source type', value: item.source_type },
      { label: 'Format', value: item.format },
      { label: 'Transmission', value: item.transmission_method },
      { label: 'Producer', value: item.producer_application_name },
      { label: 'Consumer', value: item.consumer_application_name },
      { label: 'Data elements', value: item.data_element_count != null ? String(item.data_element_count) : undefined },
      { label: 'Controls', value: item.control_count != null ? String(item.control_count) : undefined },
    ];
    this.panelFeedDataElements = [];
    this.panelFeedControls = [];
    this.detailLoading = true;
    this.api.getDataFeed(item.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (detail: DataFeedDetail) => {
        this.selectedDetail = detail;
        this.panelFeedDataElements = detail.data_elements ?? [];
        this.panelFeedControls = detail.controls ?? [];
        this.detailLoading = false;
      },
      error: () => {
        this.detailLoading = false;
      },
    });
  }

  closePanel(): void {
    this.selectedItem = null;
    this.selectedDetail = null;
    this.panelFeedDataElements = [];
    this.panelFeedControls = [];
  }

  getRowId = (params: { data: DataFeed }) => String(params.data.id);

  setDomainScope(scope: DomainScope): void {
    this.domainScope = scope;
    if (this.currentDomainId != null) {
      this.store.dispatch(AppActions.loadDataFeeds({ domainId: this.currentDomainId, scope }));
    }
  }

  openDataElementModal(de: { id: number; name: string; description?: string }): void {
    this.dataElementForModal = {
      id: de.id,
      name: de.name,
      description: de.description,
      domain_id: this.selectedItem?.domain_id ?? 0,
    };
    this.dataElementModalOpen = true;
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  onDataElementModalOpenChange(open: boolean): void {
    this.dataElementModalOpen = open;
    if (!open) this.dataElementForModal = null;
  }

  openControlModal(c: { id: number; control_type?: string; name: string; description?: string }): void {
    this.controlModalTitle = 'Control: ' + (c.name || '—');
    this.controlModalRows = [
      { label: 'ID', value: c.id },
      { label: 'Name', value: c.name },
      { label: 'Type', value: c.control_type },
      { label: 'Description', value: c.description },
    ];
    this.controlModalOpen = true;
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  onControlModalOpenChange(open: boolean): void {
    this.controlModalOpen = open;
    if (!open) {
      this.controlModalTitle = '';
      this.controlModalRows = [];
    }
  }
}
