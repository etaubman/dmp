/**
 * Shared state for the data concern detail modal.
 *
 * Components that want to show a data concern call open(concern); the modal component
 * subscribes to state$ and shows/hides based on open and renders the current concern.
 * close() clears the concern and closes the modal.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataConcern } from './api.service';

export interface DataConcernModalState {
  open: boolean;
  concern: DataConcern | null;
}

@Injectable({ providedIn: 'root' })
export class DataConcernModalService {
  private readonly stateSource = new BehaviorSubject<DataConcernModalState>({ open: false, concern: null });

  readonly state$ = this.stateSource.asObservable();

  open(concern: DataConcern): void {
    this.stateSource.next({ open: true, concern });
  }

  close(): void {
    this.stateSource.next({ open: false, concern: null });
  }
}
