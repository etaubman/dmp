/**
 * AG Grid cell renderer: shows DQ rules count for a data element as a clickable badge; invokes onOpenDqRules(data) on click.
 * Row data must include dqRulesCount (enriched by data-elements-page).
 */
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { DataElement } from '../../../core/api.service';

export type DataElementWithDqRulesCount = DataElement & { dqRulesCount?: number };

export interface DqRulesCountCellParams extends ICellRendererParams<DataElementWithDqRulesCount> {
  onOpenDqRules: (data: DataElement) => void;
}

@Component({
  selector: 'app-dq-rules-count-cell',
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
export class DqRulesCountCellComponent implements ICellRendererAngularComp {
  private params?: DqRulesCountCellParams;
  count = 0;

  agInit(params: DqRulesCountCellParams): void {
    this.params = params;
    if (params.data) {
      this.count = params.data.dqRulesCount ?? 0;
    }
  }

  refresh(params: DqRulesCountCellParams): boolean {
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
