/**
 * AG Grid cell renderer: shows data concerns count for an endpoint as a clickable badge (amber/red if critical); invokes onOpenConcerns(data).
 * Row data must include concernCount and hasCriticalConcern (enriched by endpoints-page).
 */
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Endpoint } from '../../../core/api.service';

export type EndpointWithConcerns = Endpoint & { concernCount?: number; hasCriticalConcern?: boolean };

export interface EndpointConcernsCountCellParams extends ICellRendererParams<EndpointWithConcerns> {
  onOpenConcerns: (data: Endpoint) => void;
}

@Component({
  selector: 'app-endpoint-concerns-count-cell',
  template: `
    <ng-container *ngIf="count > 0">
      <button
        type="button"
        class="concerns-badge"
        [class.concerns-badge--critical]="hasCritical"
        [class.concerns-badge--amber]="!hasCritical"
        (click)="onClick($event)"
        [attr.title]="'View ' + count + ' data concern(s)'"
        [attr.aria-label]="count + ' data concerns'"
      >
        {{ count }}
      </button>
    </ng-container>
  `,
  styles: [
    `
      .concerns-badge {
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
      }
      .concerns-badge--amber {
        background: #f59e0b;
      }
      .concerns-badge--amber:hover {
        background: #d97706;
      }
      .concerns-badge--critical {
        background: #ef4444;
        color: #fff;
      }
      .concerns-badge--critical:hover {
        background: #dc2626;
      }
    `,
  ],
})
export class EndpointConcernsCountCellComponent implements ICellRendererAngularComp {
  private params?: EndpointConcernsCountCellParams;
  count = 0;
  hasCritical = false;

  agInit(params: EndpointConcernsCountCellParams): void {
    this.params = params;
    if (params.data) {
      this.count = params.data.concernCount ?? 0;
      this.hasCritical = params.data.hasCriticalConcern ?? false;
    }
  }

  refresh(params: EndpointConcernsCountCellParams): boolean {
    this.agInit(params);
    return true;
  }

  onClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.params?.data && this.params?.onOpenConcerns) {
      this.params.onOpenConcerns(this.params.data);
    }
  }
}
