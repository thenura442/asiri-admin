import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LabApprovalService } from '../../../services/lab-approval/lab-approval.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { FileUploadComponent, UploadedFile } from '@shared/components/ui/file-upload/file-upload/file-upload.component';
import { LabApproval, UploadReportDto } from '@core/models/lab-approval.model';

interface TestUploadItem {
  id:              string;
  name:            string;
  code:            string;
  reportUrl:       string | null;
  isCriticalValue: boolean;
  criticalNotes:   string;
}

@Component({
  selector: 'app-upload-report-modal',
  standalone: true,
  imports: [CommonModule, FileUploadComponent],
  templateUrl: './upload-report-modal.component.html',
  styleUrl: './upload-report-modal.component.scss'
})
export class UploadReportModalComponent implements OnInit {
  approval = input<LabApproval | null>(null);
  closed   = output<void>();
  uploaded = output<void>();

  private labSvc       = inject(LabApprovalService);
  private notification = inject(NotificationService);

  isSubmitting = signal(false);
  errors       = signal<Record<string, string>>({});
  testItems    = signal<TestUploadItem[]>([]);

  ngOnInit(): void {
    const a = this.approval();
    if (a) {
      this.testItems.set(
        a.tests.map(t => ({
          id:              t.id,
          name:            t.test.name,
          code:            t.test.code,
          reportUrl:       t.reportUrl,
          isCriticalValue: false,
          criticalNotes:   '',
        }))
      );
    }
  }

  onReportUpload(testId: string, event: UploadedFile): void {
    // Use file name as placeholder URL until real storage is wired
    const url = event.file.name;
    this.testItems.update(list =>
      list.map(t => t.id === testId ? { ...t, reportUrl: url } : t)
    );
    this.clearError(`report_${testId}`);
  }

  toggleCritical(testId: string): void {
    this.testItems.update(list =>
      list.map(t => t.id === testId ? { ...t, isCriticalValue: !t.isCriticalValue } : t)
    );
  }

  onCriticalNotes(testId: string, val: string): void {
    this.testItems.update(list =>
      list.map(t => t.id === testId ? { ...t, criticalNotes: val } : t)
    );
  }

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  private validate(): boolean {
    const e: Record<string, string> = {};
    this.testItems().forEach(t => {
      if (!t.reportUrl) e[`report_${t.id}`] = `Please upload a report for ${t.name}`;
    });
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  submit(): void {
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please upload reports for all tests.');
      return;
    }

    const a = this.approval();
    if (!a) return;

    const items = this.testItems();
    this.isSubmitting.set(true);
    let completed = 0;
    let hasError  = false;

    items.forEach(t => {
      const dto: UploadReportDto = {
        jobRequestTestId: t.id,        // ← back in body
        reportUrl:        t.reportUrl!,
        isCriticalValue:  t.isCriticalValue,
        // criticalNotes removed
      };

      this.labSvc.uploadReport(a.id, t.id, dto).subscribe({
        next: () => {
          completed++;
          if (completed === items.length && !hasError) {
            this.isSubmitting.set(false);
            this.uploaded.emit();
          }
        },
        error: (err: HttpErrorResponse) => {
          if (!hasError) {
            hasError = true;
            this.isSubmitting.set(false);
            if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server.');
            else if (err.status === 400) this.notification.error('Validation Error', err.error?.message ?? 'Invalid report data.');
            else                         this.notification.error('Error', err.error?.message ?? `Failed to upload report for ${t.name}.`);
          }
        }
      });
    });
  }

  close(): void {
    if (this.isSubmitting()) return;
    this.closed.emit();
  }
}