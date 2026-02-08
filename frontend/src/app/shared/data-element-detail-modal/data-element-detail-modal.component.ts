import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataElement } from '../../core/api.service';

@Component({
  selector: 'app-data-element-detail-modal',
  templateUrl: './data-element-detail-modal.component.html',
  styleUrls: ['./data-element-detail-modal.component.css'],
})
export class DataElementDetailModalComponent {
  @Input() dataElement: DataElement | null = null;
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  close(): void {
    this.open = false;
    this.openChange.emit(false);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('data-element-modal-overlay')) {
      this.close();
    }
  }
}
