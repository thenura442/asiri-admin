import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { JobRequestService, JobParams } from '../../../services/job-request/job-request.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { JobListItem } from '@core/models/job-request.model';
import { JobStatus } from '@core/enums/job-status.enum';
import { TimeAgoPipe } from '@shared/pipes/time-ago/time-ago.pipe';
import { StatusLabelPipe } from '@shared/pipes/status-label/status-label.pipe';
import { AllocateVehicleModalComponent } from '../../../modals/allocate-vehicle-modal/allocate-vehicle-modal/allocate-vehicle-modal.component';

interface JobSummary {
  unallocated:    number;
  onMission:      number;
  urgent:         number;
  completedToday: number;
}

@Component({
  selector: 'app-job-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe, StatusLabelPipe, AllocateVehicleModalComponent],
  templateUrl: './job-request-list.component.html',
  styleUrl: './job-request-list.component.scss'
})
export class JobRequestListComponent implements OnInit {
  private jobSvc       = inject(JobRequestService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);

  activeFilter  = signal('all');
  searchQuery   = signal('');
  isLoading     = signal(false);
  currentPage   = signal(1);
  totalPages    = signal(1);
  totalCount    = signal(0);
  summary       = signal<JobSummary>({ unallocated: 0, onMission: 0, urgent: 0, completedToday: 0 });
  jobs          = signal<JobListItem[]>([]);
  allocatingJob = signal<JobListItem | null>(null);

  chips = [
    { key: 'all',             label: 'All Requests' },
    { key: 'pending',         label: 'Pending' },
    { key: 'allocated',       label: 'Allocated' },
    { key: 'en_route',        label: 'En Route' },
    { key: 'at_center',       label: 'At Center' },
    { key: 'report_ready',    label: 'Report Ready' },
    { key: 'report_reviewed', label: 'Reviewed' },
    { key: 'completed',       label: 'Completed' },
    { key: 'cancelled',       label: 'Cancelled' },
  ];

  ngOnInit(): void { this.loadJobs(); }

