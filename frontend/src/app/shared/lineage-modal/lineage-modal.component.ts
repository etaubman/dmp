/**
 * Modal that fetches and displays data element lineage as a diagram (ng-diagram).
 * When dataElement and open are set, loads lineage from API and builds nodes/edges; selecting
 * a node or edge shows detail rows in the side panel. Read-only diagram (no drag/link).
 */
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  signal,
  computed,
  inject,
} from '@angular/core';
import { NgDiagramNodeTemplateMap } from 'ng-diagram';
import { ApiService, LineageResponse, LineageNode, LineageEdge, DataElement } from '../../core/api.service';
import { DetailRow } from '../detail-modal/detail-modal.component';
import { LineageNodeTemplateComponent } from './lineage-node-template.component';

@Component({
  selector: 'app-lineage-modal',
  templateUrl: './lineage-modal.component.html',
  styleUrls: ['./lineage-modal.component.css'],
})
export class LineageModalComponent implements OnChanges {
  @Input() dataElement: DataElement | null = null;
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  private api = inject(ApiService);

  loading = signal(false);
  error = signal<string | null>(null);
  /** True after lineage has been loaded and diagram data built (so diagram host is never shown empty). */
  lineageLoaded = signal(false);
  /** Built diagram nodes/edges passed to host so it creates its own model in its injector (fixes reopen). */
  diagramNodes = signal<Array<Record<string, unknown>>>([]);
  diagramEdges = signal<Array<Record<string, unknown>>>([]);
  nodeMap = new Map<string, LineageNode>();
  edgeMap = new Map<string, LineageEdge>();

  selectedDetailTitle = signal<string>('');
  selectedDetailRows = signal<DetailRow[]>([]);

  /** Half of modal for details; show when a node or edge is selected */
  hasSelection = computed(() => this.selectedDetailRows().length > 0 || this.selectedDetailTitle() !== '');

  /** Read-only diagram: no dragging, no resizing, no drawing edges */
  diagramConfig = {
    nodeDraggingEnabled: false,
    linking: {
      validateConnection: () => false,
    },
  };

  /** Custom node templates by lineage type for styling (domain, data_element, dq_rule, endpoint, data_concern) */
  nodeTemplateMap = new NgDiagramNodeTemplateMap([
    ['domain', LineageNodeTemplateComponent],
    ['data_element', LineageNodeTemplateComponent],
    ['dq_rule', LineageNodeTemplateComponent],
    ['endpoint', LineageNodeTemplateComponent],
    ['data_concern', LineageNodeTemplateComponent],
  ]);

  /** True if the pointer was pressed down on the overlay (not on modal content). Used to avoid closing when user releases after dragging. */
  private pointerDownOnOverlay = false;

  hasNodes(): boolean {
    return this.nodeMap.size > 0;
  }

  /** Track where pointer went down so we only close on a real overlay click, not when releasing a drag outside. */
  onOverlayPointerDown(event: MouseEvent): void {
    this.pointerDownOnOverlay = event.target === event.currentTarget;
  }

