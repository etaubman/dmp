/**
 * AG Grid cell renderer: shows consumed CDE count for an endpoint as a clickable badge; invokes onOpenCdes(data) on click.
 * Row data must include cdeCount (enriched by endpoints-page).
 */
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Endpoint } from '../../../core/api.service';

export type EndpointWithCdeCount = Endpoint & { cdeCount?: number };

export interface CdeCountCellParams extends ICellRendererParams<EndpointWithCdeCount> {
  onOpenCdes: (data: Endpoint) => void;
}

@Component({
  selector: 'app-cde-count-cell',
  template: `
    <ng-container *ngIf="count > 0">
      <button
        type="button"
        class="cde-badge"
        (click)="onClick($event)"
        [attr.title]="'View ' + count + ' CDE(s)'"
        [attr.aria-label]="count + ' CDEs'"
      >
        {{ count }}
      </button>
    </ng-container>
  `,
  styles: [
    `
      .cde-badge {
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
        background: #8b5cf6;
      }
      .cde-badge:hover {
        background: #7c3aed;
      }
    `,
  ],
})
export class CdeCountCellComponent implements ICellRendererAngularComp {
  private params?: CdeCountCellParams;
  count = 0;

  agInit(params: CdeCountCellParams): void {
    this.params = params;
    if (params.data) {
      this.count = params.data.cdeCount ?? 0;
    }
  }

  refresh(params: CdeCountCellParams): boolean {
    this.agInit(params);
    return true;
  }

  onClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.params?.data && this.params?.onOpenCdes) {
      this.params.onOpenCdes(this.params.data);
    }
  }
}
