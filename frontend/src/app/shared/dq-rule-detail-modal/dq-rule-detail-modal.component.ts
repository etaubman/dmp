import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataQualityRule } from '../../core/api.service';

@Component({
  selector: 'app-dq-rule-detail-modal',
  templateUrl: './dq-rule-detail-modal.component.html',
  styleUrls: ['./dq-rule-detail-modal.component.css'],
})
export class DqRuleDetailModalComponent {
  @Input() rule: DataQualityRule | null = null;
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  close(): void {
    this.open = false;
    this.openChange.emit(false);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dq-rule-modal-overlay')) {
      this.close();
    }
  }
}
