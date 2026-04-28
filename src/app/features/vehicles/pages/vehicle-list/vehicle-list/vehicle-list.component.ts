import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';
// import { VehicleEditModalComponent } from '../../modals/vehicle-edit-modal/vehicle-edit-modal.component';
// import { AssignDriverModalComponent } from '../../modals/assign-driver-modal/assign-driver-modal.component';

interface VehicleStats { total: number; available: number; active: number; maintenance: number; }

interface Vehicle {
  id: string; vehicleIdCode: string; plateNumber: string; chassisNumber: string;
  vehicleType: 'van' | 'car'; status: 'available' | 'busy' | 'offline';
  branch: { id: string; name: string };
  currentDriver: { id: string; fullName: string; initials: string } | null;
  location: string | null; notes: string | null;
}

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss'
})
export class VehicleListComponent implements OnInit {
  private modal = inject(ModalService);

  activeTab    = signal<'all' | 'available' | 'busy' | 'offline'>('all');
  searchQuery  = signal('');
  currentPage  = signal(1);
  totalCount   = signal(42);
  isLoading    = signal(false);

  stats = signal<VehicleStats>({ total: 42, available: 18, active: 24, maintenance: 4 });

  vehicles = signal<Vehicle[]>([
    { id: 'v1', vehicleIdCode: 'AS-MOB-01', plateNumber: 'WP CAB-4521', chassisNumber: 'JMFGH12E8BZ012345', vehicleType: 'van', status: 'available', branch: { id: 'b1', name: 'Asiri Central Lab' }, currentDriver: { id: 'd1', fullName: 'Nimal Perera', initials: 'NP' }, location: 'Colombo 07, Ward Place', notes: null },
    { id: 'v2', vehicleIdCode: 'AS-MOB-05', plateNumber: 'WP CAB-4532', chassisNumber: 'JMFGH12E8BZ012346', vehicleType: 'car', status: 'busy',      branch: { id: 'b2', name: 'Colombo 03 Center' }, currentDriver: { id: 'd2', fullName: 'Kamal Silva',   initials: 'KS' }, location: 'Kandy Rd, Kadawatha',     notes: null },
    { id: 'v3', vehicleIdCode: 'AS-MOB-09', plateNumber: 'WP CAB-4589', chassisNumber: 'JMFGH12E8BZ012347', vehicleType: 'van', status: 'offline',   branch: { id: 'b1', name: 'Asiri Central Lab' }, currentDriver: null, location: null, notes: 'Scheduled maintenance April 2026' },
    { id: 'v4', vehicleIdCode: 'AS-MOB-12', plateNumber: 'WP CAB-4601', chassisNumber: 'JMFGH12E8BZ012348', vehicleType: 'van', status: 'busy',      branch: { id: 'b3', name: 'Nugegoda Center' },  currentDriver: { id: 'd3', fullName: 'Sunil Gamage',   initials: 'SG' }, location: 'High Level Rd, Nugegoda', notes: null },
  ]);

  ngOnInit(): void {}

  setTab(tab: 'all' | 'available' | 'busy' | 'offline'): void { this.activeTab.set(tab); }

  filteredVehicles(): Vehicle[] {
    let list = this.vehicles();
    if (this.activeTab() !== 'all') list = list.filter(v => v.status === this.activeTab());
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(v =>
      v.plateNumber.toLowerCase().includes(q) ||
      v.chassisNumber.toLowerCase().includes(q) ||
      v.vehicleIdCode.toLowerCase().includes(q) ||
      v.currentDriver?.fullName.toLowerCase().includes(q)
    );
    return list;
  }

  statusBadgeClass(status: string): string {
    return { available: 'bd-avail', busy: 'bd-busy', offline: 'bd-offline' }[status] ?? 'bd-offline';
  }

  statusLabel(status: string): string {
    return { available: 'Available', busy: 'Busy', offline: 'Offline' }[status] ?? status;
  }

  openEdit(vehicle: Vehicle): void {
    this.modal.confirm({
      title: `Edit ${vehicle.vehicleIdCode}`,
      message: 'Open the vehicle edit form?',
      confirmLabel: 'Edit Vehicle'
    }).subscribe(ok => {
      if (ok) this.modal.success('Vehicle edit modal would open here');
    });
  }

  openAssignDriver(vehicle: Vehicle): void {
    this.modal.info(`Assign driver to ${vehicle.vehicleIdCode}`);
  }

  confirmDelete(vehicle: Vehicle): void {
    this.modal.confirm({
      title: 'Delete Vehicle',
      message: `Delete ${vehicle.vehicleIdCode} (${vehicle.plateNumber})? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true
    }).subscribe(ok => {
      if (ok) {
        this.vehicles.update(list => list.filter(v => v.id !== vehicle.id));
        this.modal.success('Vehicle deleted');
      }
    });
  }

  onSearch(e: Event): void { this.searchQuery.set((e.target as HTMLInputElement).value); }

  get totalPages(): number { return Math.ceil(this.totalCount() / 10); }
  get pageRange(): number[] { return Array.from({ length: Math.min(this.totalPages, 5) }, (_, i) => i + 1); }
  setPage(p: number): void { this.currentPage.set(p); }
}