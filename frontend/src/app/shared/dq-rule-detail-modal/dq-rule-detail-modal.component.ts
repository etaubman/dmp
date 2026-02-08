/**
 * Modal that displays a data quality rule: overview, performance, trend, instances with SQL, and actions.
 */
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from '../../core/api.service';
import type {
  DataQualityRule,
  DataQualityRuleInstance,
  DataQualityRuleInstanceDetail,
  DQPerformanceSummary,
  DQTrendResponse,
  RuleModRequest,
} from '../../core/api.service';
import type { AgCartesianChartOptions } from 'ag-charts-community';

@Component({
  selector: 'app-dq-rule-detail-modal',
  templateUrl: './dq-rule-detail-modal.component.html',
  styleUrls: ['./dq-rule-detail-modal.component.css'],
})
export class DqRuleDetailModalComponent implements OnChanges {
  @Input() rule: DataQualityRule | null = null;
  /** When set (e.g. from instance card on DQ rules page), load and show this instance's SQL when modal opens. */
  @Input() selectedInstanceId: number | null = null;
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  performance: DQPerformanceSummary | null = null;
  trend: DQTrendResponse | null = null;
  instances: DataQualityRuleInstance[] = [];
  modRequests: RuleModRequest[] = [];
  selectedInstance: DataQualityRuleInstanceDetail | null = null;
  loadingPerformance = false;
  loadingTrend = false;
  loadingInstances = false;
  loadingModRequests = false;
  chartOptions: AgCartesianChartOptions | null = null;
  flagging = false;
  requestingMod = false;

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && this.rule) {
      this.loadAll();
      if (this.selectedInstanceId != null) {
        this.api.getRuleInstance(this.selectedInstanceId, true).subscribe({
          next: (detail) => { this.selectedInstance = detail; },
        });
      } else {
        this.selectedInstance = null;
      }
    }
    if (changes['rule'] && !this.open && this.rule) {
      this.selectedInstance = null;
    }
  }

  loadAll(): void {
    if (!this.rule) return;
    this.loadPerformance();
    this.loadTrend();
    this.loadInstances();
    this.loadModRequests();
  }

  loadPerformance(): void {
    if (!this.rule) return;
    this.loadingPerformance = true;
    this.api.getRulePerformance(this.rule.id, this.rule.data_element_id ?? undefined, undefined).subscribe({
      next: (p) => {
        this.performance = p;
        this.loadingPerformance = false;
      },
      error: () => { this.loadingPerformance = false; },
    });
  }

  loadTrend(): void {
    if (!this.rule) return;
    this.loadingTrend = true;
    this.api.getRulePerformanceTrend(this.rule.id, {
      data_element_id: this.rule.data_element_id ?? undefined,
      application_id: undefined,
    }).subscribe({
      next: (t) => {
        this.trend = t;
        this.buildChart();
        this.loadingTrend = false;
      },
      error: () => { this.loadingTrend = false; },
    });
  }

  loadInstances(): void {
    if (!this.rule) return;
    this.loadingInstances = true;
    this.api.getRuleInstances({ rule_id: this.rule.id }).subscribe({
      next: (list) => {
        this.instances = list;
        this.loadingInstances = false;
      },
      error: () => { this.loadingInstances = false; },
    });
  }

  loadModRequests(): void {
    if (!this.rule) return;
    this.loadingModRequests = true;
    this.api.getRuleModRequests(this.rule.id).subscribe({
      next: (list) => {
        this.modRequests = list;
        this.loadingModRequests = false;
      },
      error: () => { this.loadingModRequests = false; },
    });
  }

  private buildChart(): void {
    if (!this.trend?.points?.length) {
      this.chartOptions = null;
      return;
    }
    const data = this.trend.points.map((p) => ({
      run_at: new Date(p.run_at).toLocaleDateString(),
      exception_pct: p.exception_pct ?? 0,
      passed: p.passed ? 1 : 0,
    }));
    this.chartOptions = {
      data,
      series: [{ type: 'line', xKey: 'run_at', yKey: 'exception_pct', yName: 'Exception %' }],
      legend: { enabled: false },
      padding: { top: 10, right: 10, bottom: 30, left: 40 },
    };
  }

  viewSql(inst: DataQualityRuleInstance): void {
    this.api.getRuleInstance(inst.id, true).subscribe({
      next: (detail) => { this.selectedInstance = detail; },
    });
  }

  closeSql(): void {
    this.selectedInstance = null;
  }

  flagForMonitoring(): void {
    if (!this.rule || this.flagging) return;
    this.flagging = true;
    const newVal = !this.rule.flagged_for_monitoring;
    this.api.flagRuleForMonitoring(this.rule.id, newVal).subscribe({
      next: () => {
        this.rule = this.rule ? { ...this.rule, flagged_for_monitoring: newVal } : null;
        this.flagging = false;
      },
      error: () => { this.flagging = false; },
    });
  }

  requestRuleMod(): void {
    if (!this.rule || this.requestingMod) return;
    this.requestingMod = true;
    this.api.requestRuleMod(this.rule.id).subscribe({
      next: () => {
        this.loadModRequests();
        this.requestingMod = false;
      },
      error: () => { this.requestingMod = false; },
    });
  }

  markInstanceFalsePositive(inst: DataQualityRuleInstance): void {
    this.api.markInstanceFalsePositive(inst.id).subscribe({
      next: () => { this.loadInstances(); this.loadPerformance(); this.selectedInstance = null; },
    });
  }

  close(): void {
    this.open = false;
    this.openChange.emit(false);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dq-rule-modal-overlay')) {
      this.close();
    }
  }
}
