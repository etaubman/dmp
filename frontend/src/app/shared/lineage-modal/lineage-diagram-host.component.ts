/**
 * Wraps ng-diagram with its own provideNgDiagram() and creates its own model from
 * nodes/edges so each open gets a fresh diagram and model in the same injector.
 */
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { provideNgDiagram, NgDiagramViewportService, NgDiagramNodeTemplateMap, initializeModel } from 'ng-diagram';
import type { ModelAdapter } from 'ng-diagram';

@Component({
  selector: 'app-lineage-diagram-host',
  templateUrl: './lineage-diagram-host.component.html',
  styleUrls: ['./lineage-modal.component.css'],
  providers: [provideNgDiagram()],
})
export class LineageDiagramHostComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() nodes: Array<Record<string, unknown>> = [];
  @Input() edges: Array<Record<string, unknown>> = [];
  @Input() config!: Record<string, unknown>;
  @Input() nodeTemplateMap!: NgDiagramNodeTemplateMap;
  @Output() selectionChanged = new EventEmitter<{ selectedNodes?: { id: string }[]; selectedEdges?: { id: string; source: string; target: string }[] }>();

  @ViewChild('diagramWrap') diagramWrapRef?: ElementRef<HTMLElement>;

  /** Model created in this component's injector so diagram always has a fresh model. */
  model = signal<ModelAdapter | null>(null);

  private injector = inject(Injector);
  private viewportService = inject(NgDiagramViewportService);
  private resizeObserver: ResizeObserver | null = null;
  private hasCentered = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodes'] || changes['edges']) {
      // Defer until after layout so the container has real dimensions before ng-diagram mounts (fixes black canvas)
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => this.createModelFromInputs());
      } else {
        setTimeout(() => this.createModelFromInputs(), 0);
      }
    }
  }

  private createModelFromInputs(): void {
    const n = this.nodes?.length ? this.nodes : [];
    const e = this.edges ?? [];
    if (n.length === 0) return;
    // initializeModel() uses inject() and must run in an injection context
    runInInjectionContext(this.injector, () => {
      this.model.set(initializeModel({ nodes: n as never, edges: e as never }));
    });
  }

  onDiagramInit(): void {
    this.hasCentered = false;
    this.scheduleRecenter();
  }

  onViewportChanged(event: { viewport: { width?: number; height?: number } }): void {
    const vp = event?.viewport;
    if (this.hasCentered || !vp || vp.width == null || vp.height == null || vp.width <= 0 || vp.height <= 0) return;
    this.hasCentered = true;
    this.recenter();
  }

  onSelectionChanged(event: { selectedNodes?: { id: string }[]; selectedEdges?: { id: string; source: string; target: string }[] }): void {
    this.selectionChanged.emit(event);
  }

  recenter(): void {
    this.viewportService.zoomToFit({ padding: 48 });
    setTimeout(() => this.correctViewportVerticalOffset(), 0);
  }

  private scheduleRecenter(): void {
    const run = (): void => {
      if (!this.hasCentered && this.diagramWrapRef?.nativeElement) {
        const rect = this.diagramWrapRef.nativeElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.recenter();
          this.hasCentered = true;
        }
      }
    };
    setTimeout(run, 100);
    setTimeout(run, 350);
    setTimeout(run, 600);
  }

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
      shiftPx = actualHeight * 1.25;
    }
    const dyFlow = shiftPx / scale;
    this.viewportService.moveViewportBy(0, -dyFlow);
  }

  ngAfterViewInit(): void {
    if (typeof ResizeObserver === 'undefined') return;
    const el = this.diagramWrapRef?.nativeElement;
    if (!el) return;
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.hasCentered) return;
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) this.recenter();
    });
    this.resizeObserver.observe(el);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }
}
