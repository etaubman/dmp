/**
 * Admin bulk upload/download page: select entity type, upload a file (calls ApiService.uploadBulk),
 * or get download URL (optionally with domain_id for domain-scoped entities). Displays upload
 * result (created/updated counts and per-row errors).
 */
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { selectCurrentDomainId } from '../../store/app.selectors';

const ENTITY_TYPES = [
  'domains',
  'data_elements',
  'applications',
  'eucs',
  'endpoints',
  'data_quality_rules',
  'data_quality_exceptions',
  'data_concerns',
] as const;

@Component({
  selector: 'app-bulk-page',
  templateUrl: './bulk-page.component.html',
  styleUrls: ['./bulk-page.component.css'],
})
export class BulkPageComponent {
  entityTypes = ENTITY_TYPES;
  selectedEntityType = 'data_elements';
  selectedFile: File | null = null;
  uploading = false;
  result: { created: number; updated: number; errors: { row: number; error: string }[] } | null = null;
  currentDomainId$!: Observable<number | null>;

  constructor(
    private store: Store,
    private api: ApiService,
  ) {
    this.currentDomainId$ = this.store.select(selectCurrentDomainId);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.result = null;
  }

  upload(): void {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.result = null;
    this.api.uploadBulk(this.selectedEntityType, this.selectedFile).subscribe({
      next: (res) => {
        this.result = res;
        this.uploading = false;
      },
      error: () => {
        this.uploading = false;
        this.result = { created: 0, updated: 0, errors: [{ row: 0, error: 'Upload failed' }] };
      },
    });
  }

  downloadUrl(entityType: string): string {
    return this.api.downloadBulk(entityType);
  }

  downloadUrlWithDomain(entityType: string, domainId: number): string {
    return this.api.downloadBulk(entityType, domainId);
  }
}
