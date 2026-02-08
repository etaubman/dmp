/**
 * Displays a grid of KPI-style metric cards (label, value, optional sparkline, optional change).
 * Optional bar chart when showChart is true. Used on data-elements, applications, endpoints, etc.
 */
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import type { AgCartesianChartOptions } from 'ag-charts-community';

export interface MetricItem {
  label: string;
  value: number | string;
  /** Optional short description shown in tooltip on the info icon. */
  tooltip?: string;
  /** Optional trend data for sparkline (e.g. last 5–7 values). If omitted and value is number, a flat line is shown. */
  sparklineData?: number[];
  /** Optional labels per sparkline point (e.g. dates). Same length as sparklineData. Used in sparkline hover tooltip. */
  sparklineLabels?: string[];
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

  /** Current sparkline hover tooltip: metric index and content. */
  sparklineHover: { index: number; label: string; value: number } | null = null;

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
      'kpi-tile__change--positive': sign === 1,
      'kpi-tile__change--negative': sign === -1,
      'kpi-tile__change--neutral': sign === 0,
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

  /** Points for area fill under sparkline (same viewBox 0 0 100 24). */
  getSparklineAreaPoints(m: MetricItem): string {
    const linePoints = this.getSparklinePoints(m);
    if (!linePoints) return '';
    const parts = linePoints.split(' ');
    const firstX = parts[0].split(',')[0];
    const lastX = parts[parts.length - 1].split(',')[0];
    return `0,24 ${firstX},24 ${linePoints} ${lastX},24 100,24`;
  }

  /** Raw sparkline values for tooltip. */
  getSparklineValues(m: MetricItem): number[] {
    if (m.sparklineData?.length) return m.sparklineData;
    if (typeof m.value === 'number') return [m.value, m.value, m.value];
    return [0];
  }

  /** Labels for each sparkline point (for hover tooltip). Falls back to "Point 1", "Point 2", etc. */
  getSparklineLabels(m: MetricItem): string[] {
    const values = this.getSparklineValues(m);
    if (m.sparklineLabels?.length === values.length) return m.sparklineLabels;
    return values.map((_, i) => `Point ${i + 1}`);
  }

  /** Sparkline hover: get index from x ratio (0–1) and return label + value. */
  getSparklineHoverContent(m: MetricItem, xRatio: number): { label: string; value: number } | null {
    const values = this.getSparklineValues(m);
    const labels = this.getSparklineLabels(m);
    if (values.length === 0) return null;
    const idx = Math.min(
      Math.floor(xRatio * values.length),
      values.length - 1
    );
    return { label: labels[idx] ?? `Point ${idx + 1}`, value: values[idx] };
  }

  onSparklineMouseMove(event: MouseEvent, m: MetricItem, metricIndex: number): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const xRatio = Math.max(0, Math.min(1, x / rect.width));
    const content = this.getSparklineHoverContent(m, xRatio);
    if (content) {
      this.sparklineHover = { index: metricIndex, label: content.label, value: content.value };
    }
  }

  onSparklineMouseLeave(): void {
    this.sparklineHover = null;
  }
}
