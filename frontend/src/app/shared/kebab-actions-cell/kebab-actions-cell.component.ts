import {
  Component,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
  Renderer2,
  OnDestroy,
} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

const MENU_CLASS = 'kebab-actions-cell-menu';
const KEBAB_CLOSE_OTHERS_EVENT = 'kebab-actions-close-others';

@Component({
  selector: 'app-kebab-actions-cell',
  template: `
    <div class="kebab-wrapper">
      <button
        type="button"
        class="kebab-btn"
        (click)="toggleMenu($event)"
        [attr.aria-expanded]="menuOpen"
        aria-haspopup="true"
        aria-label="Actions"
        title="Actions"
      >
        <span class="kebab-dots" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
      </button>
    </div>
  `,
  styles: [
    `
      .kebab-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        height: 100%;
      }
      .kebab-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.35rem;
        background: transparent;
        color: var(--text-muted, #9ca3af);
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .kebab-btn:hover {
        color: var(--text-primary, #f3f4f6);
        background: rgba(255, 255, 255, 0.06);
      }
      .kebab-dots {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      .kebab-dots span {
        display: block;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: currentColor;
      }
    `,
  ],
})
export class KebabActionsCellComponent implements ICellRendererAngularComp, OnDestroy {
  menuOpen = false;
  private menuEl: HTMLElement | null = null;

  constructor(
    private el: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}

  agInit(_params: ICellRendererParams): void {}

  refresh(): boolean {
    return false;
  }

  ngOnDestroy(): void {
    this.removeMenu();
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const btn = event.currentTarget as HTMLElement;
    if (this.menuOpen) {
      this.removeMenu();
      this.menuOpen = false;
    } else {
      const doc = this.el.nativeElement.ownerDocument;
      doc.dispatchEvent(new CustomEvent(KEBAB_CLOSE_OTHERS_EVENT));
      const rect = btn.getBoundingClientRect();
      this.menuOpen = true;
      this.showMenuAt(rect.left, rect.bottom + 2);
    }
    this.cdr.detectChanges();
  }

  private showMenuAt(left: number, top: number): void {
    this.removeMenu();
    const doc = this.renderer.parentNode(this.el.nativeElement).ownerDocument;
    const menu = this.renderer.createElement('div');
    this.renderer.addClass(menu, MENU_CLASS);
    this.renderer.setStyle(menu, 'position', 'fixed');
    this.renderer.setStyle(menu, 'left', `${left}px`);
    this.renderer.setStyle(menu, 'top', `${top}px`);
    this.renderer.setStyle(menu, 'z-index', '10000');
    this.renderer.setStyle(menu, 'min-width', '120px');
    this.renderer.setStyle(menu, 'padding', '0.5rem 0');
    this.renderer.setStyle(menu, 'background', 'var(--bg-card, #181b20)');
    this.renderer.setStyle(menu, 'border', '1px solid var(--border, rgba(255, 255, 255, 0.06))');
    this.renderer.setStyle(menu, 'border-radius', '6px');
    this.renderer.setStyle(menu, 'box-shadow', '0 4px 12px rgba(0, 0, 0, 0.3)');
    const title = this.renderer.createElement('div');
    this.renderer.setStyle(title, 'padding', '0.35rem 0.75rem');
    this.renderer.setStyle(title, 'font-size', '0.8125rem');
    this.renderer.setStyle(title, 'font-weight', '500');
    this.renderer.setStyle(title, 'color', 'var(--text-muted, #9ca3af)');
    this.renderer.appendChild(title, this.renderer.createText('Actions'));
    this.renderer.appendChild(menu, title);
    this.renderer.listen(menu, 'click', (e: MouseEvent) => e.stopPropagation());
    this.renderer.appendChild(doc.body, menu);
    this.menuEl = menu;
  }

  private removeMenu(): void {
    if (this.menuEl?.parentNode) {
      this.renderer.removeChild(this.menuEl.parentNode, this.menuEl);
      this.menuEl = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.el.nativeElement.contains(target)) return;
    if (target?.closest?.(`.${MENU_CLASS}`)) return;
    this.closeMenu();
  }

  @HostListener('document:kebab-actions-close-others')
  onCloseOthers(): void {
    this.closeMenu();
  }

  private closeMenu(): void {
    this.removeMenu();
    this.menuOpen = false;
    this.cdr.detectChanges();
  }
}
