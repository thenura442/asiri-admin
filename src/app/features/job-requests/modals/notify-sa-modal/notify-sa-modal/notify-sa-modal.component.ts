import { Component, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '@core/services/notification/notification.service';
import { ModalService } from '@shared/services/modal/modal.service';

@Component({
  selector: 'app-notify-sa-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notify-sa-modal.component.html',
  styleUrl: './notify-sa-modal.component.scss'
})
export class NotifySaModalComponent {
  closed    = output<void>();
  submitted = output<void>();

  private notification = inject(NotificationService);

  isSubmitting = signal(false);
  errors       = signal<Record<string, string>>({});

  jobId    = signal('');
  category = signal('');
  details  = signal('');
  urgency  = signal('normal');

  categories = [
    'Vehicle breakdown', 'Driver issue', 'Sample issue',
    'Equipment issue', 'Staff shortage', 'Customer complaint',
    'System error', 'Other'
  ];

  setUrgency(val: string): void { this.urgency.set(val); }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.category()) e['category'] = 'Please select a category';
    if (!this.details().trim()) e['details'] = 'Please provide details about the issue';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  onCategoryChange(v: string): void { this.category.set(v); this.clearError('category'); }
  onDetailsChange(v: string):  void { this.details.set(v);  this.clearError('details'); }

  submit(): void {
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fill in all required fields.');
      return;
    }
    // POST /api/escalations endpoint when backend is ready
    this.notification.success('Escalation Submitted', 'Super Admin has been notified.');
    this.submitted.emit();
    this.closed.emit();
  }

  close(): void { this.closed.emit(); }
}