import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { selectApplications, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { Application } from '../../core/api.service';
import { DetailRow } from '../../shared/detail-modal/detail-modal.component';

@Component({
  selector: 'app-applications-page',
  templateUrl: './applications-page.component.html',
  styleUrls: ['./applications-page.component.css'],
})
export class ApplicationsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  applications: Application[] = [];
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
        if (domainId != null) this.store.dispatch(AppActions.loadApplications({ domainId }));
      });
    combineLatest([
      this.store.select(selectApplications),
      this.store.select(selectLoading('applications')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([list, loading]) => {
        this.applications = list;
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDetail(item: Application): void {
    this.modalTitle = item.name;
    this.modalRows = [
      { label: 'ID', value: item.id },
      { label: 'Name', value: item.name },
      { label: 'Description', value: item.description },
    ];
    this.modalOpen = true;
  }
}
