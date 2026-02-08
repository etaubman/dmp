import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { DetailRow } from '../detail-modal/detail-modal.component';
import { DataConcern, Endpoint, DataQualityRule, DataElementSORSummary } from '../../core/api.service';

@Component({
  selector: 'app-detail-panel',
  templateUrl: './detail-panel.component.html',
  styleUrls: ['./detail-panel.component.css'],
})
export class DetailPanelComponent {
  @Input() title = 'Details';
  @Input() rows: DetailRow[] = [];
  @Input() concerns: DataConcern[] = [];
  @Input() endpoints: Endpoint[] = [];
  @Input() dqRules: DataQualityRule[] = [];
  @Input() sors: DataElementSORSummary[] = [];
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() concernClick = new EventEmitter<DataConcern>();
  @Output() endpointClick = new EventEmitter<Endpoint>();
  @Output() dqRuleClick = new EventEmitter<DataQualityRule>();

  @HostBinding('class.detail-panel-open') get isPanelOpen(): boolean {
    return this.open;
  }

  close(): void {
    this.open = false;
    this.openChange.emit(false);
  }

  onConcernCardClick(concern: DataConcern): void {
    this.concernClick.emit(concern);
  }

  onEndpointCardClick(ep: Endpoint): void {
    this.endpointClick.emit(ep);
  }

  onDqRuleCardClick(rule: DataQualityRule): void {
    this.dqRuleClick.emit(rule);
  }
}
