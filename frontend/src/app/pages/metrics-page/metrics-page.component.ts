import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import type { AgCartesianChartOptions } from 'ag-charts-community';
import { selectMetrics, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { Metrics } from '../../core/api.service';

@Component({
  selector: 'app-metrics-page',
  templateUrl: './metrics-page.component.html',
  styleUrls: ['./metrics-page.component.css'],
})
export class MetricsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  metrics: Metrics | null = null;
  loading = false;
  domainId: number | null = null;
  chartOptions: AgCartesianChartOptions | null = null;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store
      .select(selectCurrentDomainId)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((id) => {
        this.domainId = id;
        this.store.dispatch(AppActions.loadMetrics({ domainId: id ?? undefined }));
      });
    combineLatest([
      this.store.select(selectMetrics),
      this.store.select(selectLoading('metrics')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([metrics, loading]) => {
        this.metrics = metrics;
        this.loading = loading;
        this.buildChart(metrics);
      });
  }

  private buildChart(metrics: Metrics | null): void {
    if (!metrics) {
      this.chartOptions = null;
      return;
    }
    const barData = [
      { category: 'Data Elements', value: metrics.data_elements_count },
      { category: 'Applications', value: metrics.applications_count },
      { category: 'EUCs', value: metrics.eucs_count },
      { category: 'Endpoints', value: metrics.endpoints_count },
      { category: 'DQ Rules', value: metrics.data_quality_rules_count },
      { category: 'DQ Exceptions', value: metrics.data_quality_exceptions_count },
      { category: 'Data Concerns', value: metrics.data_concerns_count },
    ];
    this.chartOptions = {
      theme: { overrides: { common: { background: { fill: '#0A0C0E' } } } },
      data: barData,
      axes: {
        x: { type: 'category', position: 'bottom', label: { color: '#9ca3af', fontSize: 11 } },
        y: { type: 'number', position: 'left', title: { text: 'Count', color: '#9ca3af' }, label: { color: '#9ca3af' } },
      },
      series: [{ type: 'bar', xKey: 'category', yKey: 'value', fill: '#5B9CFE', stroke: '#7AB0FF' }],
      height: 300,
      padding: { top: 16, right: 20, bottom: 48, left: 56 },
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
