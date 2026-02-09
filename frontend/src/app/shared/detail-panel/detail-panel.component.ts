/**
 * Side detail panel: shows title, optional rows (label/value), and optional lists of data elements,
 * concerns, endpoints, DQ rules, DQ rule instances, SORs as clickable cards. Emits concernClick,
 * endpointClick, dqRuleClick, dataElementClick, instanceCardClick so the parent can open modals or
 * load instance detail (e.g. prettified SQL). open/openChange control visibility.
 */
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { DetailRow } from '../detail-modal/detail-modal.component';
import {
  DataConcern,
  Endpoint,
  DataQualityRule,
  DataElementSORSummary,
  DataElement,
  DataQualityRuleInstance,
} from '../../core/api.service';

@Component({
  selector: 'app-detail-panel',
  templateUrl: './detail-panel.component.html',
  styleUrls: ['./detail-panel.component.css'],
})
export class DetailPanelComponent {
  @Input() title = 'Details';
  @Input() rows: DetailRow[] = [];
  @Input() dataElements: DataElement[] = [];
  @Input() concerns: DataConcern[] = [];
  @Input() endpoints: Endpoint[] = [];
  @Input() dqRules: DataQualityRule[] = [];
  /** When set, show rule instance cards; used on DQ Rules page. */
  @Input() dqRuleInstances: DataQualityRuleInstance[] | null = null;
  @Input() instancesLoading = false;
  @Input() sors: DataElementSORSummary[] = [];
  /** Data feed data elements (for Data Feeds page). */
  @Input() feedDataElements: { id: number; name: string; description?: string }[] = [];
  /** Data feed controls (for Data Feeds page). */
  @Input() feedControls: { id: number; control_type?: string; name: string; description?: string }[] = [];
  @Input() open = false;
  /** When true, panel takes 50% width (e.g. on DQ Rules page); otherwise ~33%. */
  @Input() wide = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() dataElementClick = new EventEmitter<DataElement>();
  @Output() concernClick = new EventEmitter<DataConcern>();
  @Output() endpointClick = new EventEmitter<Endpoint>();
  @Output() dqRuleClick = new EventEmitter<DataQualityRule>();
  @Output() instanceCardClick = new EventEmitter<DataQualityRuleInstance>();
  /** Data feed data element card clicked (payload: { id, name, description? }). */
  @Output() feedDataElementClick = new EventEmitter<{ id: number; name: string; description?: string }>();
  /** Data feed control card clicked (payload: { id, control_type?, name, description? }). */
  @Output() feedControlClick = new EventEmitter<{ id: number; control_type?: string; name: string; description?: string }>();

  @HostBinding('class.detail-panel-open') get isPanelOpen(): boolean {
    return this.open;
  }

  @HostBinding('class.detail-panel-wide') get isPanelWide(): boolean {
    return this.wide;
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

  onDataElementCardClick(element: DataElement): void {
    this.dataElementClick.emit(element);
  }

  onInstanceCardClick(inst: DataQualityRuleInstance): void {
    this.instanceCardClick.emit(inst);
  }

  onFeedDataElementCardClick(de: { id: number; name: string; description?: string }): void {
    this.feedDataElementClick.emit(de);
  }

  onFeedControlCardClick(c: { id: number; control_type?: string; name: string; description?: string }): void {
    this.feedControlClick.emit(c);
  }
}
