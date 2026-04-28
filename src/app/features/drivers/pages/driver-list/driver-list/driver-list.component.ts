import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';
import { TimeAgoPipe } from '@shared/pipes/time-ago/time-ago.pipe';

interface DriverStats { total: number; active: number; onJob: number; suspended: number; }

interface Driver {
  id: string; fullName: string; initials: string; phone: string;
  nic: string; licenseNumber: string; licenseExpiry: string;
  status: 'active' | 'inactive' | 'suspended';
  branchName: string; currentJobId: string | null;
}

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe],
  templateUrl: './driver-list.component.html',
  styleUrl: './driver-list.component.scss'
})
export class DriverListComponent implements OnInit {
  private modal = inject(ModalService);

  activeFilter = signal<'all' | 'active' | 'inactive' | 'suspended'>('all');
  searchQuery  = signal('');
  currentPage  = signal(1);
  totalCount   = signal(48);

  stats = signal<DriverStats>({ total: 48, active: 42, onJob: 12, suspended: 2 });

  drivers = signal<Driver[]>([
    { id: 'd1', fullName: 'Nimal Perera',    initials: 'NP', phone: '+94 77 123 4567', nic: '199812345678', licenseNumber: 'B-9823412-A', licenseExpiry: '2027-12-31', status: 'active',    branchName: 'Asiri Central',    currentJobId: 'j1' },
    { id: 'd2', fullName: 'Kamal Silva',     initials: 'KS', phone: '+94 71 882 1109', nic: '199245678912', licenseNumber: 'B-1123567-B', licenseExpiry: '2026-04-30', status: 'active',    branchName: 'Asiri Surgical',   currentJobId: null },
    { id: 'd3', fullName: 'Sunil Gamage',    initials: 'SG', phone: '+94 76 554 3321', nic: '198856789012', licenseNumber: 'B-7845123-C', licenseExpiry: '2028-11-30', status: 'inactive',  branchName: 'Asiri Central',    currentJobId: null },
    { id: 'd4', fullName: 'Arjun Kumara',    initials: 'AK', phone: '+94 77 998 7654', nic: '200112349876', licenseNumber: 'B-4456789-D', licenseExpiry: '2027-09-30', status: 'suspended', branchName: 'Asiri Matara Lab', currentJobId: null },
  ]);

  ngOnInit(): void {}

  filteredDrivers(): Driver[] {
    let list = this.drivers();
    if (this.activeFilter() !== 'all') list = list.filter(d => d.status === this.activeFilter());
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(d =>
      d.fullName.toLowerCase().includes(q) ||
      d.nic.toLowerCase().includes(q) ||
      d.licenseNumber.toLowerCase().includes(q) ||
      d.phone.includes(q)
    );
    return list;
  }

  setFilter(f: 'all' | 'active' | 'inactive' | 'suspended'): void { this.activeFilter.set(f); }
  onSearch(e: Event): void { this.searchQuery.set((e.target as HTMLInputElement).value); }

  isLicenseExpiringSoon(expiry: string): boolean {
    const exp = new Date(expiry);
    const diff = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 90 && diff > 0;
  }

  isLicenseExpired(expiry: string): boolean {
    return new Date(expiry) < new Date();
  }

  formatExpiry(expiry: string): string {
    return new Date(expiry).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  }

  statusBadgeClass(status: string): string {
    return { active: 'bd-active', inactive: 'bd-inactive', suspended: 'bd-suspended' }[status] ?? 'bd-inactive';
  }

  statusLabel(status: string): string {
    return { active: 'Active', inactive: 'Inactive', suspended: 'Suspended' }[status] ?? status;
  }

  openEdit(driver: Driver): void {
    this.modal.info(`Edit modal for ${driver.fullName} would open here`);
  }

  toggleStatus(driver: Driver): void {
    const isActive = driver.status === 'active';
    this.modal.confirm({
      title: isActive ? 'Suspend Driver' : 'Reactivate Driver',
      message: isActive
        ? `Suspend ${driver.fullName}? They will not be able to accept jobs.`
        : `Reactivate ${driver.fullName}?`,
      confirmLabel: isActive ? 'Suspend' : 'Reactivate',
      danger: isActive
    }).subscribe(ok => {
      if (ok) {
        this.drivers.update(list => list.map(d =>
          d.id === driver.id
            ? { ...d, status: (isActive ? 'suspended' : 'active') as any }
            : d
        ));
        this.modal.success(`Driver ${isActive ? 'suspended' : 'reactivated'}`);
      }
    });
  }

  confirmDelete(driver: Driver): void {
    this.modal.confirm({
      title: 'Delete Driver',
      message: `Delete ${driver.fullName}? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true
    }).subscribe(ok => {
      if (ok) {
        this.drivers.update(list => list.filter(d => d.id !== driver.id));
        this.modal.success('Driver deleted');
      }
    });
  }

  get totalPages(): number { return Math.ceil(this.totalCount() / 10); }
  get pageRange(): number[] { return Array.from({ length: Math.min(this.totalPages, 5) }, (_, i) => i + 1); }
  setPage(p: number): void { this.currentPage.set(p); }
}