/**
 * UI to switch the current time period (YTD, MTD, QTD, etc.) via TimePeriodService.
 * Used on metrics/concept views that filter or label data by period.
 */
import { Component } from '@angular/core';
import { TimePeriodService, TimePeriodId, TIME_PERIOD_OPTIONS } from '../../core/time-period.service';

@Component({
  selector: 'app-time-period-switch',
  templateUrl: './time-period-switch.component.html',
  styleUrls: ['./time-period-switch.component.css'],
})
export class TimePeriodSwitchComponent {
  readonly options = TIME_PERIOD_OPTIONS;

  constructor(public timePeriod: TimePeriodService) {}

  select(id: TimePeriodId): void {
    this.timePeriod.setPeriod(id);
  }

  isSelected(id: TimePeriodId): boolean {
    return this.timePeriod.getPeriod() === id;
  }
}
