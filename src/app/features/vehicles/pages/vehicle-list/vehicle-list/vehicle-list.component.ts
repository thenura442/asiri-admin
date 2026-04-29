import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { VehicleService, VehicleParams } from '../../../services/vehicle/vehicle.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { Vehicle } from '@core/models/vehicle.model';
import { VehicleEditModalComponent } from '../../../modals/vehicle-edit-modal/vehicle-edit-modal/vehicle-edit-modal.component';
import { AssignDriverModalComponent } from '../../../modals/assign-driver-modal/assign-driver-modal/assign-driver-modal.component';

interface VehicleStats {
  total:     number;
  available: number;
  busy:      number;
  offline:   number;
}

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterModule, VehicleEditModalComponent, AssignDriverModalComponent],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss'
})
export class VehicleListComponent implements OnInit, OnDestroy {
  private vehicleSvc   = inject(VehicleService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);

  private searchSubject = new Subject<string>();
  private destroy$      = new Subject<void>();

  activeTab          = signal<'all' | 'available' | 'busy' | 'offline'>('all');
  searchQuery        = signal('');
  currentPage        = signal(1);
  totalPages         = signal(1);
  totalCount         = signal(0);
  isLoading          = signal(false);
  editingVehicle     = signal<Vehicle | null>(null);
  assigningVehicle   = signal<Vehicle | null>(null);

  stats    = signal<VehicleStats>({ total: 0, available: 0, busy: 0, offline: 0 });
  vehicles = signal<Vehicle[]>([]);

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadVehicles();
    });
    this.loadVehicles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadVehicles(): void {
    const tab = this.activeTab();
    const params: VehicleParams = {
      page:   this.currentPage(),
      limit:  10,
      search: this.searchQuery() || undefined,
      status: tab !== 'all' ? (tab as 'available' | 'busy' | 'offline') : undefined,
    };

    this.isLoading.set(true);
    this.vehicleSvc.getAll(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.vehicles.set(res.data);
          this.totalCount.set(res.meta.total);
          this.totalPages.set(res.meta.totalPages);
          this.stats.set({
            total:     res.meta.total,
            available: res.meta.stats?.available ?? 0,
            busy:      res.meta.stats?.busy      ?? 0,
            offline:   res.meta.stats?.offline   ?? 0,
          });
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server. Check your internet.');
          else if (err.status === 500) this.notification.error('Server Error', 'Something went wrong. Please try again.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to load vehicles.');
        }
      });
  }

  setTab(tab: 'all' | 'available' | 'busy' | 'offline'): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.loadVehicles();
  }

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.searchSubject.next(this.searchQuery());
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
    this.loadVehicles();
  }

  get pageRange(): number[] {
    const total   = this.totalPages();
    const current = this.currentPage();
    const start   = Math.max(1, current - 2);
    const end     = Math.min(total, current + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  filteredVehicles(): Vehicle[] { return this.vehicles(); }

  getInitials(fullName: string): string {
    return fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  statusBadgeClass(status: string): string {
    return { available: 'bd-avail', busy: 'bd-busy', offline: 'bd-offline' }[status] ?? 'bd-offline';
  }

  statusLabel(status: string): string {
    return { available: 'Available', busy: 'Busy', offline: 'Offline' }[status] ?? status;
  }

  // Edit modal
  openEdit(vehicle: Vehicle): void    { this.editingVehicle.set(vehicle); }
  closeEdit(): void                    { this.editingVehicle.set(null); }
  onVehicleUpdated(v: Vehicle): void  { this.loadVehicles(); }

  // Assign driver modal
  openAssignDriver(vehicle: Vehicle): void { this.assigningVehicle.set(vehicle); }
  closeAssign(): void                       { this.assigningVehicle.set(null); }

  onDriverAssigned(driverId: string | null): void {
    const v = this.assigningVehicle();
    if (!v) return;
    this.vehicleSvc.assignDriver(v.id, driverId).subscribe({
      next: () => {
        this.notification.success(
          driverId ? 'Driver Assigned' : 'Driver Unassigned',
          driverId
            ? 'Driver has been assigned to the vehicle.'
            : 'Driver has been removed from the vehicle.'
        );
        this.closeAssign();
        this.loadVehicles();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 400) this.notification.error('Cannot Assign', err.error?.message ?? 'Driver may already be assigned to another vehicle.');
        else                    this.notification.error('Error', err.error?.message ?? 'Failed to assign driver.');
      }
    });
  }

  confirmDelete(vehicle: Vehicle): void {
    this.modal.confirm({
      title:        'Delete Vehicle',
      message:      `Delete ${vehicle.vehicleIdCode ?? vehicle.plateNumber} (${vehicle.plateNumber})? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.vehicleSvc.delete(vehicle.id).subscribe({
        next: () => {
          this.notification.success('Vehicle Deleted', `${vehicle.plateNumber} has been removed.`);
          this.loadVehicles();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 400) this.notification.error('Cannot Delete', err.error?.message ?? 'Vehicle may be currently busy.');
          else                    this.notification.error('Error', err.error?.message ?? 'Failed to delete vehicle.');
        }
      });
    });
  }
}