import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-table-search-filter',
  templateUrl: './table-search-filter.component.html',
  styleUrls: ['./table-search-filter.component.css'],
})
export class TableSearchFilterComponent {
  @Input() value = '';
  @Input() placeholder = 'Search…';
  @Output() valueChange = new EventEmitter<string>();

  clear(): void {
    this.value = '';
    this.valueChange.emit('');
  }

  onInput(term: string): void {
    this.value = term;
    this.valueChange.emit(term);
  }
}
