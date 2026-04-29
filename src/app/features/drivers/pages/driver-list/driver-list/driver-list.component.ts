import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DriverService, DriverParams } from '../../../services/driver/driver.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { Driver } from '@core/models/driver.model';
import { DriverEditModalComponent } from '@features/drivers/modals/driver-edit-modal/driver-edit-modal/driver-edit-modal.component';

interface DriverStats {
  total:     number;
  active:    number;
  inactive:  number;
  suspended: number;
}

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DriverEditModalComponent],
  templateUrl: './driver-list.component.html',
  styleUrl: './driver-list.component.scss'
})
export class DriverListComponent implements OnInit, OnDestroy {
  private driverSvc    = inject(DriverService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);

  private searchSubject = new Subject<string>();
  private destroy$      = new Subject<void>();

  activeFilter = signal<'all' | 'active' | 'inactive' | 'suspended'>('all');
  searchQuery  = signal('');
  currentPage  = signal(1);
  totalPages   = signal(1);
  totalCount   = signal(0);
  isLoading    = signal(false);
  editingDriver = signal<Driver | null>(null);

  stats   = signal<DriverStats>({ total: 0, active: 0, inactive: 0, suspended: 0 });
  drivers = signal<Driver[]>([]);

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadDrivers();
    });

    this.loadDrivers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDrivers(): void {
    const filter = this.activeFilter();
    const params: DriverParams = {
      page:   this.currentPage(),
      limit:  10,
      search: this.searchQuery() || undefined,
      status: filter !== 'all' ? filter : undefined,
    };

    this.isLoading.set(true);
    this.driverSvc.getAll(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.drivers.set(res.data);
          this.totalCount.set(res.meta.total);
          this.totalPages.set(res.meta.totalPages);
          // Update total stat from response — no extra API calls
          this.stats.update(s => ({ ...s, total: res.meta.total }));
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server. Check your internet.');
          else if (err.status === 500) this.notification.error('Server Error', 'Something went wrong. Please try again.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to load drivers.');
        }
      });
  }

  setFilter(f: 'all' | 'active' | 'inactive' | 'suspended'): void {
    this.activeFilter.set(f);
    this.currentPage.set(1);
    this.loadDrivers();
  }

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.searchSubject.next(this.searchQuery());
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
    this.loadDrivers();
  }

  get pageRange(): number[] {
    const total   = this.totalPages();
    const current = this.currentPage();
    const start   = Math.max(1, current - 2);
    const end     = Math.min(total, current + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  getInitials(fullName: string): string {
    return fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  isLicenseExpiringSoon(warning: string): boolean { return warning === 'expiring_soon'; }
  isLicenseExpired(warning: string):      boolean { return warning === 'expired'; }

  formatExpiry(expiry: string): string {
    return new Date(expiry).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  }

  statusBadgeClass(status: string): string {
    return { active: 'bd-active', inactive: 'bd-inactive', suspended: 'bd-suspended' }[status] ?? 'bd-inactive';
  }

  statusLabel(status: string): string {
    return { active: 'Active', inactive: 'Inactive', suspended: 'Suspended' }[status] ?? status;
  }

  // REPLACE openEdit method
  openEdit(driver: Driver): void {
    this.editingDriver.set(driver);
  }

  closeEdit(): void {
    this.editingDriver.set(null);
  }

  onDriverUpdated(updated: Driver): void {
    this.loadDrivers();
  }

  toggleStatus(driver: Driver): void {
    const isActive = driver.status === 'active';
    this.modal.confirm({
      title:        isActive ? 'Suspend Driver' : 'Reactivate Driver',
      message:      isActive
        ? `Suspend ${driver.fullName}? They will not be able to accept new jobs.`
        : `Reactivate ${driver.fullName}? They will be able to accept jobs again.`,
      confirmLabel: isActive ? 'Suspend' : 'Reactivate',
      danger:       isActive
    }).subscribe(ok => {
      if (!ok) return;
      const newStatus = isActive ? 'suspended' : 'active';
      this.driverSvc.update(driver.id, { status: newStatus }).subscribe({
        next: () => {
          this.notification.success(
            isActive ? 'Driver Suspended' : 'Driver Reactivated',
            `${driver.fullName} has been ${isActive ? 'suspended' : 'reactivated'}.`
          );
          this.loadDrivers();
        },
        error: (err: HttpErrorResponse) => {
          this.notification.error('Error', err.error?.message ?? 'Failed to update driver status.');
        }
      });
    });
  }

  confirmDelete(driver: Driver): void {
    this.modal.confirm({
      title:        'Delete Driver',
      message:      `Delete ${driver.fullName}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.driverSvc.delete(driver.id).subscribe({
        next: () => {
          this.notification.success('Driver Deleted', `${driver.fullName} has been removed.`);
          this.loadDrivers();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 400) this.notification.error('Cannot Delete', err.error?.message ?? 'Driver may be currently on an active job.');
          else                    this.notification.error('Error', err.error?.message ?? 'Failed to delete driver.');
        }
      });
    });
  }
}