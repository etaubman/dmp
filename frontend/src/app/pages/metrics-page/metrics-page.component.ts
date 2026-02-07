import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, takeUntil, Subject } from 'rxjs';
import { selectMetrics, selectCurrentDomainId, selectLoading } from '../../store/app.selectors';
import * as AppActions from '../../store/app.actions';
import { Metrics } from '../../core/api.service';

@Component({
  selector: 'app-metrics-page',
  templateUrl: './metrics-page.component.html',
  styleUrls: ['./metrics-page.component.css'],
})
export class MetricsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  metrics: Metrics | null = null;
  loading = false;
  domainId: number | null = null;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.select(selectCurrentDomainId).pipe(takeUntil(this.destroy$)).subscribe((id) => {
      this.domainId = id;
      this.store.dispatch(AppActions.loadMetrics({ domainId: id ?? undefined }));
    });
    combineLatest([
      this.store.select(selectMetrics),
      this.store.select(selectLoading('metrics')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([metrics, loading]) => {
        this.metrics = metrics;
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
