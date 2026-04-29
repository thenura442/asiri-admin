import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LabApprovalService, LabApprovalParams } from '../../../services/lab-approval/lab-approval.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { LabApproval } from '@core/models/lab-approval.model';
import { ReceiveSamplesModalComponent } from '../../../modals/receive-samples-modal/receive-samples-modal/receive-samples-modal.component';
import { ReportIssueModalComponent } from '../../../modals/report-issue-modal/report-issue-modal/report-issue-modal.component';
import { StatusLabelPipe } from '@shared/pipes/status-label/status-label.pipe';
import { UploadReportModalComponent } from '@features/lab-approvals/modals/upload-report-modal/upload-report-modal/upload-report-modal.component';
import { JobRequestService } from '@features/job-requests/services/job-request/job-request.service';

interface ApprovalStats {
  pendingReview:   number;
  samplesArriving: number;
  processing:      number;
  completedToday:  number;
}

@Component({
  selector: 'app-lab-approval-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, StatusLabelPipe,
    ReceiveSamplesModalComponent, ReportIssueModalComponent, UploadReportModalComponent
  ],
  templateUrl: './lab-approval-list.component.html',
  styleUrl: './lab-approval-list.component.scss'
})
export class LabApprovalListComponent implements OnInit {
  private labSvc       = inject(LabApprovalService);
  private jobSvc       = inject(JobRequestService);
  private notification = inject(NotificationService);
  private modal        = inject(ModalService);

  activeFilter      = signal('all');
  searchQuery       = signal('');
  isLoading         = signal(false);
  currentPage       = signal(1);
  totalPages        = signal(1);
  totalCount        = signal(0);

  approvals         = signal<LabApproval[]>([]);
  stats             = signal<ApprovalStats>({ pendingReview: 0, samplesArriving: 0, processing: 0, completedToday: 0 });

  receivingApproval = signal<LabApproval | null>(null);
  reportingApproval = signal<LabApproval | null>(null);
  uploadingApproval = signal<LabApproval | null>(null);

  filters = [
    { key: 'all',             label: 'All' },
    { key: 'sent_to_lab',     label: 'Arriving' },
    { key: 'lab_received',    label: 'Received' },
    { key: 'processing',      label: 'Processing' },
    { key: 'report_ready',    label: 'Report Ready' },
    { key: 'report_reviewed', label: 'Reviewed' },
    { key: 'failed',          label: 'Issue' },
  ];

  ngOnInit(): void {
    this.loadApprovals();
  }

  private loadApprovals(): void {
    const filter = this.activeFilter();
    const params: LabApprovalParams = {
      page:   this.currentPage(),
      limit:  10,
      search: this.searchQuery() || undefined,
      status: filter !== 'all' ? filter : undefined,
    };

    this.isLoading.set(true);
    this.labSvc.getAll(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.approvals.set(res.data);
          this.totalCount.set(res.meta.total);
          this.totalPages.set(res.meta.totalPages);
          this.computeStats(res.data);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server. Check your internet.');
          else if (err.status === 403) this.notification.error('Access Denied', 'You do not have permission to view lab approvals.');
          else if (err.status === 500) this.notification.error('Server Error', 'Something went wrong. Please try again.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to load lab approvals.');
        }
      });
  }

  private computeStats(data: LabApproval[]): void {
    this.stats.set({
      samplesArriving: data.filter(a => a.status === 'sent_to_lab').length,
      pendingReview:   data.filter(a => a.status === 'lab_received').length,
      processing:      data.filter(a => a.status === 'processing').length,
      completedToday:  data.filter(a => a.status === 'report_reviewed').length,
    });
  }

  setFilter(key: string): void {
    this.activeFilter.set(key);
    this.currentPage.set(1);
    this.loadApprovals();
  }

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.loadApprovals();
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
    this.loadApprovals();
  }

  get pageRange(): number[] {
    const total   = this.totalPages();
    const current = this.currentPage();
    const start   = Math.max(1, current - 2);
    const end     = Math.min(total, current + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  statusBadgeClass(status: string): string {
    const m: Record<string, string> = {
      sent_to_lab:     'bd-arriving',
      lab_received:    'bd-received',
      processing:      'bd-processing',
      report_ready:    'bd-alloc',
      report_reviewed: 'bd-done',
      failed:          'bd-rej',
    };
    return m[status] ?? 'bd-gray';
  }

  statusLabel(status: string): string {
    const m: Record<string, string> = {
      sent_to_lab:     'Arriving',
      lab_received:    'Received',
      processing:      'Processing',
      report_ready:    'Report Ready',
      report_reviewed: 'Reviewed',
      failed:          'Issue',
    };
    return m[status] ?? status;
  }

  canReceive(status: string):  boolean { return status === 'sent_to_lab'; }
  canProcess(status: string):  boolean { return status === 'lab_received'; }
  canUpload(status: string):   boolean { return status === 'processing'; }
  canReview(status: string):   boolean { return status === 'report_ready'; }
  hasIssue(status: string):    boolean { return status === 'failed'; }

  openReceive(a: LabApproval): void { this.receivingApproval.set(a); }
  closeReceive(): void               { this.receivingApproval.set(null); }
  openReport(a: LabApproval):  void { this.reportingApproval.set(a); }
  closeReport(): void                { this.reportingApproval.set(null); }
  openUpload(a: LabApproval):  void { this.uploadingApproval.set(a); }
  closeUpload(): void                { this.uploadingApproval.set(null); }

  onSamplesReceived(): void {
    this.notification.success('Samples Received', 'Samples have been confirmed and marked as received.');
    this.closeReceive();
    this.loadApprovals();
  }

  onIssueReported(): void {
    this.notification.success('Issue Reported', 'The lab issue has been escalated successfully.');
    this.closeReport();
    this.loadApprovals();
  }

  onReportUploaded(): void {
    this.notification.success('Report Uploaded', 'The lab report has been uploaded successfully.');
    this.closeUpload();
    this.loadApprovals();
  }

  startProcessing(a: LabApproval): void {
    this.modal.confirm({
      title:        'Start Processing',
      message:      `Start processing samples for request #${a.requestNumber}?`,
      confirmLabel: 'Start Processing',
    }).subscribe(ok => {
      if (!ok) return;
      this.jobSvc.updateStatus(a.id, 'processing').subscribe({
        next: () => {
          this.notification.success('Processing Started', `Samples for #${a.requestNumber} are now being processed.`);
          this.loadApprovals();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 422)    this.notification.error('Invalid Transition', err.error?.message ?? 'Cannot start processing in the current state.');
          else if (err.status === 0) this.notification.error('Connection Error', 'Cannot reach the server.');
          else                       this.notification.error('Error', err.error?.message ?? 'Failed to start processing.');
        }
      });
    });
  }

  reviewReport(a: LabApproval): void {
    this.modal.confirm({
      title:        'Review Report',
      message:      `Mark report for #${a.requestNumber} as reviewed? This will notify the patient.`,
      confirmLabel: 'Confirm Review',
    }).subscribe(ok => {
      if (!ok) return;
      this.labSvc.reviewReport(a.id).subscribe({
        next: () => {
          this.notification.success('Report Reviewed', `Report for #${a.requestNumber} has been reviewed.`);
          this.loadApprovals();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404)    this.notification.error('Not Found', 'Job not found or not in report ready state.');
          else if (err.status === 0) this.notification.error('Connection Error', 'Cannot reach the server.');
          else                       this.notification.error('Error', err.error?.message ?? 'Failed to review report.');
        }
      });
    });
  }
}