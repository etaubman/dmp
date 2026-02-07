import { Component, Input } from '@angular/core';

export interface MetricItem {
  label: string;
  value: number | string;
}

@Component({
  selector: 'app-concept-metrics',
  templateUrl: './concept-metrics.component.html',
  styleUrls: ['./concept-metrics.component.css'],
})
export class ConceptMetricsComponent {
  @Input() metrics: MetricItem[] = [];
}
