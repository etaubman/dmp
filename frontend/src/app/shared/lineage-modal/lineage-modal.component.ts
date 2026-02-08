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
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { initializeModel, provideNgDiagram, NgDiagramViewportService } from 'ng-diagram';
import type { ModelAdapter } from 'ng-diagram';
import { ApiService, LineageResponse, LineageNode, LineageEdge, DataElement } from '../../core/api.service';
import { DetailRow } from '../detail-modal/detail-modal.component';


@Component({
  selector: 'app-lineage-modal',
  templateUrl: './lineage-modal.component.html',
  styleUrls: ['./lineage-modal.component.css'],
  providers: [provideNgDiagram()],
})
export class LineageModalComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() dataElement: DataElement | null = null;
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('diagramWrap') diagramWrapRef?: ElementRef<HTMLElement>;

  private api = inject(ApiService);
  private viewportService = inject(NgDiagramViewportService);
  private resizeObserver: ResizeObserver | null = null;

  loading = signal(false);
  error = signal<string | null>(null);
  /** True after lineage has been loaded and model built (so diagram is never shown empty). */
  lineageLoaded = signal(false);
  /** Diagram model created once in injection context; we only update nodes/edges, never call initializeModel again. */
  model = signal<ModelAdapter>(initializeModel({ nodes: [], edges: [] }));
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

  /** Run zoomToFit when viewport has valid size (top-half of modal). */
  private hasCentered = false;
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

  onDiagramInit(): void {
    this.hasCentered = false;
    this.scheduleRecenter();
  }

  /** Schedule zoomToFit so it runs after the diagram viewport has its final size (top-half of modal). */
  private scheduleRecenter(): void {
    const run = (): void => {
      if (!this.hasCentered && this.lineageLoaded() && this.hasNodes()) {
        this.recenter();
        this.hasCentered = true;
      }
    };
    setTimeout(run, 100);
    setTimeout(run, 350);
    setTimeout(run, 600);
  }

  onViewportChanged(event: { viewport: { width?: number; height?: number } }): void {
    const vp = event?.viewport;
    if (this.hasCentered || !vp || vp.width == null || vp.height == null || vp.width <= 0 || vp.height <= 0) return;
    this.hasCentered = true;
    this.recenter();
  }

  recenter(): void {
    this.viewportService.zoomToFit({ padding: 48 });
    // Defer so viewport is updated; then shift view up so graph is centered in the visible top-half
    setTimeout(() => this.correctViewportVerticalOffset(), 0);
  }

  /**
   * Shift the view up so the graph is centered in the diagram area (top half of modal).
   * The library may center for a larger area; we always apply an upward correction using
   * the actual container height.
   */
  private correctViewportVerticalOffset(): void {
    const el = this.diagramWrapRef?.nativeElement;
    if (!el) return;
    const vp = this.viewportService.viewport();
    const rect = el.getBoundingClientRect();
    const actualHeight = rect.height;
    const scale = vp?.scale ?? 1;
    if (actualHeight <= 0 || scale <= 0) return;
    let shiftPx: number;
    const vpHeight = vp?.height ?? 0;
    if (vpHeight > actualHeight) {
      shiftPx = (vpHeight - actualHeight) / 2 + actualHeight * 0.75;
    } else {
      // Library may report same as container; apply upward shift so content centers in top half
      shiftPx = actualHeight * 1.25;
    }
    const dyFlow = shiftPx / scale;
    this.viewportService.moveViewportBy(0, -dyFlow);
  }

  ngAfterViewInit(): void {
    this.observeDiagramSize();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  private observeDiagramSize(): void {
    if (typeof ResizeObserver === 'undefined') return;
    const el = this.diagramWrapRef?.nativeElement;
    if (!el) return;
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.open || !this.lineageLoaded() || !this.hasNodes() || this.hasCentered) return;
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.recenter();
        this.hasCentered = true;
      }
    });
    this.resizeObserver.observe(el);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue && this.dataElement) {
      this.hasCentered = false;
      this.lineageLoaded.set(false);
      this.loadLineage();
    }
    if (changes['open']?.currentValue) {
      setTimeout(() => this.observeDiagramSize(), 100);
    }
    if (!changes['open']?.currentValue) {
      this.resizeObserver?.disconnect();
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
    this.model().updateNodes([]);
    this.model().updateEdges([]);
    this.api.getDataElementLineage(this.dataElement.id).subscribe({
      next: (res) => {
        this.buildModel(res);
        this.loading.set(false);
        // Defer so the diagram is shown after the model update is committed and change detection has run
        setTimeout(() => this.lineageLoaded.set(true), 0);
      },
      error: (err) => {
        this.error.set(err?.message || 'Failed to load lineage');
        this.loading.set(false);
      },
    });
  }

  private buildModel(res: LineageResponse): void {
    const NODE_WIDTH = 140;
    const NODE_HEIGHT = 50;
    const CENTER_X = 380;
    const CENTER_Y = 220;
    const LEFT_X = 120;
    const RIGHT_X = 640;
    const VERTICAL_STEP = 70;

    const upstream: LineageNode[] = res.nodes.filter((n) => n.type === 'domain');
    const center = res.nodes.find((n) => n.type === 'data_element');
    const downstream = res.nodes.filter(
      (n) => n.type !== 'domain' && n.type !== 'data_element'
    );

    const nodes: { id: string; position: { x: number; y: number }; data: { label: string; [k: string]: unknown }; size?: { width: number; height: number } }[] = [];
    const edges: { id: string; source: string; target: string; sourcePort: string; targetPort: string; data: Record<string, unknown> }[] = [];

    res.nodes.forEach((n) => this.nodeMap.set(n.id, n));
    res.edges.forEach((e) => this.edgeMap.set(e.id, e));

    if (center) {
      nodes.push({
        id: center.id,
        position: { x: CENTER_X - NODE_WIDTH / 2, y: CENTER_Y - NODE_HEIGHT / 2 },
        data: { label: center.label, ...center.data },
        size: { width: NODE_WIDTH, height: NODE_HEIGHT },
      });
    }

    upstream.forEach((n, i) => {
      nodes.push({
        id: n.id,
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
        position: {
          x: RIGHT_X - NODE_WIDTH / 2 + col * (NODE_WIDTH + 20),
          y: 80 + row * VERTICAL_STEP + (i % 3) * (VERTICAL_STEP / 2),
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
      position: n.position,
      data: n.data,
      size: n.size ?? { width: NODE_WIDTH, height: NODE_HEIGHT },
      draggable: false,
      resizable: false,
    }));
    // Update existing model (no inject()); never call initializeModel from async code
    this.model().updateNodes(nodePayload);
    this.model().updateEdges(edges);
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
