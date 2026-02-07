import { Component } from '@angular/core';
import { DataConcernModalService } from '../core/data-concern-modal.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  constructor(public concernModal: DataConcernModalService) {}

  onConcernModalOpenChange(open: boolean): void {
    if (!open) this.concernModal.close();
  }
}
