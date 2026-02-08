/**
 * Custom ng-diagram node template for lineage nodes. Adds type-based CSS classes
 * and ports (port-left, port-right) so edges are visible and connect correctly.
 */
import { Component, input, HostBinding } from '@angular/core';
import type { Node } from 'ng-diagram';

@Component({
  selector: 'app-lineage-node-template',
  standalone: false,
  template: `
    <ng-diagram-port [id]="'port-left'" [side]="'left'" [type]="'target'"></ng-diagram-port>
    <span class="lineage-node-label">{{ getLabel() }}</span>
    <ng-diagram-port [id]="'port-right'" [side]="'right'" [type]="'source'"></ng-diagram-port>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 2rem;
        padding: 0.35rem 0.6rem;
        box-sizing: border-box;
        background: var(--lineage-node-bg, #27282b);
        border: 1px solid var(--lineage-node-border, #4d5059);
        border-radius: 0.5rem;
      }
      .lineage-node-label {
        font-size: 0.8125rem;
        font-weight: 500;
        color: #f3f4f6;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ],
})
export class LineageNodeTemplateComponent {
  node = input.required<Node>();

  getLabel(): string {
    const data = this.node()?.data as { label?: string } | undefined;
    return data?.label ?? '';
  }

  @HostBinding('class') get hostClasses(): string {
    const type = this.node()?.type ?? 'default';
    return `lineage-node lineage-node--${type}`;
  }
}
