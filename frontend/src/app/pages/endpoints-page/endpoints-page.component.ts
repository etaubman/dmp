import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { selectEndpoints, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { Endpoint } from '../../core/api.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';

@Component({
  selector: 'app-endpoints-page',
  templateUrl: './endpoints-page.component.html',
  styleUrls: ['./endpoints-page.component.css'],
})
export class EndpointsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  endpoints: Endpoint[] = [];
  loading = false;
  modalOpen = false;
  modalRows: DetailRow[] = [];
  modalTitle = '';

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store
      .select(selectCurrentDomainId)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((domainId) => {
        if (domainId != null) this.store.dispatch(AppActions.loadEndpoints({ domainId }));
      });
    combineLatest([
      this.store.select(selectEndpoints),
      this.store.select(selectLoading('endpoints')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([list, loading]) => {
        this.endpoints = list;
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDetail(item: Endpoint): void {
    this.modalTitle = item.name;
    this.modalRows = [
      { label: 'ID', value: item.id },
      { label: 'Name', value: item.name },
      { label: 'Description', value: item.description },
      { label: 'Domain ID', value: item.domain_id },
      { label: 'Application ID', value: item.application_id },
    ];
    this.modalOpen = true;
  }
}
