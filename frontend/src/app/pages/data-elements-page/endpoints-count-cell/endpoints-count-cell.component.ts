/**
 * AG Grid cell renderer: shows endpoint count for a data element as a clickable badge; invokes onOpenEndpoints(data) on click.
 * Row data must include endpointCount (enriched by data-elements-page).
 */
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { DataElement } from '../../../core/api.service';

export type DataElementWithEndpointCount = DataElement & { endpointCount?: number };

export interface EndpointsCountCellParams extends ICellRendererParams<DataElementWithEndpointCount> {
  onOpenEndpoints: (data: DataElement) => void;
}

@Component({
  selector: 'app-endpoints-count-cell',
  template: `
    <ng-container *ngIf="count > 0">
      <button
        type="button"
        class="ep-badge"
        (click)="onClick($event)"
        [attr.title]="'View ' + count + ' endpoint(s)'"
        [attr.aria-label]="count + ' endpoints'"
      >
        {{ count }}
      </button>
    </ng-container>
  `,
  styles: [
    `
      .ep-badge {
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
        background: #3b82f6;
      }
      .ep-badge:hover {
        background: #2563eb;
      }
    `,
  ],
})
export class EndpointsCountCellComponent implements ICellRendererAngularComp {
  private params?: EndpointsCountCellParams;
  count = 0;

  agInit(params: EndpointsCountCellParams): void {
    this.params = params;
    if (params.data) {
      this.count = params.data.endpointCount ?? 0;
    }
  }

  refresh(params: EndpointsCountCellParams): boolean {
    this.agInit(params);
    return true;
  }

  onClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.params?.data && this.params?.onOpenEndpoints) {
      this.params.onOpenEndpoints(this.params.data);
    }
  }
}
