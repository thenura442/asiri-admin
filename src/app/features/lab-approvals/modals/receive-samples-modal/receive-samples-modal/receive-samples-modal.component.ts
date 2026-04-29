import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LabApprovalService } from '../../../services/lab-approval/lab-approval.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { LabApproval, ReceiveSamplesDto } from '@core/models/lab-approval.model';

interface TestReceiptItem {
  id:                string;
  name:              string;
  code:              string;
  received:          boolean;
  notReceivedReason: string;
  notes:             string;
}

@Component({
  selector: 'app-receive-samples-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receive-samples-modal.component.html',
  styleUrl: './receive-samples-modal.component.scss'
})
export class ReceiveSamplesModalComponent implements OnInit {
  approval  = input<LabApproval | null>(null);
  closed    = output<void>();
  confirmed = output<void>();

  private labSvc       = inject(LabApprovalService);
  private notification = inject(NotificationService);

  isSubmitting    = signal(false);
  errors          = signal<Record<string, string>>({});
  sampleCondition = signal<'good' | 'compromised' | 'rejected'>('good');
  receivedBy      = signal('');
  overallNotes    = signal('');
  testItems       = signal<TestReceiptItem[]>([]);

  ngOnInit(): void {
    const a = this.approval();
    if (a) {
      this.testItems.set(
        a.tests.map(t => ({
          id:                t.id,
          name:              t.test.name,
          code:              t.test.code,
          received:          true,
          notReceivedReason: '',
          notes:             '',
        }))
      );
    }
  }

  toggleReceived(id: string): void {
    this.testItems.update(list =>
      list.map(t => t.id === id ? { ...t, received: !t.received, notReceivedReason: '' } : t)
    );
  }

  onNotReceivedReason(id: string, val: string): void {
    this.testItems.update(list =>
      list.map(t => t.id === id ? { ...t, notReceivedReason: val } : t)
    );
    this.clearError(`reason_${id}`);
  }

  onTestNotes(id: string, val: string): void {
    this.testItems.update(list =>
      list.map(t => t.id === id ? { ...t, notes: val } : t)
    );
  }

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  private validate(): boolean {
    const e: Record<string, string> = {};
    this.testItems().filter(t => !t.received).forEach(t => {
      if (!t.notReceivedReason.trim()) {
        e[`reason_${t.id}`] = 'Please provide a reason for not receiving this sample';
      }
    });
    if (this.testItems().length === 0) e['general'] = 'No tests found for this approval';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  confirm(): void {
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please provide reasons for any unreceived samples.');
      return;
    }

    const a = this.approval();
    if (!a) return;

    const items = this.testItems();

    const dto: ReceiveSamplesDto = {
      jobRequestId:      a.id,
      samples:           items.map(t => ({
        jobRequestTestId:  t.id,
        received:          t.received,
        notReceivedReason: t.received ? null : t.notReceivedReason.trim(),
        notes:             t.notes.trim() || null,
      })),
      jobRequestTestIds: items.filter(t => t.received).map(t => t.id),
      overallNotes:      this.overallNotes().trim() || null,
    };

    this.isSubmitting.set(true);
    this.labSvc.receiveSamples(dto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => { this.confirmed.emit(); },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server.');
          else if (err.status === 422) this.notification.error('Invalid State', err.error?.message ?? 'Samples cannot be received in the current job state.');
          else if (err.status === 400) this.notification.error('Validation Error', err.error?.message ?? 'Invalid data provided.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to confirm sample receipt.');
        }
      });
  }

  close(): void {
    if (this.isSubmitting()) return;
    this.closed.emit();
  }
}