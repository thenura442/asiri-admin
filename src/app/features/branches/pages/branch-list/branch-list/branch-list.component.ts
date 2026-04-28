import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';
import { BranchService } from '@features/branches/services/branch/branch.service';
import { BranchEditModalComponent } from '@features/branches/modals/branch-edit-modal/branch-edit-modal/branch-edit-modal.component';
import { Branch } from '@core/models/branch.model';
import { NotificationService } from '@core/services/notification/notification.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule, RouterModule, BranchEditModalComponent],
  templateUrl: './branch-list.component.html',
  styleUrl: './branch-list.component.scss'
})
export class BranchListComponent implements OnInit {
  private modal        = inject(ModalService);
  private branchSvc    = inject(BranchService);
  private notification = inject(NotificationService);

  activeFilter  = signal<'all' | 'online' | 'offline'>('all');
  searchQuery   = signal('');
  currentPage   = signal(1);
  totalCount    = signal(0);
  totalPages    = signal(1);
  isLoading     = signal(false);
  editingBranch = signal<Branch | null>(null);
  branches      = signal<Branch[]>([]);

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoading.set(true);
    const params: any = {
      page:  this.currentPage(),
      limit: 10,
    };
    if (this.activeFilter() === 'online')  params.isOnline = true;
    if (this.activeFilter() === 'offline') params.isOnline = false;
    if (this.searchQuery()) params.search = this.searchQuery();

    this.branchSvc.getAll(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.branches.set(res.data);
          this.totalCount.set(res.meta.total);
          this.totalPages.set(res.meta.totalPages);
        },
        error: () => {}
      });
  }

  setFilter(f: 'all' | 'online' | 'offline'): void {
    this.activeFilter.set(f);
    this.currentPage.set(1);
    this.loadBranches();
  }

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.loadBranches();
  }

  formatHours(start: string, end: string): string { return `${start} – ${end}`; }

  typeLabel(type: string): string {
    return type === 'lab' ? 'Lab' : 'Collecting Center';
  }

  openEdit(b: Branch): void { this.editingBranch.set(b); }
  closeEdit(): void         { this.editingBranch.set(null); }

  onBranchSaved(data: any): void {
    this.notification.success('Branch Updated', `"${data.name}" updated successfully`);
    this.closeEdit();
    this.loadBranches();
  }

  toggleStatus(b: Branch): void {
    const goingOffline = b.isOnline;
    this.modal.confirm({
      title:        goingOffline ? 'Force Branch Offline' : 'Bring Branch Online',
      message:      goingOffline
        ? `Force "${b.name}" offline? No new jobs can be dispatched.`
        : `Bring "${b.name}" back online?`,
      confirmLabel: goingOffline ? 'Force Offline' : 'Bring Online',
      danger:       goingOffline
    }).subscribe(ok => {
      if (!ok) return;
      this.branchSvc.toggleOnline(b.id).subscribe({
        next: (res) => {
          this.branches.update(list =>
            list.map(x => x.id === b.id ? { ...x, isOnline: res.isOnline } : x)
          );
          this.notification.success(
            'Status Updated',
            `Branch ${res.isOnline ? 'brought online' : 'taken offline'}`
          );
        },
        error: () => {}
      });
    });
  }

  confirmDelete(b: Branch): void {
    this.modal.confirm({
      title:        'Delete Branch',
      message:      `Delete "${b.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.branchSvc.delete(b.id).subscribe({
        next: () => {
          this.notification.success('Branch Deleted', `"${b.name}" has been deleted`);
          this.loadBranches();
        },
        error: () => {}
      });
    });
  }

  get pageRange(): number[] {
    return Array.from({ length: Math.min(this.totalPages(), 5) }, (_, i) => i + 1);
  }

  setPage(p: number): void {
    this.currentPage.set(p);
    this.loadBranches();
  }
}