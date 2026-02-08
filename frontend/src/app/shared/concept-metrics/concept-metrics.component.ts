/**
 * Displays a grid of KPI-style metric cards (label, value, optional sparkline, optional change).
 * Optional bar chart when showChart is true. Used on data-elements, applications, endpoints, etc.
 */
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import type { AgCartesianChartOptions } from 'ag-charts-community';

export interface MetricItem {
  label: string;
  value: number | string;
  /** Optional trend data for sparkline (e.g. last 5–7 values). If omitted and value is number, a flat line is shown. */
  sparklineData?: number[];
  /** Change vs previous period: number (e.g. +2 or -1) or percent when changePercent is true. Omit for "—". */
  change?: number | null;
  /** When true, change is shown as percentage (e.g. +10%); otherwise as absolute (e.g. +2). */
  changePercent?: boolean;
}

@Component({
  selector: 'app-concept-metrics',
  templateUrl: './concept-metrics.component.html',
  styleUrls: ['./concept-metrics.component.css'],
})
export class ConceptMetricsComponent implements OnChanges {
  @Input() metrics: MetricItem[] = [];
  @Input() showChart = false;
  /** When true, show "—" for metrics that have no change value. */
  @Input() showChangePlaceholder = true;
  chartOptions: AgCartesianChartOptions | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['metrics'] || changes['showChart']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    if (!this.showChart || !this.metrics?.length) {
      this.chartOptions = null;
      return;
    }
    const data = this.metrics
      .filter((m): m is MetricItem & { value: number } => typeof m.value === 'number')
      .map((m) => ({ category: m.label, value: m.value }));
    if (data.length === 0) {
      this.chartOptions = null;
      return;
    }
    this.chartOptions = {
      theme: { overrides: { common: { background: { fill: '#0A0C0E' } } } },
      data,
      axes: {
        x: { type: 'category', position: 'bottom', label: { color: '#9ca3af', fontSize: 10 } },
        y: { type: 'number', position: 'left', title: { text: 'Count', color: '#9ca3af' }, label: { color: '#9ca3af' } },
      },
      series: [{ type: 'bar', xKey: 'category', yKey: 'value', fill: '#5B9CFE', stroke: '#7AB0FF' }],
      height: 180,
      padding: { top: 12, right: 16, bottom: 40, left: 44 },
    };
  }

  getChangeClass(m: MetricItem): Record<string, boolean> {
    const sign = this.getChangeSign(m);
    return {
      'bg-emerald-500/20': sign === 1,
      'text-emerald-400': sign === 1,
      'bg-red-500/20': sign === -1,
      'text-red-400': sign === -1,
      'bg-gray-500/20': sign === 0,
      'text-gray-400': sign === 0,
    };
  }

  getChangeSign(m: MetricItem): number {
    if (m.change === undefined || m.change === null) return 0;
    return (m.change as number) > 0 ? 1 : (m.change as number) < 0 ? -1 : 0;
  }

  getChangeLabel(m: MetricItem): string {
    if (m.change === undefined || m.change === null) return '';
    const prefix = m.change > 0 ? '+' : '';
    return `${prefix}${m.change}${m.changePercent ? '%' : ''}`;
  }

  isNumericValue(m: MetricItem): boolean {
    return typeof m.value === 'number';
  }

  hasSparkline(m: MetricItem): boolean {
    return typeof m.value === 'number' && (m.sparklineData?.length ? m.sparklineData.length > 0 : true);
  }

  getSparklinePoints(m: MetricItem): string {
    const raw = m.sparklineData?.length
      ? m.sparklineData
      : (typeof m.value === 'number' ? [m.value, m.value, m.value] : [0]);
    const min = Math.min(...raw);
    const max = Math.max(...raw);
    const range = max - min || 1;
    const w = 100;
    const h = 24;
    const pad = 2;
    const n = raw.length;
    const points = raw.map((v, i) => {
      const x = n <= 1 ? w / 2 : (i / Math.max(1, n - 1)) * (w - 2 * pad) + pad;
      const y = h - pad - ((v - min) / range) * (h - 2 * pad);
      return `${x},${y}`;
    });
    return points.join(' ');
  }
}
