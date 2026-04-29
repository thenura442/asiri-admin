import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LabApprovalService } from '../../../services/lab-approval/lab-approval.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { LabApproval, ReportIssueDto } from '@core/models/lab-approval.model';

@Component({
  selector: 'app-report-issue-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-issue-modal.component.html',
  styleUrl: './report-issue-modal.component.scss'
})
export class ReportIssueModalComponent implements OnInit {
  approval  = input<LabApproval | null>(null);
  closed    = output<void>();
  submitted = output<void>();

  private labSvc       = inject(LabApprovalService);
  private notification = inject(NotificationService);

  isSubmitting   = signal(false);
  errors         = signal<Record<string, string>>({});

  issueCategory  = signal('');
  issueDetails   = signal('');
  affectedTestIds = signal<Set<string>>(new Set());

  issueCategories = [
    'insufficient_quantity',
    'haemolyzed',
    'not_received',
    'equipment_failure',
    'reagent_unavailable',
    'contamination',
    'other',
  ];

  issueCategoryLabel(cat: string): string {
    return {
      insufficient_quantity: 'Insufficient Quantity',
      haemolyzed:            'Haemolyzed Sample',
      not_received:          'Not Received',
      equipment_failure:     'Equipment Failure',
      reagent_unavailable:   'Reagent Unavailable',
      contamination:         'Contamination',
      other:                 'Other',
    }[cat] ?? cat;
  }

  ngOnInit(): void {
    const a = this.approval();
    if (a) {
      // Default all tests as affected
      this.affectedTestIds.set(new Set(a.tests.map(t => t.id)));
    }
  }

  toggleTest(id: string): void {
    const set = new Set(this.affectedTestIds());
    set.has(id) ? set.delete(id) : set.add(id);
    this.affectedTestIds.set(set);
    this.clearError('affectedTests');
  }

  isAffected(id: string): boolean { return this.affectedTestIds().has(id); }

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  onCategoryChange(v: string): void { this.issueCategory.set(v); this.clearError('category'); }
  onDetailsChange(v: string):  void { this.issueDetails.set(v);  this.clearError('details'); }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.issueCategory())                  e['category']      = 'Please select an issue category';
    if (!this.issueDetails().trim())            e['details']       = 'Please describe the issue (minimum 5 characters)';
    else if (this.issueDetails().trim().length < 5) e['details']   = 'Details must be at least 5 characters';
    if (this.affectedTestIds().size === 0)      e['affectedTests'] = 'Please select at least one affected test';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  submit(): void {
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below.');
      return;
    }

    const a = this.approval();
    if (!a) return;

    const dto: ReportIssueDto = {
      jobRequestId:    a.id,
      category:        this.issueCategory(),
      details:         this.issueDetails().trim(),
      affectedTestIds: Array.from(this.affectedTestIds()),
    };

    this.isSubmitting.set(true);
    this.labSvc.reportIssue(dto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.submitted.emit();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server.');
          else if (err.status === 400) this.notification.error('Validation Error', err.error?.message ?? 'Invalid data provided.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to report issue.');
        }
      });
  }

  close(): void {
    if (this.isSubmitting()) return;
    this.closed.emit();
  }
}