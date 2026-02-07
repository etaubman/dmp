import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type TimePeriodId = 'ytd' | 'prior_year' | 'mtd' | 'qtd' | 'rolling_12';

export interface TimePeriodOption {
  id: TimePeriodId;
  label: string;
}

export const TIME_PERIOD_OPTIONS: TimePeriodOption[] = [
  { id: 'ytd', label: 'YTD' },
  { id: 'prior_year', label: 'Prior Year' },
  { id: 'mtd', label: 'MTD' },
  { id: 'qtd', label: 'QTD' },
  { id: 'rolling_12', label: 'Rolling 12' },
];

@Injectable({ providedIn: 'root' })
export class TimePeriodService {
  private readonly current = new BehaviorSubject<TimePeriodId>('ytd');
  readonly currentPeriod$ = this.current.asObservable();

  setPeriod(period: TimePeriodId): void {
    this.current.next(period);
  }

  getPeriod(): TimePeriodId {
    return this.current.value;
  }
}
