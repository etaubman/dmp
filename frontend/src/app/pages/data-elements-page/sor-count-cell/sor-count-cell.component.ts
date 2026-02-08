/**
 * AG Grid cell renderer: shows system-of-record count as a clickable badge; invokes onOpenSor(data) on click.
 * Row data must include sorCount (enriched by data-elements-page).
 */
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { DataElement } from '../../../core/api.service';

export type DataElementWithSorCount = DataElement & { sorCount?: number };

export interface SorCountCellParams extends ICellRendererParams<DataElementWithSorCount> {
  onOpenSor: (data: DataElement) => void;
}

@Component({
  selector: 'app-sor-count-cell',
  template: `
    <ng-container *ngIf="count > 0">
      <button
        type="button"
        class="sor-badge"
        (click)="onClick($event)"
        [attr.title]="'View ' + count + ' system(s) of record'"
        [attr.aria-label]="count + ' systems of record'"
      >
        {{ count }}
      </button>
    </ng-container>
  `,
  styles: [
    `
      .sor-badge {
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
      .sor-badge:hover {
        background: #7c3aed;
      }
    `,
  ],
})
export class SorCountCellComponent implements ICellRendererAngularComp {
  private params?: SorCountCellParams;
  count = 0;

  agInit(params: SorCountCellParams): void {
    this.params = params;
    if (params.data) {
      this.count = params.data.sorCount ?? 0;
    }
  }

  refresh(params: SorCountCellParams): boolean {
    this.agInit(params);
    return true;
  }

  onClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.params?.data && this.params?.onOpenSor) {
      this.params.onOpenSor(this.params.data);
    }
  }
}
