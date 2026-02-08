import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { KebabActionsCellComponent } from '../../shared/kebab-actions-cell/kebab-actions-cell.component';
import { CdeCountCellComponent } from './cde-count-cell/cde-count-cell.component';
import { EndpointConcernsCountCellComponent } from './endpoint-concerns-count-cell/endpoint-concerns-count-cell.component';
import { EndpointDqRulesCountCellComponent } from './endpoint-dq-rules-count-cell/endpoint-dq-rules-count-cell.component';
import {
  selectEndpoints,
  selectCurrentDomainId,
  selectLoading,
  selectDataElements,
  selectDataConcerns,
  selectDataQualityRules,
} from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import type { DomainScope } from '../../store/app.actions';
import { Endpoint, DataElement, DataConcern, DataQualityRule } from '../../core/api.service';
import { DataConcernModalService } from '../../core/data-concern-modal.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';
import { MetricItem } from '../../shared/concept-metrics/concept-metrics.component';
import { mockSparklineFromValue, mockChangeFromValue } from '../../shared/concept-metrics/mock-kpi';

type EnrichedEndpoint = Endpoint & {
  cdeCount?: number;
  concernCount?: number;
  hasCriticalConcern?: boolean;
  dqRulesCount?: number;
};

@Component({
  selector: 'app-endpoints-page',
  templateUrl: './endpoints-page.component.html',
  styleUrls: ['./endpoints-page.component.css'],
})
export class EndpointsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  endpoints: Endpoint[] = [];
  enrichedEndpoints: EnrichedEndpoint[] = [];
  dataElements: DataElement[] = [];
  dataConcerns: DataConcern[] = [];
  dataQualityRules: DataQualityRule[] = [];
  loading = false;
  selectedItem: Endpoint | null = null;
  domainScope: DomainScope = 'owned';
  currentDomainId: number | null = null;
  panelRows: DetailRow[] = [];
  panelTitle = '';
  panelDataElements: DataElement[] = [];
  panelConcerns: DataConcern[] = [];
  panelDqRules: DataQualityRule[] = [];
  cdeIdsByEndpoint: Record<number, number[]> = {};
  concernsByEndpoint: Record<number, DataConcern[]> = {};
  dqRulesByEndpoint: Record<number, DataQualityRule[]> = {};
  metrics: MetricItem[] = [];

  endpointModalOpen = false;
  endpointForModal: Endpoint | null = null;
  dqRuleModalOpen = false;
  dqRuleForModal: DataQualityRule | null = null;
  dataElementModalOpen = false;
  dataElementForModal: DataElement | null = null;

  columnDefs: ColDef<EnrichedEndpoint>[] = [
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
    {
      headerName: '# CDE',
      width: 100,
      sortable: false,
      filter: false,
      headerClass: 'ag-header-cell-centered',
      cellClass: 'ag-cell-centered',
      cellStyle: { textAlign: 'center' },
      cellRenderer: CdeCountCellComponent,
      cellRendererParams: {
        onOpenCdes: (data: Endpoint) => this.openCdesPanel(data),
      },
    },
    {
      headerName: '# DC',
      width: 100,
      sortable: false,
      filter: false,
      headerClass: 'ag-header-cell-centered',
      cellClass: 'ag-cell-centered',
      cellStyle: { textAlign: 'center' },
      cellRenderer: EndpointConcernsCountCellComponent,
      cellRendererParams: {
        onOpenConcerns: (data: Endpoint) => this.openConcernsPanel(data),
      },
    },
    {
      headerName: '# DQR',
      width: 100,
      sortable: false,
      filter: false,
      headerClass: 'ag-header-cell-centered',
      cellClass: 'ag-cell-centered',
      cellStyle: { textAlign: 'center' },
      cellRenderer: EndpointDqRulesCountCellComponent,
      cellRendererParams: {
        onOpenDqRules: (data: Endpoint) => this.openDqRulesPanel(data),
      },
    },
  ];
  defaultColDef: ColDef = { sortable: true, filter: true };

  constructor(
    private store: Store,
    private concernModal: DataConcernModalService,
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectCurrentDomainId)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((domainId) => {
        this.currentDomainId = domainId ?? null;
        if (domainId != null) {
          this.store.dispatch(AppActions.loadEndpoints({ domainId, scope: this.domainScope }));
          this.store.dispatch(AppActions.loadDataElements({ domainId, scope: this.domainScope }));
          this.store.dispatch(AppActions.loadDataConcerns({ domainId }));
          this.store.dispatch(AppActions.loadDataQualityRules({ domainId }));
        }
      });
    combineLatest([
      this.store.select(selectEndpoints),
      this.store.select(selectDataElements),
      this.store.select(selectDataConcerns),
      this.store.select(selectDataQualityRules),
      this.store.select(selectLoading('endpoints')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([list, dataElements, dataConcerns, dataQualityRules, loading]) => {
        this.endpoints = list;
        this.dataElements = dataElements;
        this.dataConcerns = dataConcerns;
        this.dataQualityRules = dataQualityRules;
        this.loading = loading;
        this.updateCdeIdsByEndpoint();
        this.updateConcernsByEndpoint();
        this.updateDqRulesByEndpoint();
        this.refreshEnrichedEndpoints();
        this.updateMetrics();
      });
  }

  private updateCdeIdsByEndpoint(): void {
    const map: Record<number, number[]> = {};
    const add = (endpointId: number | undefined, dataElementId: number | undefined) => {
      if (endpointId == null || dataElementId == null) return;
      if (!map[endpointId]) map[endpointId] = [];
      if (!map[endpointId].includes(dataElementId)) map[endpointId].push(dataElementId);
    };
    for (const r of this.dataQualityRules) {
      if (r.endpoint_id != null) add(r.endpoint_id, r.data_element_id);
    }
    for (const c of this.dataConcerns) {
      if (c.endpoint_id != null && c.data_element_id != null) add(c.endpoint_id, c.data_element_id);
    }
    this.cdeIdsByEndpoint = map;
  }

  private updateConcernsByEndpoint(): void {
    const map: Record<number, DataConcern[]> = {};
    for (const c of this.dataConcerns) {
      const id = c.endpoint_id;
      if (id == null) continue;
      if (!map[id]) map[id] = [];
      map[id].push(c);
    }
    this.concernsByEndpoint = map;
  }

  private updateDqRulesByEndpoint(): void {
    const map: Record<number, DataQualityRule[]> = {};
    for (const r of this.dataQualityRules) {
      const id = r.endpoint_id;
      if (id == null) continue;
      if (!map[id]) map[id] = [];
      map[id].push(r);
    }
    this.dqRulesByEndpoint = map;
  }

  private refreshEnrichedEndpoints(): void {
    this.enrichedEndpoints = this.endpoints.map((e) => {
      const concerns = this.concernsByEndpoint[e.id] ?? [];
      return {
        ...e,
        cdeCount: this.cdeIdsByEndpoint[e.id]?.length ?? 0,
        concernCount: concerns.length,
        hasCriticalConcern: concerns.some((c) => c.status === 'critical'),
        dqRulesCount: this.dqRulesByEndpoint[e.id]?.length ?? 0,
      };
    });
  }

  private updateMetrics(): void {
    const total = this.endpoints.length;
    const withDesc = this.endpoints.filter((e) => e.description?.trim()).length;
    const withCdes = this.enrichedEndpoints.filter((e) => (e.cdeCount ?? 0) > 0).length;
    const tCh = mockChangeFromValue(total, 0);
    const wCh = mockChangeFromValue(withDesc, 1);
    const cCh = mockChangeFromValue(withCdes, 2);
    this.metrics = [
      { label: 'Total', value: total, sparklineData: mockSparklineFromValue(total, 0), change: tCh.change, changePercent: tCh.changePercent },
      { label: 'With description', value: withDesc, sparklineData: mockSparklineFromValue(withDesc, 1), change: wCh.change, changePercent: wCh.changePercent },
      { label: 'With CDEs', value: withCdes, sparklineData: mockSparklineFromValue(withCdes, 2), change: cCh.change, changePercent: cCh.changePercent },
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRowClicked(item: Endpoint | undefined): void {
    if (!item) return;
    this.selectedItem = item;
    this.panelTitle = item.name;
    this.panelRows = [
      { label: 'ID', value: item.id },
      { label: 'Name', value: item.name },
      { label: 'Description', value: item.description },
      { label: 'Domain ID', value: item.domain_id },
      { label: 'Application ID', value: item.application_id },
    ];
    const cdeIds = this.cdeIdsByEndpoint[item.id] ?? [];
    this.panelDataElements = cdeIds
      .map((id) => this.dataElements.find((de) => de.id === id))
      .filter((de): de is DataElement => de != null);
    this.panelConcerns = this.concernsByEndpoint[item.id] ?? [];
    this.panelDqRules = this.dqRulesByEndpoint[item.id] ?? [];
  }

  openCdesPanel(ep: Endpoint): void {
    this.selectedItem = ep;
    this.panelTitle = 'Consumed CDEs – ' + ep.name;
    this.panelRows = [];
    const cdeIds = this.cdeIdsByEndpoint[ep.id] ?? [];
    this.panelDataElements = cdeIds
      .map((id) => this.dataElements.find((de) => de.id === id))
      .filter((de): de is DataElement => de != null);
    this.panelConcerns = [];
    this.panelDqRules = [];
  }

  openConcernsPanel(ep: Endpoint): void {
    this.selectedItem = ep;
    this.panelTitle = 'Data Concerns – ' + ep.name;
    this.panelRows = [];
    this.panelDataElements = [];
    this.panelConcerns = this.concernsByEndpoint[ep.id] ?? [];
    this.panelDqRules = [];
  }

  openDqRulesPanel(ep: Endpoint): void {
    this.selectedItem = ep;
    this.panelTitle = 'DQ Rules – ' + ep.name;
    this.panelRows = [];
    this.panelDataElements = [];
    this.panelConcerns = [];
    this.panelDqRules = this.dqRulesByEndpoint[ep.id] ?? [];
  }

  closePanel(): void {
    this.selectedItem = null;
    this.panelDataElements = [];
    this.panelConcerns = [];
    this.panelDqRules = [];
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

  openDataElementModal(element: DataElement): void {
    this.dataElementForModal = element;
    this.dataElementModalOpen = true;
  }

  onDataElementModalOpenChange(open: boolean): void {
    this.dataElementModalOpen = open;
    if (!open) this.dataElementForModal = null;
  }

  getRowId = (params: { data: Endpoint }) => String(params.data.id);

  setDomainScope(scope: DomainScope): void {
    this.domainScope = scope;
    if (this.currentDomainId != null) {
      this.store.dispatch(AppActions.loadEndpoints({ domainId: this.currentDomainId, scope }));
      this.store.dispatch(AppActions.loadDataElements({ domainId: this.currentDomainId, scope }));
    }
  }
}
