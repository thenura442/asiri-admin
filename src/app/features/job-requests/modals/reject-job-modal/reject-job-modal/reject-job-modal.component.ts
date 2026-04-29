import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { JobRequestService } from '../../../services/job-request/job-request.service';
import { NotificationService } from '@core/services/notification/notification.service';

@Component({
  selector: 'app-reject-job-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reject-job-modal.component.html',
  styleUrl: './reject-job-modal.component.scss'
})
export class RejectJobModalComponent {
  jobId     = input<string>('');
  jobNumber = input<string>('');
  closed    = output<void>();
  rejected  = output<void>();

  private jobSvc       = inject(JobRequestService);
  private notification = inject(NotificationService);

  isSubmitting = signal(false);
  errors       = signal<Record<string, string>>({});
  reason       = signal('');
  notes        = signal('');

  reasons = [
    'No drivers available', 'No sample bottles', 'Equipment unavailable',
    'Branch closing', 'Customer not prepared', 'Other'
  ];

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  onReasonChange(v: string): void { this.reason.set(v); this.clearError('reason'); }
  onNotesChange(v: string):  void { this.notes.set(v);  this.clearError('notes'); }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.reason())        e['reason'] = 'Please select a rejection reason';
    if (!this.notes().trim())  e['notes']  = 'Please provide details for the rejection';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  submit(): void {
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please complete all required fields.');
      return;
    }

    this.isSubmitting.set(true);
    this.jobSvc.reject(this.jobId(), {
      reason: `${this.reason()}: ${this.notes().trim()}`
    })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.notification.success('Job Rejected', `Request #${this.jobNumber()} has been rejected.`);
          this.rejected.emit();
          this.closed.emit();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 422) this.notification.error('Invalid State', err.error?.message ?? 'Job cannot be rejected in its current state.');
          else if (err.status === 0) this.notification.error('Connection Error', 'Cannot reach the server.');
          else this.notification.error('Error', err.error?.message ?? 'Failed to reject job.');
        }
      });
  }

  close(): void {
    if (this.isSubmitting()) return;
    this.closed.emit();
  }
}