  private loadJobs(): void {
    const filter = this.activeFilter();
    const params: JobParams = {
      page:   this.currentPage(),
      limit:  20,
      search: this.searchQuery() || undefined,
      status: filter !== 'all' ? filter : undefined,
    };

    this.isLoading.set(true);
    this.jobSvc.getAll(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.jobs.set(res.data);
          this.totalCount.set(res.meta.total);
          this.totalPages.set(res.meta.totalPages);
          this.summary.set({
            unallocated:    res.meta.summary?.unallocated    ?? 0,
            onMission:      res.meta.summary?.onMission      ?? 0,
            urgent:         res.meta.summary?.urgent         ?? 0,
            completedToday: res.meta.summary?.completedToday ?? 0,
          });
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server. Check your internet.');
          else if (err.status === 500) this.notification.error('Server Error', 'Something went wrong. Please try again.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to load job requests.');
        }
      });
  }

  setFilter(key: string): void {
    this.activeFilter.set(key);
    this.currentPage.set(1);
    this.loadJobs();
  }

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.loadJobs();
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
    this.loadJobs();
  }

  get pageRange(): number[] {
    const total   = this.totalPages();
    const current = this.currentPage();
    const start   = Math.max(1, current - 2);
    const end     = Math.min(total, current + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getInitials(fullName: string): string {
    return fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  statusBadgeClass(status: string): string {
    const m: Record<string, string> = {
      pending:            'bd-pend',
      queued:             'bd-pend',
      pending_assignment: 'bd-pend',
      on_hold:            'bd-pend',
      accepted:           'bd-alloc',
      allocated:          'bd-alloc',
      driver_confirmed:   'bd-alloc',
      dispatched:         'bd-alloc',
      en_route:           'bd-prog',
      arrived:            'bd-prog',
      collecting:         'bd-prog',
      collection_started: 'bd-prog',
      collected:          'bd-prog',
      returning:          'bd-prog',
      at_center:          'bd-prog',
      sent_to_lab:        'bd-prog',
      lab_received:       'bd-prog',
      processing:         'bd-prog',
      report_ready:       'bd-warn',
      report_reviewed:    'bd-done',
      completed:          'bd-done',
      failed:             'bd-rej',
      rejected:           'bd-rej',
      cancelled:          'bd-rej',
    };
    return m[status] ?? 'bd-gray';
  }

  // ─── Action guards ────────────────────────────────────────────────────────

  canAllocate(status: string): boolean {
    return status === JobStatus.PENDING || status === JobStatus.QUEUED;
  }

  canSendToLab(status: string): boolean {
    return status === JobStatus.AT_CENTER;
  }

  canReviewReport(status: string): boolean {
    return status === JobStatus.REPORT_READY;
  }

  canMarkCompleted(status: string): boolean {
    return status === JobStatus.REPORT_REVIEWED;
  }

  actionLabel(status: string): string {
    const m: Record<string, string> = {
      pending:            'Allocate Vehicle',
      queued:             'Allocate Vehicle',
      allocated:          'View Dispatch',
      accepted:           'View Dispatch',
      driver_confirmed:   'View Dispatch',
      dispatched:         'Track Job',
      en_route:           'Track Job',
      arrived:            'Track Job',
      collecting:         'Track Job',
      collection_started: 'Track Job',
      collected:          'Track Job',
      returning:          'Track Job',
      at_center:          'Track Job',
      sent_to_lab:        'Track Job',
      lab_received:       'Track Job',
      processing:         'Track Job',
      report_ready:       'View Report',
      report_reviewed:    'View Details',
      completed:          'View Details',
      failed:             'View Details',
      rejected:           'View Reason',
      cancelled:          'View Reason',
      on_hold:            'View Details',
    };
    return m[status] ?? 'View';
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  openAllocate(job: JobListItem): void { this.allocatingJob.set(job); }
  closeAllocate(): void                { this.allocatingJob.set(null); }

  onAllocated(): void {
    this.notification.success('Vehicle Allocated', 'The job has been allocated successfully.');
    this.closeAllocate();
    this.loadJobs();
  }

  private doStatusUpdate(job: JobListItem, status: string, successTitle: string, successMsg: string): void {
    this.jobSvc.updateStatus(job.id, status).subscribe({
      next: () => {
        this.notification.success(successTitle, successMsg);
        this.loadJobs();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 422)    this.notification.error('Invalid Transition', err.error?.message ?? 'Cannot perform this status change.');
        else if (err.status === 0) this.notification.error('Connection Error', 'Cannot reach the server.');
        else                       this.notification.error('Error', err.error?.message ?? 'Failed to update status.');
      }
    });
  }

  sendToLab(job: JobListItem): void {
    this.modal.confirm({
      title:        'Send to Lab',
      message:      `Mark samples for #${job.requestNumber} as sent to lab?`,
      confirmLabel: 'Send to Lab',
    }).subscribe(ok => {
      if (!ok) return;
      this.doStatusUpdate(job, JobStatus.SENT_TO_LAB, 'Sent to Lab', `Request #${job.requestNumber} is now in transit to the lab.`);
    });
  }

  reviewReport(job: JobListItem): void {
    this.modal.confirm({
      title:        'Review Report',
      message:      `Mark the report for #${job.requestNumber} as reviewed and ready for patient release?`,
      confirmLabel: 'Mark Reviewed',
    }).subscribe(ok => {
      if (!ok) return;
      this.doStatusUpdate(job, JobStatus.REPORT_REVIEWED, 'Report Reviewed', `Request #${job.requestNumber} report approved — patient can now access it.`);
    });
  }

  markCompleted(job: JobListItem): void {
    this.modal.confirm({
      title:        'Mark as Completed',
      message:      `Close out job #${job.requestNumber}? This marks the case as fully completed.`,
      confirmLabel: 'Mark Completed',
    }).subscribe(ok => {
      if (!ok) return;
      this.doStatusUpdate(job, JobStatus.COMPLETED, 'Job Completed', `Request #${job.requestNumber} has been marked as completed.`);
    });
  }
}