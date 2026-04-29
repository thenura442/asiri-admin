import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { JobRequestService } from '../../../services/job-request/job-request.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { CurrencyLkrPipe } from '@shared/pipes/currency-lkr/currency-lkr.pipe';
import { StatusLabelPipe } from '@shared/pipes/status-label/status-label.pipe';
import { TimeAgoPipe } from '@shared/pipes/time-ago/time-ago.pipe';
import { JobRequest, JobTimeline, CancelJobDto } from '@core/models/job-request.model';

const TERMINAL = ['completed', 'cancelled', 'failed'];

@Component({
  selector: 'app-job-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe, CurrencyLkrPipe, StatusLabelPipe, TimeAgoPipe],
  templateUrl: './job-tracking.component.html',
  styleUrl: './job-tracking.component.scss'
})
export class JobTrackingComponent implements OnInit, OnDestroy {
  private route        = inject(ActivatedRoute);
  private jobSvc       = inject(JobRequestService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);

  jobId        = signal('');
  isLoading    = signal(false);
  isCancelling = signal(false);
  noteText     = signal('');

  job      = signal<JobRequest | null>(null);
  timeline = signal<JobTimeline[]>([]);

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  get collectionSteps(): JobTimeline[] {
    return this.timeline().filter(s => s.stepNumber >= 1 && s.stepNumber <= 11);
  }

  get labSteps(): JobTimeline[] {
    return this.timeline().filter(s => s.stepNumber >= 12 && s.stepNumber <= 16);
  }

  get completionSteps(): JobTimeline[] {
    return this.timeline().filter(s => s.stepNumber >= 17 && s.stepNumber <= 21);
  }
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.jobId.set(id);
    if (id) {
      this.loadJob(id);
      this.startPolling(id);
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(id: string): void {
    this.pollInterval = setInterval(() => {
      if (TERMINAL.includes(this.job()?.status ?? '')) {
        this.stopPolling();
        return;
      }
      this.jobSvc.getById(id).subscribe({
        next: (job) => {
          this.job.set(job);
          this.loadTimeline(id);
        },
        error: () => {}
      });
    }, 10_000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private loadJob(id: string): void {
    this.isLoading.set(true);
    this.jobSvc.getById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (job) => {
          this.job.set(job);
          this.loadTimeline(id);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404)    this.notification.error('Not Found', 'This job request does not exist.');
          else if (err.status === 0) this.notification.error('Connection Error', 'Cannot reach the server.');
          else                       this.notification.error('Error', err.error?.message ?? 'Failed to load job.');
        }
      });
  }

  private loadTimeline(id: string): void {
    this.jobSvc.getTimeline(id).subscribe({
      next:  (steps) => this.timeline.set(steps),
      error: () => {}
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getInitials(fullName: string): string {
    return fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  pendingCharges(): number {
    return Number(this.job()?.patient?.pendingCharges ?? 0);
  }

  flagBadgeClass(flag: string): string {
    const m: Record<string, string> = {
      regular:     'flag-regular',
      vip:         'flag-vip',
      new:         'flag-new',
      blacklisted: 'flag-blacklisted',
    };
    return m[flag] ?? 'flag-regular';
  }

  testStatusClass(status: string): string {
    const m: Record<string, string> = {
      pending:                'ts-pending',
      collected:              'ts-collected',
      failed:                 'ts-failed',
      complete:               'ts-done',
      processing:             'ts-prog',
      received_at_lab:        'ts-prog',
      recollection_required:  'ts-failed',
    };
    return m[status] ?? 'ts-pending';
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  addNote(): void {
    if (!this.noteText().trim()) return;
    this.notification.success('Note Added', 'Your note has been saved.');
    this.noteText.set('');
  }

  openNotifySA(): void {
    this.notification.info('Escalation', 'Notify Super Admin feature coming soon.');
  }

  openReassign(): void {
    this.notification.info('Reassign', 'Reassign vehicle feature coming soon.');
  }

  forceComplete(): void {
    this.modal.confirm({
      title:        'Force Complete',
      message:      'Force complete this job? This action is permanent and cannot be undone.',
      confirmLabel: 'Force Complete',
      danger:       true,
    }).subscribe(ok => {
      if (!ok) return;
      this.notification.info('Force Complete', 'This action is not yet implemented.');
    });
  }

  cancelJob(): void {
    const job = this.job();
    if (!job) return;
    this.modal.confirm({
      title:        'Cancel Job',
      message:      `Cancel request #${job.requestNumber}? This action cannot be undone.`,
      confirmLabel: 'Cancel Job',
      danger:       true,
    }).subscribe(ok => {
      if (!ok) return;
      const dto: CancelJobDto = { reason: 'Cancelled by admin' };
      this.isCancelling.set(true);
      this.jobSvc.cancel(job.id, dto)
        .pipe(finalize(() => this.isCancelling.set(false)))
        .subscribe({
          next: (updated) => {
            this.job.set(updated);
            this.stopPolling();
            this.notification.success('Job Cancelled', `Request #${updated.requestNumber} has been cancelled.`);
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 422)    this.notification.error('Cannot Cancel', err.error?.message ?? 'Job cannot be cancelled in its current state.');
            else if (err.status === 0) this.notification.error('Connection Error', 'Cannot reach the server.');
            else                       this.notification.error('Error', err.error?.message ?? 'Failed to cancel job.');
          }
        });
    });
  }
}