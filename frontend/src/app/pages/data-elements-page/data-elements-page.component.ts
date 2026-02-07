import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { selectDataElements, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { DataElement } from '../../core/api.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';
import { MetricItem } from '../../shared/concept-metrics/concept-metrics.component';

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

  metrics: MetricItem[] = [];

  columnDefs: ColDef<DataElement>[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'element_type', headerName: 'Type', width: 120 },
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
    this.metrics = [
      { label: 'Total', value: this.dataElements.length },
      { label: 'With description', value: this.dataElements.filter((e) => e.description?.trim()).length },
      { label: 'Logical', value: this.dataElements.filter((e) => e.element_type === 'logical').length },
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

  getRowId = (params: { data: DataElement }) => String(params.data.id);
}
