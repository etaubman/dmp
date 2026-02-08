/**
 * AG Grid cell renderer: instance count badge + health indicator for a DQ rule row.
 * Row data must include instanceCount and lastPassed (enriched by dq-rules-page).
 */
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

export interface DqRuleWithCount {
  id: number;
  name?: string;
  instanceCount?: number;
  lastPassed?: boolean | null;
}

@Component({
  selector: 'app-instance-count-badge-cell',
  template: `
    <span class="inst-cell">
      <span *ngIf="instanceCount != null && instanceCount > 0" class="inst-cell__badge" [attr.aria-label]="instanceCount + ' runs'">{{ instanceCount }}</span>
      <span *ngIf="instanceCount == null || instanceCount === 0" class="inst-cell__muted">—</span>
      <span *ngIf="lastPassed === true" class="inst-cell__health inst-cell__health--pass" title="Last run passed" aria-label="Passed">●</span>
      <span *ngIf="lastPassed === false" class="inst-cell__health inst-cell__health--fail" title="Last run failed" aria-label="Failed">●</span>
      <span *ngIf="lastPassed == null && instanceCount != null && instanceCount > 0" class="inst-cell__health inst-cell__health--unknown" title="No run status">●</span>
    </span>
  `,
  styles: [`
    .inst-cell { display: inline-flex; align-items: center; gap: 0.35rem; }
    .inst-cell__badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 1.25rem; height: 1.25rem; padding: 0 0.3rem;
      border-radius: 9999px; font-size: 0.6875rem; font-weight: 600;
      color: #0f172a; background: #94a3b8;
    }
    .inst-cell__muted { color: #6b7280; font-size: 0.875rem; }
    .inst-cell__health { font-size: 0.75rem; line-height: 1; }
    .inst-cell__health--pass { color: #22c55e; }
    .inst-cell__health--fail { color: #ef4444; }
    .inst-cell__health--unknown { color: #6b7280; }
  `],
})
export class InstanceCountBadgeCellComponent implements ICellRendererAngularComp {
  private params?: ICellRendererParams<DqRuleWithCount>;
  instanceCount: number | null = null;
  lastPassed: boolean | null = null;

  agInit(params: ICellRendererParams<DqRuleWithCount>): void {
    this.params = params;
    if (params.data) {
      this.instanceCount = params.data.instanceCount ?? null;
      this.lastPassed = params.data.lastPassed ?? null;
    }
  }

  refresh(params: ICellRendererParams<DqRuleWithCount>): boolean {
    this.agInit(params);
    return true;
  }
}
