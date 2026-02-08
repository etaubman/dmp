/**
 * Use Case Monitoring metrics dashboard: mock KPIs, charts, and use case status table.
 */
import { Component, OnInit } from '@angular/core';
import type { AgCartesianChartOptions, AgPolarChartOptions } from 'ag-charts-community';

@Component({
  selector: 'app-use-case-monitoring-page',
  templateUrl: './use-case-monitoring-page.component.html',
  styleUrls: ['./use-case-monitoring-page.component.css'],
})
export class UseCaseMonitoringPageComponent implements OnInit {
  chartOptions: AgCartesianChartOptions | null = null;
  donutOptions: AgPolarChartOptions | null = null;

  kpis = {
    activeUseCases: 48,
    completionRatePct: 92,
    avgResponseTimeMs: 340,
  };

  useCasesTable: { name: string; domain: string; status: string; lastRun: string; successRate: number }[] = [];

  ngOnInit(): void {
    this.useCasesTable = [
      { name: 'Customer 360 Sync', domain: 'Customer Data', status: 'Healthy', lastRun: '2025-02-08 08:00', successRate: 99 },
      { name: 'GL Reconciliation', domain: 'Finance', status: 'Healthy', lastRun: '2025-02-08 07:30', successRate: 100 },
      { name: 'Vendor Onboarding', domain: 'HR', status: 'Warning', lastRun: '2025-02-08 06:15', successRate: 87 },
      { name: 'Product Feed Export', domain: 'Product Catalog', status: 'Healthy', lastRun: '2025-02-08 05:00', successRate: 98 },
      { name: 'Regulatory Report', domain: 'Regulatory', status: 'Healthy', lastRun: '2025-02-07 23:00', successRate: 100 },
      { name: 'Inventory Sync', domain: 'Operations', status: 'Error', lastRun: '2025-02-08 04:00', successRate: 72 },
      { name: 'Master Data Merge', domain: 'Vendor Master', status: 'Healthy', lastRun: '2025-02-08 03:00', successRate: 95 },
    ];

    this.chartOptions = {
      theme: { overrides: { common: { background: { fill: '#0A0C0E' } } } },
      data: [
        { day: 'Mon', runs: 120, success: 115 },
        { day: 'Tue', runs: 135, success: 128 },
        { day: 'Wed', runs: 142, success: 138 },
        { day: 'Thu', runs: 138, success: 130 },
        { day: 'Fri', runs: 145, success: 140 },
        { day: 'Sat', runs: 98, success: 92 },
        { day: 'Sun', runs: 85, success: 82 },
      ],
      axes: {
        x: { type: 'category', position: 'bottom', label: { color: '#9ca3af', fontSize: 11 } },
        y: { type: 'number', position: 'left', title: { text: 'Runs', color: '#9ca3af' }, label: { color: '#9ca3af' } },
      },
      series: [
        { type: 'bar', xKey: 'day', yKey: 'runs', fill: 'rgba(91, 156, 254, 0.4)', stroke: '#5B9CFE', yName: 'Total' },
        { type: 'bar', xKey: 'day', yKey: 'success', fill: '#4ADE80', stroke: '#22C55E', yName: 'Successful' },
      ],
      height: 280,
      padding: { top: 16, right: 20, bottom: 48, left: 56 },
    };

    this.donutOptions = {
      theme: { overrides: { common: { background: { fill: '#0A0C0E' } } } },
      data: [
        { status: 'Healthy', count: 38 },
        { status: 'Warning', count: 6 },
        { status: 'Error', count: 4 },
      ],
      series: [
        {
          type: 'donut',
          angleKey: 'count',
          legendItemKey: 'status',
          fills: ['#4ADE80', '#FACC15', '#F87171'],
          strokes: ['#0A0C0E'],
        },
      ],
      legend: { enabled: true, item: { label: { color: '#e5e7eb', fontSize: 12 } }, spacing: 12 },
      height: 280,
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
    };
  }
}
