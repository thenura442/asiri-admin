import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';
import { ReportIssueModalComponent } from '@features/lab-approvals/modals/report-issue-modal/report-issue-modal/report-issue-modal.component';
import { ReceiveSamplesModalComponent } from '@features/lab-approvals/modals/receive-samples-modal/receive-samples-modal/receive-samples-modal.component';

type ApprovalStatus = 'arriving' | 'received' | 'processing' | 'complete' | 'issue';

interface LabApproval {
  id: string;
  requestId: string;
  patientName: string;
  uhid: string;
  tests: string[];
  collectingCenter: string;
  notes: string | null;
  status: ApprovalStatus;
}

interface ApprovalStats {
  pendingReview: number; samplesArriving: number;
  processing: number; completedToday: number;
}

@Component({
  selector: 'app-lab-approval-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReceiveSamplesModalComponent, ReportIssueModalComponent],
  templateUrl: './lab-approval-list.component.html',
  styleUrl: './lab-approval-list.component.scss'
})
export class LabApprovalListComponent implements OnInit {
  private modal = inject(ModalService);

  activeFilter     = signal<'all' | ApprovalStatus>('all');
  searchQuery      = signal('');
  currentPage      = signal(1);
  totalCount       = signal(44);
  receivingApproval = signal<LabApproval | null>(null);
  reportingApproval = signal<LabApproval | null>(null);

  stats = signal<ApprovalStats>({
    pendingReview: 14, samplesArriving: 8, processing: 12, completedToday: 24
  });

  approvals = signal<LabApproval[]>([
    { id: 'la1', requestId: 'REQ-2026-0847', patientName: 'Johnathan Doe',    uhid: '129938', tests: ['FBC', 'Lipid Panel'],   collectingCenter: 'Colombo 03 Center',   notes: 'Fasting sample — handle with priority', status: 'arriving'   },
    { id: 'la2', requestId: 'REQ-2026-0843', patientName: 'Kumari Perera',    uhid: '130021', tests: ['Urinalysis'],            collectingCenter: 'Nugegoda Center',     notes: null,                                  status: 'arriving'   },
    { id: 'la3', requestId: 'REQ-2026-0839', patientName: 'Amal Fernando',    uhid: '128744', tests: ['FBC', 'HbA1c'],          collectingCenter: 'Dehiwala Center',     notes: null,                                  status: 'received'   },
    { id: 'la4', requestId: 'REQ-2026-0835', patientName: 'Nadia Silva',      uhid: '127911', tests: ['Thyroid Panel'],         collectingCenter: 'Colombo 03 Center',   notes: 'Urgent — doctor awaiting results',    status: 'processing' },
    { id: 'la5', requestId: 'REQ-2026-0831', patientName: 'Ravi Jayasinghe',  uhid: '126503', tests: ['FBC'],                   collectingCenter: 'Matara Center',       notes: null,                                  status: 'processing' },
    { id: 'la6', requestId: 'REQ-2026-0828', patientName: 'Dilini Wickrama',  uhid: '125891', tests: ['Lipid Panel', 'FBC'],    collectingCenter: 'Rajagiriya Center',   notes: null,                                  status: 'complete'   },
    { id: 'la7', requestId: 'REQ-2026-0825', patientName: 'Prasad Kumara',    uhid: '124677', tests: ['Urinalysis'],            collectingCenter: 'Nugegoda Center',     notes: 'Sample insufficient — recollection needed', status: 'issue' },
  ]);

  filters = [
    { key: 'all',        label: 'All' },
    { key: 'arriving',   label: 'Arriving' },
    { key: 'received',   label: 'Received' },
    { key: 'processing', label: 'Processing' },
    { key: 'complete',   label: 'Complete' },
    { key: 'issue',      label: 'Issue' },
  ];

  ngOnInit(): void {}

  filteredApprovals(): LabApproval[] {
    let list = this.approvals();
    if (this.activeFilter() !== 'all') list = list.filter(a => a.status === this.activeFilter());
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(a =>
      a.requestId.toLowerCase().includes(q) ||
      a.patientName.toLowerCase().includes(q) ||
      a.uhid.includes(q)
    );
    return list;
  }

  setFilter(key: string): void { this.activeFilter.set(key as any); }
  onSearch(e: Event): void { this.searchQuery.set((e.target as HTMLInputElement).value); }

  statusBadgeClass(status: ApprovalStatus): string {
    const m: Record<ApprovalStatus, string> = {
      arriving: 'bd-arriving', received: 'bd-received',
      processing: 'bd-processing', complete: 'bd-complete', issue: 'bd-issue'
    };
    return m[status];
  }

  statusLabel(status: ApprovalStatus): string {
    const m: Record<ApprovalStatus, string> = {
      arriving: 'Arriving', received: 'Received',
      processing: 'Processing', complete: 'Complete', issue: 'Issue'
    };
    return m[status];
  }

  // Modal openers
  openReceive(a: LabApproval): void  { this.receivingApproval.set(a); }
  openReport(a: LabApproval): void   { this.reportingApproval.set(a); }
  closeReceive(): void { this.receivingApproval.set(null); }
  closeReport(): void  { this.reportingApproval.set(null); }

  onSamplesReceived(data: any): void {
    this.approvals.update(list => list.map(a =>
      a.id === this.receivingApproval()?.id ? { ...a, status: 'received' as ApprovalStatus } : a
    ));
    this.modal.success(`Samples received for ${data.requestId}`);
    this.closeReceive();
  }

  onIssueReported(data: any): void {
    this.approvals.update(list => list.map(a =>
      a.id === this.reportingApproval()?.id ? { ...a, status: 'issue' as ApprovalStatus } : a
    ));
    this.modal.warning(`Issue reported for ${data.requestId}`);
    this.closeReport();
  }

  startProcessing(a: LabApproval): void {
    this.approvals.update(list => list.map(x =>
      x.id === a.id ? { ...x, status: 'processing' as ApprovalStatus } : x
    ));
    this.modal.success(`Processing started for ${a.requestId}`);
  }

  uploadReport(a: LabApproval): void {
    this.modal.info(`Upload report for ${a.requestId} — integrate with file picker`);
  }

  cannotProcess(a: LabApproval): void {
    this.openReport(a);
  }

  get totalPages(): number { return Math.ceil(this.totalCount() / 10); }
  get pageRange(): number[] { return Array.from({ length: Math.min(this.totalPages, 5) }, (_, i) => i + 1); }
  setPage(p: number): void { this.currentPage.set(p); }
}