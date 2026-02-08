/**
 * Exception Monitoring metrics dashboard: mock KPIs, charts, and exceptions table.
 */
import { Component, OnInit } from '@angular/core';
import type { AgCartesianChartOptions } from 'ag-charts-community';

@Component({
  selector: 'app-exception-monitoring-page',
  templateUrl: './exception-monitoring-page.component.html',
  styleUrls: ['./exception-monitoring-page.component.css'],
})
export class ExceptionMonitoringPageComponent implements OnInit {
  chartOptions: AgCartesianChartOptions | null = null;
  severityOptions: AgCartesianChartOptions | null = null;

  kpis = {
    openExceptions: 24,
    resolvedThisWeek: 18,
    avgResolutionHours: 4.2,
  };

  exceptionsTable: { rule: string; domain: string; severity: string; raised: string; status: string }[] = [];

  ngOnInit(): void {
    this.exceptionsTable = [
      { rule: 'Null check - Customer ID', domain: 'Customer Data', severity: 'High', raised: '2025-02-08 07:22', status: 'Open' },
      { rule: 'Range check - Amount', domain: 'Finance', severity: 'Medium', raised: '2025-02-08 06:45', status: 'Open' },
      { rule: 'Referential integrity', domain: 'Product Catalog', severity: 'High', raised: '2025-02-08 05:10', status: 'In progress' },
      { rule: 'Format check - Date', domain: 'HR', severity: 'Low', raised: '2025-02-07 22:00', status: 'Resolved' },
      { rule: 'Duplicate detection', domain: 'Vendor Master', severity: 'Medium', raised: '2025-02-07 18:30', status: 'Open' },
      { rule: 'Completeness - Address', domain: 'Customer Data', severity: 'Low', raised: '2025-02-07 14:15', status: 'Resolved' },
      { rule: 'Threshold - Balance', domain: 'Finance', severity: 'High', raised: '2025-02-07 09:00', status: 'In progress' },
    ];

    this.chartOptions = {
      theme: { overrides: { common: { background: { fill: '#0A0C0E' } } } },
      data: [
        { week: 'Week 1', opened: 12, resolved: 10 },
        { week: 'Week 2', opened: 8, resolved: 14 },
        { week: 'Week 3', opened: 15, resolved: 11 },
        { week: 'Week 4', opened: 9, resolved: 18 },
      ],
      axes: {
        x: { type: 'category', position: 'bottom', label: { color: '#9ca3af', fontSize: 11 } },
        y: { type: 'number', position: 'left', title: { text: 'Count', color: '#9ca3af' }, label: { color: '#9ca3af' } },
      },
      series: [
        { type: 'bar', xKey: 'week', yKey: 'opened', fill: '#F87171', stroke: '#EF4444', yName: 'Opened' },
        { type: 'bar', xKey: 'week', yKey: 'resolved', fill: '#4ADE80', stroke: '#22C55E', yName: 'Resolved' },
      ],
      height: 280,
      padding: { top: 16, right: 20, bottom: 48, left: 56 },
    };

    this.severityOptions = {
      theme: { overrides: { common: { background: { fill: '#0A0C0E' } } } },
      data: [
        { severity: 'High', count: 8 },
        { severity: 'Medium', count: 10 },
        { severity: 'Low', count: 6 },
      ],
      series: [
        {
          type: 'bar',
          xKey: 'severity',
          yKey: 'count',
          fill: '#5B9CFE',
          stroke: '#7AB0FF',
        },
      ],
      axes: {
        x: { type: 'category', position: 'bottom', label: { color: '#9ca3af', fontSize: 11 } },
        y: { type: 'number', position: 'left', title: { text: 'Exceptions', color: '#9ca3af' }, label: { color: '#9ca3af' } },
      },
      height: 280,
      padding: { top: 16, right: 20, bottom: 48, left: 56 },
    };
  }
}
