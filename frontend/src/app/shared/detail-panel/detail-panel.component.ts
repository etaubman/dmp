import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DetailRow } from '../detail-modal/detail-modal.component';

@Component({
  selector: 'app-detail-panel',
  templateUrl: './detail-panel.component.html',
  styleUrls: ['./detail-panel.component.css'],
})
export class DetailPanelComponent {
  @Input() title = 'Details';
  @Input() rows: DetailRow[] = [];
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  close(): void {
    this.open = false;
    this.openChange.emit(false);
  }
}
