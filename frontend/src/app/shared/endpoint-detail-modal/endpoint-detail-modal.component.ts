/**
 * Modal that displays a single endpoint's details (name, description, domain_id, application_id, etc.).
 * Used from data-elements-page and endpoints-page detail panels when user clicks an endpoint. close() and overlay emit openChange(false).
 */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Endpoint } from '../../core/api.service';

@Component({
  selector: 'app-endpoint-detail-modal',
  templateUrl: './endpoint-detail-modal.component.html',
  styleUrls: ['./endpoint-detail-modal.component.css'],
})
export class EndpointDetailModalComponent {
  @Input() endpoint: Endpoint | null = null;
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  close(): void {
    this.open = false;
    this.openChange.emit(false);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('endpoint-modal-overlay')) {
      this.close();
    }
  }
}