  /** Only close when the overlay itself was clicked (not when click bubbles from modal, or when user released drag outside). */
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && this.pointerDownOnOverlay) this.close();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue && this.dataElement) {
      this.lineageLoaded.set(false);
      this.diagramNodes.set([]);
      this.diagramEdges.set([]);
      this.loadLineage();
    }
    if (!changes['open']?.currentValue) {
      this.selectedDetailTitle.set('');
      this.selectedDetailRows.set([]);
    }
  }
  loadLineage(): void {
    if (!this.dataElement) return;
    this.loading.set(true);
    this.error.set(null);
    this.nodeMap.clear();
    this.edgeMap.clear();
    this.api.getDataElementLineage(this.dataElement.id).subscribe({
      next: (res) => {
        this.buildModel(res);
        this.loading.set(false);
        // Defer so overlay has layout and diagram host gets a container with size (fixes reopen)
        setTimeout(() => {
          this.lineageLoaded.set(true);
          this.selectCenterNode(res);
        }, 80);
      },
      error: (err) => {
        this.error.set(err?.message || 'Failed to load lineage');
        this.loading.set(false);
      },
    });
  }

  /** Select the center (data element) node so details show by default */
  private selectCenterNode(res: LineageResponse): void {
    const center = res.nodes.find((n) => n.type === 'data_element');
    if (center) {
      this.selectedDetailTitle.set(center.label);
      this.selectedDetailRows.set(this.nodeToRows(center));
    }
  }

  private buildModel(res: LineageResponse): void {
    const NODE_WIDTH = 160;
    const NODE_HEIGHT = 44;
    const CENTER_NODE_WIDTH = 180;
    const CENTER_NODE_HEIGHT = 52;
    const CENTER_X = 400;
    const CENTER_Y = 240;
    const LEFT_X = 100;
    const RIGHT_X = 660;
    const VERTICAL_STEP = 64;

    const upstream: LineageNode[] = res.nodes.filter((n) => n.type === 'domain');
    const center = res.nodes.find((n) => n.type === 'data_element');
    const downstream = res.nodes.filter(
      (n) => n.type !== 'domain' && n.type !== 'data_element'
    );

    const nodes: { id: string; type?: string; position: { x: number; y: number }; data: { label: string; [k: string]: unknown }; size?: { width: number; height: number } }[] = [];
    const edges: { id: string; source: string; target: string; sourcePort: string; targetPort: string; data: Record<string, unknown> }[] = [];

    res.nodes.forEach((n) => this.nodeMap.set(n.id, n));
    res.edges.forEach((e) => this.edgeMap.set(e.id, e));

    if (center) {
      nodes.push({
        id: center.id,
        type: 'data_element',
        position: { x: CENTER_X - CENTER_NODE_WIDTH / 2, y: CENTER_Y - CENTER_NODE_HEIGHT / 2 },
        data: { label: center.label, ...center.data },
        size: { width: CENTER_NODE_WIDTH, height: CENTER_NODE_HEIGHT },
      });
    }

    upstream.forEach((n, i) => {
      nodes.push({
        id: n.id,
        type: n.type,
        position: { x: LEFT_X - NODE_WIDTH / 2, y: CENTER_Y - NODE_HEIGHT / 2 + i * VERTICAL_STEP },
        data: { label: n.label, ...n.data },
        size: { width: NODE_WIDTH, height: NODE_HEIGHT },
      });
    });

    downstream.forEach((n, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      nodes.push({
        id: n.id,
        type: n.type,
        position: {
          x: RIGHT_X - NODE_WIDTH / 2 + col * (NODE_WIDTH + 24),
          y: 72 + row * VERTICAL_STEP + (col === 1 ? VERTICAL_STEP / 3 : 0),
        },
        data: { label: n.label, ...n.data },
        size: { width: NODE_WIDTH, height: NODE_HEIGHT },
      });
    });

    res.edges.forEach((e) => {
      edges.push({
        id: e.id,
        source: e.source,
        target: e.target,
        sourcePort: 'port-right',
        targetPort: 'port-left',
        data: e.data || {},
      });
    });

    const nodePayload = nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
      size: n.size ?? { width: NODE_WIDTH, height: NODE_HEIGHT },
      draggable: false,
      resizable: false,
    }));
    this.diagramNodes.set(nodePayload);
    this.diagramEdges.set(edges);
  }

  onSelectionChanged(event: { selectedNodes?: { id: string }[]; selectedEdges?: { id: string; source: string; target: string }[] }): void {
    const node = event.selectedNodes?.[0];
    const edge = event.selectedEdges?.[0];
    if (node) {
      const lineageNode = this.nodeMap.get(node.id);
      if (lineageNode) {
        this.selectedDetailTitle.set(lineageNode.label);
        this.selectedDetailRows.set(this.nodeToRows(lineageNode));
      }
      return;
    }
    if (edge) {
      const lineageEdge = this.edgeMap.get(edge.id);
      const sourceNode = this.nodeMap.get(edge.source);
      const targetNode = this.nodeMap.get(edge.target);
      this.selectedDetailTitle.set('Connection');
      this.selectedDetailRows.set(
        this.edgeToRows(edge, lineageEdge, sourceNode, targetNode)
      );
      return;
    }
    this.selectedDetailTitle.set('');
    this.selectedDetailRows.set([]);
  }

  private nodeToRows(n: LineageNode): DetailRow[] {
    const rows: DetailRow[] = [{ label: 'Type', value: n.type }];
    Object.entries(n.data || {}).forEach(([k, v]) => {
      if (v != null && String(v).trim() !== '') rows.push({ label: this.formatLabel(k), value: String(v) });
    });
    return rows;
  }

  private edgeToRows(
    edge: { id: string; source: string; target: string },
    lineageEdge: LineageEdge | undefined,
    sourceNode: LineageNode | undefined,
    targetNode: LineageNode | undefined
  ): DetailRow[] {
    const rows: DetailRow[] = [
      { label: 'From', value: sourceNode?.label ?? edge.source },
      { label: 'To', value: targetNode?.label ?? edge.target },
    ];
    if (lineageEdge?.type) rows.push({ label: 'Direction', value: lineageEdge.type });
    return rows;
  }

  private formatLabel(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }

  close(): void {
    this.open = false;
    this.openChange.emit(false);
  }
}
