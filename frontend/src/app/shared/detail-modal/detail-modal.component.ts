import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface DetailRow {
  label: string;
  value: string | number | null | undefined;
}

@Component({
  selector: 'app-detail-modal',
  templateUrl: './detail-modal.component.html',
  styleUrls: ['./detail-modal.component.css'],
})
export class DetailModalComponent {
  @Input() title = 'Details';
  @Input() rows: DetailRow[] = [];
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  close(): void {
    this.open = false;
    this.openChange.emit(false);
  }
}
