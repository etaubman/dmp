import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { KebabActionsCellComponent } from '../../shared/kebab-actions-cell/kebab-actions-cell.component';
import { LineageButtonCellComponent } from './lineage-button-cell/lineage-button-cell.component';
import { DataConcernsCountCellComponent } from './data-concerns-count-cell/data-concerns-count-cell.component';
import { EndpointsCountCellComponent } from './endpoints-count-cell/endpoints-count-cell.component';
import { DqRulesCountCellComponent } from './dq-rules-count-cell/dq-rules-count-cell.component';
import { SorCountCellComponent } from './sor-count-cell/sor-count-cell.component';
import { selectDataElements, selectDataConcerns, selectEndpoints, selectDataQualityRules, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import { ApiService, DataElementSORSummary } from '../../core/api.service';
import * as AppActions from '../../store/app.actions';
import type { DomainScope } from '../../store/app.actions';
import { DataElement, DataConcern, Endpoint, DataQualityRule } from '../../core/api.service';
import { DataConcernModalService } from '../../core/data-concern-modal.service';
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
  enrichedElements: (DataElement & { concernCount?: number; hasCriticalConcern?: boolean; endpointCount?: number; dqRulesCount?: number; sorCount?: number })[] = [];
  loading = false;
  selectedItem: DataElement | null = null;
  panelRows: DetailRow[] = [];
  panelTitle = '';
  panelConcerns: DataConcern[] = [];
  panelEndpoints: Endpoint[] = [];
  panelDqRules: DataQualityRule[] = [];
  panelSors: DataElementSORSummary[] = [];
  dataConcerns: DataConcern[] = [];
  endpoints: Endpoint[] = [];
  dataQualityRules: DataQualityRule[] = [];
  sorByElement: DataElementSORSummary[] = [];
  concernsByElement: Record<number, { count: number; hasCritical: boolean }> = {};
  endpointIdsByElement: Record<number, number[]> = {};
  dqRulesByElement: Record<number, DataQualityRule[]> = {};
  sorCountByElement: Record<number, number> = {};

  lineageModalOpen = false;
  lineageElement: DataElement | null = null;
  endpointModalOpen = false;
  endpointForModal: Endpoint | null = null;
  dqRuleModalOpen = false;
  dqRuleForModal: DataQualityRule | null = null;

  domainScope: DomainScope = 'owned';
  currentDomainId: number | null = null;
  metrics: MetricItem[] = [];

  columnDefs: ColDef<DataElement>[] = [
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
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'element_type', headerName: 'Type', width: 120 },
    {
      headerName: '# SOR',
      width: 120,
      sortable: false,
      filter: false,
      headerClass: 'ag-header-cell-centered',
      cellClass: 'ag-cell-centered',
      cellStyle: { textAlign: 'center' },
      cellRenderer: SorCountCellComponent,
      cellRendererParams: {
        onOpenSor: (data: DataElement) => this.openSorPanel(data),
      },
    },
    {
      headerName: '# DC',
      width: 120,
      sortable: false,
      filter: false,
      headerClass: 'ag-header-cell-centered',
      cellClass: 'ag-cell-centered',
      cellStyle: { textAlign: 'center' },
      cellRenderer: DataConcernsCountCellComponent,
      cellRendererParams: {
        onOpenConcerns: (data: DataElement) => this.openConcernsPanel(data),
      },
    },
    {
      headerName: '# EP',
      width: 120,
      sortable: false,
      filter: false,
      headerClass: 'ag-header-cell-centered',
      cellClass: 'ag-cell-centered',
      cellStyle: { textAlign: 'center' },
      cellRenderer: EndpointsCountCellComponent,
      cellRendererParams: {
        onOpenEndpoints: (data: DataElement) => this.openEndpointsPanel(data),
      },
    },
    {
      headerName: '# DQR',
      width: 120,
      sortable: false,
      filter: false,
      headerClass: 'ag-header-cell-centered',
      cellClass: 'ag-cell-centered',
      cellStyle: { textAlign: 'center' },
      cellRenderer: DqRulesCountCellComponent,
      cellRendererParams: {
        onOpenDqRules: (data: DataElement) => this.openDqRulesPanel(data),
      },
    },
    {
      headerName: 'Lineage',
      width: 100,
      sortable: false,
      filter: false,
      headerClass: 'ag-header-cell-centered',
      cellClass: 'ag-cell-centered',
      cellRenderer: LineageButtonCellComponent,
      cellRendererParams: {
        onOpenLineage: (data: DataElement) => this.openLineage(data),
      },
    },
  ];
  defaultColDef: ColDef = { sortable: true, filter: true };

  constructor(private store: Store, private concernModal: DataConcernModalService, private api: ApiService) {}

  ngOnInit(): void {
    this.store
      .select(selectCurrentDomainId)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((domainId) => {
        this.currentDomainId = domainId ?? null;
        if (domainId != null) {
          this.store.dispatch(AppActions.loadDataElements({ domainId, scope: this.domainScope }));
          this.store.dispatch(AppActions.loadDataConcerns({ domainId }));
          this.store.dispatch(AppActions.loadEndpoints({ domainId, scope: this.domainScope }));
          this.store.dispatch(AppActions.loadDataQualityRules({ domainId }));
          this.api.getDataElementSorByDomain(domainId, this.domainScope).pipe(takeUntil(this.destroy$)).subscribe((sors) => {
            this.sorByElement = sors;
            this.updateSorCountByElement();
            this.refreshEnrichedElements();
          });
        } else {
          this.sorByElement = [];
          this.sorCountByElement = {};
        }
      });
    combineLatest([
      this.store.select(selectDataElements),
      this.store.select(selectDataConcerns),
      this.store.select(selectEndpoints),
      this.store.select(selectDataQualityRules),
      this.store.select(selectLoading('dataElements')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([list, concerns, endpoints, dataQualityRules, loading]) => {
        this.dataElements = list;
        this.dataConcerns = concerns;
        this.endpoints = endpoints;
        this.dataQualityRules = dataQualityRules;
        this.loading = loading;
        this.updateConcernsByElement();
        this.updateEndpointIdsByElement();
        this.updateDqRulesByElement();
        this.refreshEnrichedElements();
        this.updateMetrics();
      });
  }

  private updateConcernsByElement(): void {
    const map: Record<number, { count: number; hasCritical: boolean }> = {};
    for (const c of this.dataConcerns) {
      const id = c.data_element_id;
      if (id == null) continue;
      if (!map[id]) map[id] = { count: 0, hasCritical: false };
      map[id].count++;
      if (c.status === 'critical') map[id].hasCritical = true;
    }
    this.concernsByElement = map;
  }

  private updateEndpointIdsByElement(): void {
    const map: Record<number, number[]> = {};
    const add = (elementId: number, endpointId: number | undefined) => {
      if (endpointId == null) return;
      if (!map[elementId]) map[elementId] = [];
      if (!map[elementId].includes(endpointId)) map[elementId].push(endpointId);
    };
    for (const c of this.dataConcerns) {
      if (c.data_element_id != null) add(c.data_element_id, c.endpoint_id);
    }
    for (const r of this.dataQualityRules) {
      if (r.data_element_id != null) add(r.data_element_id, r.endpoint_id);
    }
    this.endpointIdsByElement = map;
  }

  private updateDqRulesByElement(): void {
    const map: Record<number, DataQualityRule[]> = {};
    for (const r of this.dataQualityRules) {
      const id = r.data_element_id;
      if (id == null) continue;
      if (!map[id]) map[id] = [];
      map[id].push(r);
    }
    this.dqRulesByElement = map;
  }

  private updateSorCountByElement(): void {
    const map: Record<number, number> = {};
    for (const s of this.sorByElement) {
      map[s.data_element_id] = (map[s.data_element_id] ?? 0) + 1;
    }
    this.sorCountByElement = map;
  }

  private refreshEnrichedElements(): void {
    this.enrichedElements = this.dataElements.map((e) => ({
      ...e,
      concernCount: this.concernsByElement[e.id]?.count ?? 0,
      hasCriticalConcern: this.concernsByElement[e.id]?.hasCritical ?? false,
      endpointCount: this.endpointIdsByElement[e.id]?.length ?? 0,
      dqRulesCount: this.dqRulesByElement[e.id]?.length ?? 0,
      sorCount: this.sorCountByElement[e.id] ?? 0,
    }));
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
    this.panelConcerns = [];
    this.panelEndpoints = [];
    this.panelDqRules = [];
    this.panelRows = [
      { label: 'ID', value: item.id },
      { label: 'Name', value: item.name },
      { label: 'Description', value: item.description },
      { label: 'Element type', value: item.element_type },
    ];
  }

  openConcernsPanel(element: DataElement): void {
    this.selectedItem = element;
    this.panelTitle = 'Data Concerns – ' + element.name;
    this.panelRows = [];
    this.panelEndpoints = [];
    this.panelDqRules = [];
    this.panelConcerns = this.dataConcerns.filter((c) => c.data_element_id === element.id);
  }

  openEndpointsPanel(element: DataElement): void {
    this.selectedItem = element;
    this.panelTitle = 'Endpoints – ' + element.name;
    this.panelRows = [];
    this.panelConcerns = [];
    this.panelDqRules = [];
    const ids = this.endpointIdsByElement[element.id] ?? [];
    this.panelEndpoints = ids.map((id) => this.endpoints.find((ep) => ep.id === id)).filter((ep): ep is Endpoint => ep != null);
  }

  openDqRulesPanel(element: DataElement): void {
    this.selectedItem = element;
    this.panelTitle = 'DQ Rules – ' + element.name;
    this.panelRows = [];
    this.panelConcerns = [];
    this.panelEndpoints = [];
    this.panelDqRules = this.dqRulesByElement[element.id] ?? [];
    this.panelSors = [];
  }

  openSorPanel(element: DataElement): void {
    this.selectedItem = element;
    this.panelTitle = 'SOR – ' + element.name;
    this.panelRows = [];
    this.panelConcerns = [];
    this.panelEndpoints = [];
    this.panelDqRules = [];
    this.panelSors = this.sorByElement.filter((s) => s.data_element_id === element.id);
  }

  closePanel(): void {
    this.selectedItem = null;
    this.panelConcerns = [];
    this.panelEndpoints = [];
    this.panelDqRules = [];
    this.panelSors = [];
  }

  openLineage(data: DataElement): void {
    this.lineageElement = data;
    this.lineageModalOpen = true;
  }

  onLineageOpenChange(open: boolean): void {
    this.lineageModalOpen = open;
    if (!open) this.lineageElement = null;
  }

  openConcernModal(concern: DataConcern): void {
    this.concernModal.open(concern);
  }

  openEndpointModal(ep: Endpoint): void {
    this.endpointForModal = ep;
    this.endpointModalOpen = true;
  }

  onEndpointModalOpenChange(open: boolean): void {
    this.endpointModalOpen = open;
    if (!open) this.endpointForModal = null;
  }

  openDqRuleModal(rule: DataQualityRule): void {
    this.dqRuleForModal = rule;
    this.dqRuleModalOpen = true;
  }

  onDqRuleModalOpenChange(open: boolean): void {
    this.dqRuleModalOpen = open;
    if (!open) this.dqRuleForModal = null;
  }

  getRowId = (params: { data: DataElement }) => String(params.data.id);

  setDomainScope(scope: DomainScope): void {
    this.domainScope = scope;
    if (this.currentDomainId != null) {
      this.store.dispatch(AppActions.loadDataElements({ domainId: this.currentDomainId, scope }));
      this.api.getDataElementSorByDomain(this.currentDomainId, scope).pipe(takeUntil(this.destroy$)).subscribe((sors) => {
        this.sorByElement = sors;
        this.updateSorCountByElement();
        this.refreshEnrichedElements();
      });
    }
  }
}
