import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';
import { TimeAgoPipe } from '@shared/pipes/time-ago/time-ago.pipe';
import { StatusLabelPipe } from '@shared/pipes/status-label/status-label.pipe';
// import { AllocateVehicleModalComponent } from '../../modals/allocate-vehicle-modal/allocate-vehicle-modal.component';
// import { RejectJobModalComponent } from '../../modals/reject-job-modal/reject-job-modal.component';
// import { NotifySaModalComponent } from '../../modals/notify-sa-modal/notify-sa-modal.component';
import { inject } from '@angular/core';

interface JobSummary {
  unallocated: number; onMission: number; urgent: number; completedToday: number;
}

interface JobItem {
  id: string; requestNumber: string;
  patient: { fullName: string; initials: string; age: number; gender: string; uhid: string | null; pendingCharges: number; };
  tests: { name: string }[];
  address: string; scheduledAt: string | null;
  branchName: string | null; status: string; urgency: string;
  totalPrice: number; createdAt: string;
}

@Component({
  selector: 'app-job-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe, StatusLabelPipe],
  templateUrl: './job-request-list.component.html',
  styleUrl: './job-request-list.component.scss'
})
export class JobRequestListComponent implements OnInit {
  private modal = inject(ModalService);

  activeFilter = signal('all');
  searchQuery  = signal('');
  isLoading    = signal(false);
  currentPage  = signal(1);
  totalCount   = signal(128);

  summary = signal<JobSummary>({ unallocated: 42, onMission: 18, urgent: 7, completedToday: 61 });

  jobs = signal<JobItem[]>([
    { id: '1', requestNumber: 'REQ-2026-8801', patient: { fullName: 'Johnathan Doe', initials: 'JD', age: 45, gender: 'M', uhid: '129938', pendingCharges: 0 }, tests: [{ name: 'Full Blood Count' }], address: '78 Galle Rd, Colombo 03', scheduledAt: null, branchName: 'Colombo 03 Center', status: 'pending', urgency: 'normal', totalPrice: 4315, createdAt: new Date(Date.now() - 1800000).toISOString() },
    { id: '2', requestNumber: 'REQ-2026-8802', patient: { fullName: 'Sarah Jenkins', initials: 'SJ', age: 29, gender: 'F', uhid: null, pendingCharges: 0 }, tests: [{ name: 'Lipid Profile' }], address: '12 Orchard Ln, Kandy', scheduledAt: null, branchName: null, status: 'pending', urgency: 'urgent', totalPrice: 2950, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', requestNumber: 'REQ-2026-8803', patient: { fullName: 'Robert Brown', initials: 'RB', age: 61, gender: 'M', uhid: '445210', pendingCharges: 0 }, tests: [{ name: 'FBS' }], address: '55 Park St, Negombo', scheduledAt: null, branchName: 'Negombo Center', status: 'allocated', urgency: 'normal', totalPrice: 950, createdAt: new Date(Date.now() - 5400000).toISOString() },
    { id: '4', requestNumber: 'REQ-2026-8804', patient: { fullName: 'Kamala Perera', initials: 'KP', age: 52, gender: 'F', uhid: '331087', pendingCharges: 500 }, tests: [{ name: 'Thyroid Panel' }], address: '42 Temple Rd, Dehiwala', scheduledAt: null, branchName: 'Colombo 03 Center', status: 'en_route', urgency: 'normal', totalPrice: 4815, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: '5', requestNumber: 'REQ-2026-8805', patient: { fullName: 'Nimal Samaraweera', initials: 'NS', age: 38, gender: 'M', uhid: '220145', pendingCharges: 0 }, tests: [{ name: 'HBA1C' }], address: '8 Lake Rd, Borella', scheduledAt: null, branchName: null, status: 'pending', urgency: 'urgent', totalPrice: 3350, createdAt: new Date(Date.now() - 9000000).toISOString() },
  ]);

  chips = [
    { key: 'all', label: 'All Requests', count: 128 },
    { key: 'pending', label: 'Pending', count: 42 },
    { key: 'allocated', label: 'Allocated', count: 24 },
    { key: 'en_route', label: 'Urgent', count: 7 },
    { key: 'completed', label: 'Completed', count: 61 },
  ];

  ngOnInit(): void {}

  setFilter(key: string): void { this.activeFilter.set(key); }

  statusBadgeClass(status: string): string {
    const m: Record<string, string> = {
      pending: 'bd-pend', allocated: 'bd-alloc', accepted: 'bd-alloc',
      en_route: 'bd-prog', dispatched: 'bd-prog', collecting: 'bd-prog', collected: 'bd-prog',
      completed: 'bd-done', report_reviewed: 'bd-done',
      failed: 'bd-rej', rejected: 'bd-rej', cancelled: 'bd-rej'
    };
    return m[status] ?? 'bd-gray';
  }

  actionLabel(status: string): string {
    const m: Record<string, string> = {
      pending: 'Allocate Vehicle', queued: 'Assign Branch',
      allocated: 'View Dispatch', accepted: 'View Dispatch',
      en_route: 'Track Job', dispatched: 'Track Job', collecting: 'Track Job',
      completed: 'View Details', failed: 'View Details',
      rejected: 'View Reason', cancelled: 'View Reason'
    };
    return m[status] ?? 'View';
  }

  isOutlineAction(status: string): boolean {
    return !['pending', 'queued'].includes(status);
  }

  openAllocate(job: JobItem): void {
    this.modal.confirm({
      title: 'Allocate Vehicle',
      message: `Allocate a vehicle for ${job.patient.fullName}'s request?`,
      confirmLabel: 'Open Allocation'
    }).subscribe(confirmed => {
      if (confirmed) this.modal.success('Vehicle allocation dialog would open here');
    });
  }

  openNotifySA(): void {
    this.modal.info('Notify Super Admin modal would open here');
  }

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }

  setPage(p: number): void { this.currentPage.set(p); }

  get totalPages(): number { return Math.ceil(this.totalCount() / 20); }
  get pageRange(): number[] { return Array.from({ length: Math.min(this.totalPages, 5) }, (_, i) => i + 1); }
}