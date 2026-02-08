/**
 * AG Grid cell renderer: button that opens the lineage modal for the row's data element.
 * Expects cellRendererParams with onOpenLineage(data).
 */
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { DataElement } from '../../../core/api.service';

export interface LineageButtonCellParams extends ICellRendererParams<DataElement> {
  onOpenLineage: (data: DataElement) => void;
}

@Component({
  selector: 'app-lineage-button-cell',
  template: `
    <button type="button" class="lineage-btn" (click)="onClick()" title="Lineage" aria-label="View lineage">
      <svg class="lineage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="6" r="2.5"/>
        <circle cx="18" cy="6" r="2.5"/>
        <circle cx="12" cy="18" r="2.5"/>
        <path d="M8.5 7.5L11 14M15.5 7.5L13 14M12 15.5V14"/>
      </svg>
    </button>
  `,
  styles: [
    `
      .lineage-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.35rem;
        background: transparent;
        color: #14b8a6;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .lineage-btn:hover {
        background: rgba(20, 184, 166, 0.15);
      }
      .lineage-icon {
        width: 1.25rem;
        height: 1.25rem;
      }
    `,
  ],
})
export class LineageButtonCellComponent implements ICellRendererAngularComp {
  private params?: LineageButtonCellParams;

  agInit(params: LineageButtonCellParams): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  onClick(): void {
    if (this.params?.data) this.params.onOpenLineage(this.params.data);
  }
}
