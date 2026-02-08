/**
 * AG Grid cell renderer: shows DQ rules count for an endpoint as a clickable badge; invokes onOpenDqRules(data) on click.
 * Row data must include dqRulesCount (enriched by endpoints-page).
 */
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Endpoint } from '../../../core/api.service';

export type EndpointWithDqRulesCount = Endpoint & { dqRulesCount?: number };

export interface EndpointDqRulesCountCellParams extends ICellRendererParams<EndpointWithDqRulesCount> {
  onOpenDqRules: (data: Endpoint) => void;
}

@Component({
  selector: 'app-endpoint-dq-rules-count-cell',
  template: `
    <ng-container *ngIf="count > 0">
      <button
        type="button"
        class="dqr-badge"
        (click)="onClick($event)"
        [attr.title]="'View ' + count + ' DQ rule(s)'"
        [attr.aria-label]="count + ' DQ rules'"
      >
        {{ count }}
      </button>
    </ng-container>
  `,
  styles: [
    `
      .dqr-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.5rem;
        height: 1.5rem;
        padding: 0 0.35rem;
        border: none;
        border-radius: 50%;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        color: #0f172a;
        background: #10b981;
      }
      .dqr-badge:hover {
        background: #059669;
      }
    `,
  ],
})
export class EndpointDqRulesCountCellComponent implements ICellRendererAngularComp {
  private params?: EndpointDqRulesCountCellParams;
  count = 0;

  agInit(params: EndpointDqRulesCountCellParams): void {
    this.params = params;
    if (params.data) {
      this.count = params.data.dqRulesCount ?? 0;
    }
  }

  refresh(params: EndpointDqRulesCountCellParams): boolean {
    this.agInit(params);
    return true;
  }

  onClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.params?.data && this.params?.onOpenDqRules) {
      this.params.onOpenDqRules(this.params.data);
    }
  }
}
