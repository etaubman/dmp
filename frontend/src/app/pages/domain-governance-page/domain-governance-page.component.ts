/**
 * Domain Governance metrics dashboard: mock KPIs, charts, and domain compliance table.
 */
import { Component, OnInit } from '@angular/core';
import type { AgCartesianChartOptions } from 'ag-charts-community';

@Component({
  selector: 'app-domain-governance-page',
  templateUrl: './domain-governance-page.component.html',
  styleUrls: ['./domain-governance-page.component.css'],
})
export class DomainGovernancePageComponent implements OnInit {
  chartOptions: AgCartesianChartOptions | null = null;
  trendOptions: AgCartesianChartOptions | null = null;

  kpis = {
    domainsFullCoverage: 12,
    domainsAtRisk: 3,
    avgCompliancePct: 87,
  };

  domainsTable: { domain: string; level: string; compliance: number; status: string; lastReview: string }[] = [];

  ngOnInit(): void {
    this.domainsTable = [
      { domain: 'Finance', level: 'L0', compliance: 94, status: 'Compliant', lastReview: '2025-02-01' },
      { domain: 'HR', level: 'L0', compliance: 88, status: 'Compliant', lastReview: '2025-01-28' },
      { domain: 'Operations', level: 'L0', compliance: 72, status: 'At risk', lastReview: '2025-01-15' },
      { domain: 'Customer Data', level: 'L1', compliance: 91, status: 'Compliant', lastReview: '2025-02-05' },
      { domain: 'Product Catalog', level: 'L1', compliance: 65, status: 'At risk', lastReview: '2024-12-20' },
      { domain: 'Regulatory', level: 'L1', compliance: 98, status: 'Compliant', lastReview: '2025-02-07' },
      { domain: 'Vendor Master', level: 'L2', compliance: 78, status: 'Review', lastReview: '2025-01-10' },
    ];

    this.chartOptions = {
      theme: { overrides: { common: { background: { fill: '#0A0C0E' } } } },
      data: [
        { domain: 'Finance', compliance: 94 },
        { domain: 'HR', compliance: 88 },
        { domain: 'Operations', compliance: 72 },
        { domain: 'Customer Data', compliance: 91 },
        { domain: 'Product Catalog', compliance: 65 },
        { domain: 'Regulatory', compliance: 98 },
        { domain: 'Vendor Master', compliance: 78 },
      ],
      axes: {
        x: { type: 'category', position: 'bottom', label: { color: '#9ca3af', fontSize: 11 } },
        y: { type: 'number', position: 'left', title: { text: 'Compliance %', color: '#9ca3af' }, label: { color: '#9ca3af' }, min: 0, max: 100 },
      },
      series: [{ type: 'bar', xKey: 'domain', yKey: 'compliance', fill: '#5B9CFE', stroke: '#7AB0FF' }],
      height: 280,
      padding: { top: 16, right: 20, bottom: 48, left: 56 },
    };

    this.trendOptions = {
      theme: { overrides: { common: { background: { fill: '#0A0C0E' } } } },
      data: [
        { month: 'Sep', avg: 82 },
        { month: 'Oct', avg: 84 },
        { month: 'Nov', avg: 83 },
        { month: 'Dec', avg: 85 },
        { month: 'Jan', avg: 86 },
        { month: 'Feb', avg: 87 },
      ],
      axes: {
        x: { type: 'category', position: 'bottom', label: { color: '#9ca3af', fontSize: 11 } },
        y: { type: 'number', position: 'left', title: { text: 'Avg compliance %', color: '#9ca3af' }, label: { color: '#9ca3af' }, min: 70, max: 100 },
      },
      series: [{ type: 'line', xKey: 'month', yKey: 'avg', stroke: '#5B9CFE', marker: { fill: '#5B9CFE' } }],
      height: 280,
      padding: { top: 16, right: 20, bottom: 48, left: 56 },
    };
  }
}
