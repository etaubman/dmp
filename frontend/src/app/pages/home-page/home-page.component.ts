import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import type { AgCartesianChartOptions, AgPolarChartOptions } from 'ag-charts-community';
import {
  selectMetrics,
  selectCurrentDomainId,
  selectCurrentDomain,
  selectDataQualityExceptions,
  selectDataConcerns,
  selectLoading,
} from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { Metrics } from '../../core/api.service';

export interface AttentionItem {
  title: string;
  count: number;
  description: string;
  route: string;
  severity: 'warning' | 'info';
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  metrics: Metrics | null = null;
  domainId: number | null = null;
  domainName: string | null = null;
  loading = false;
  attentionItems: AttentionItem[] = [];
  chartOptions: AgCartesianChartOptions | null = null;
  donutOptions: AgPolarChartOptions | null = null;

  constructor(
    private store: Store,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectCurrentDomainId)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((id) => {
        this.domainId = id;
        this.store.dispatch(AppActions.loadMetrics({ domainId: id ?? undefined }));
        if (id != null) {
          this.store.dispatch(AppActions.loadDataQualityExceptions({ domainId: id }));
          this.store.dispatch(AppActions.loadDataConcerns({ domainId: id }));
        }
      });

    this.store
      .select(selectCurrentDomain)
      .pipe(takeUntil(this.destroy$))
      .subscribe((d) => (this.domainName = d?.name ?? null));

    combineLatest([
      this.store.select(selectMetrics),
      this.store.select(selectDataQualityExceptions),
      this.store.select(selectDataConcerns),
      this.store.select(selectLoading('metrics')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([metrics, exceptions, concerns, loading]) => {
        this.metrics = metrics;
        this.loading = loading;
        this.buildAttentionItems(exceptions ?? [], concerns ?? []);
        this.buildCharts(metrics);
      });
  }

  private buildAttentionItems(
    exceptions: { id: number; status?: string }[],
    concerns: { id: number; status?: string }[],
  ): void {
    const openExceptions = exceptions.filter(
      (e) => !e.status || (e.status !== 'resolved' && e.status !== 'closed'),
    );
    const openConcerns = concerns.filter(
      (c) => !c.status || (c.status !== 'closed' && c.status !== 'resolved'),
    );
    this.attentionItems = [];
    if (openExceptions.length > 0) {
      this.attentionItems.push({
        title: 'DQ Exceptions',
        count: openExceptions.length,
        description: 'Data quality exceptions need review',
        route: '/data-quality-exceptions',
        severity: 'warning',
      });
    }
    if (openConcerns.length > 0) {
      this.attentionItems.push({
        title: 'Data Concerns',
        count: openConcerns.length,
        description: 'Open data concerns require attention',
        route: '/data-concerns',
        severity: 'info',
      });
    }
  }

  private buildCharts(metrics: Metrics | null): void {
    if (!metrics) {
      this.chartOptions = null;
      this.donutOptions = null;
      return;
    }
    const themeOverrides = { common: { background: { fill: '#0A0C0E' } } };
    const barData = [
      { category: 'Data Elements', value: metrics.data_elements_count },
      { category: 'Applications', value: metrics.applications_count },
      { category: 'EUCs', value: metrics.eucs_count },
      { category: 'Endpoints', value: metrics.endpoints_count },
      { category: 'DQ Rules', value: metrics.data_quality_rules_count },
      { category: 'DQ Exceptions', value: metrics.data_quality_exceptions_count },
      { category: 'Data Concerns', value: metrics.data_concerns_count },
    ].filter((d) => d.value > 0 || d.category === 'Data Elements');

    this.chartOptions = {
      theme: { overrides: themeOverrides },
      data: barData,
      axes: {
        x: { type: 'category', position: 'bottom', label: { color: '#9ca3af', fontSize: 11 } },
        y: { type: 'number', position: 'left', title: { text: 'Count', color: '#9ca3af' }, label: { color: '#9ca3af' } },
      },
      series: [{ type: 'bar', xKey: 'category', yKey: 'value', fill: '#5B9CFE', stroke: '#7AB0FF' }],
      height: 280,
      padding: { top: 16, right: 20, bottom: 48, left: 56 },
    };

    const donutData = barData.filter((d) => d.value > 0);
    if (donutData.length > 0) {
      this.donutOptions = {
        theme: { overrides: themeOverrides },
        data: donutData,
        series: [{ type: 'donut', angleKey: 'value', legendItemKey: 'category', fills: ['#5B9CFE', '#7AB0FF', '#4A8AE8', '#6BA3F5', '#3D7AD9'], strokes: ['#0A0C0E'] }],
        legend: { enabled: true, item: { label: { color: '#e5e7eb', fontSize: 12 } }, spacing: 12 },
        height: 260,
        padding: { top: 16, right: 16, bottom: 16, left: 16 },
      };
    } else {
      this.donutOptions = null;
    }
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
