import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { selectEndpoints, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { Endpoint } from '../../core/api.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';
import { MetricItem } from '../../shared/concept-metrics/concept-metrics.component';

@Component({
  selector: 'app-endpoints-page',
  templateUrl: './endpoints-page.component.html',
  styleUrls: ['./endpoints-page.component.css'],
})
export class EndpointsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  endpoints: Endpoint[] = [];
  loading = false;
  selectedItem: Endpoint | null = null;
  panelRows: DetailRow[] = [];
  panelTitle = '';
  metrics: MetricItem[] = [];
  columnDefs: ColDef<Endpoint>[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
  ];
  defaultColDef: ColDef = { sortable: true, filter: true };

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store
      .select(selectCurrentDomainId)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((domainId) => {
        if (domainId != null) this.store.dispatch(AppActions.loadEndpoints({ domainId }));
      });
    combineLatest([
      this.store.select(selectEndpoints),
      this.store.select(selectLoading('endpoints')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([list, loading]) => {
        this.endpoints = list;
        this.loading = loading;
        this.metrics = [
          { label: 'Total', value: list.length },
          { label: 'With description', value: list.filter((e) => e.description?.trim()).length },
        ];
      });
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
  }

  closePanel(): void {
    this.selectedItem = null;
  }

  getRowId = (params: { data: Endpoint }) => String(params.data.id);
}
