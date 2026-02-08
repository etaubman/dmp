/**
 * AG Grid cell renderer: shows data element count for a data feed as a badge (same style as other count badges).
 */
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { DataFeed } from '../../../core/models';

@Component({
  selector: 'app-elements-count-cell',
  template: `
    <ng-container *ngIf="count > 0">
      <span
        class="count-badge count-badge--elements"
        [attr.title]="count + ' data element(s)'"
        [attr.aria-label]="count + ' data elements'"
      >
        {{ count }}
      </span>
    </ng-container>
  `,
  styles: [
    `
      .count-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.5rem;
        height: 1.5rem;
        padding: 0 0.35rem;
        border-radius: 50%;
        font-size: 0.75rem;
        font-weight: 600;
        color: #0f172a;
      }
      .count-badge--elements {
        background: #8b5cf6;
      }
    `,
  ],
})
export class ElementsCountCellComponent implements ICellRendererAngularComp {
  private params?: ICellRendererParams<DataFeed>;
  count = 0;

  agInit(params: ICellRendererParams<DataFeed>): void {
    this.params = params;
    if (params.data) {
      this.count = params.data.data_element_count ?? 0;
    }
  }

  refresh(params: ICellRendererParams<DataFeed>): boolean {
    this.agInit(params);
    return true;
  }
}
