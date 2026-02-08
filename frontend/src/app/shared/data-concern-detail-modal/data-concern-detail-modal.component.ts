/**
 * Modal that displays a single data concern's details (title, status, description, dates, etc.).
 * Used globally from layout (DataConcernModalService) and from detail panels. close() and
 * overlay click emit openChange(false).
 */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataConcern } from '../../core/api.service';

@Component({
  selector: 'app-data-concern-detail-modal',
  templateUrl: './data-concern-detail-modal.component.html',
  styleUrls: ['./data-concern-detail-modal.component.css'],
})
export class DataConcernDetailModalComponent {
  @Input() concern: DataConcern | null = null;
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  close(): void {
    this.open = false;
    this.openChange.emit(false);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('data-concern-modal-overlay')) {
      this.close();
    }
  }

  formatDate(value: string | undefined): string {
    if (!value) return '—';
    try {
      const d = new Date(value);
      return isNaN(d.getTime()) ? value : d.toLocaleString();
    } catch {
      return value;
    }
  }
}
