import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PatientService, PatientParams } from '../../../services/patient/patient.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { Patient, PatientFlag } from '@core/models/patient.model';
import { PatientEditModalComponent } from '@features/patients/modals/patient-edit-modal/patient-edit-modal/patient-edit-modal.component';

interface PatientStats {
  total:           number;
  activeThisMonth: number;
  newToday:        number;
  vip:             number;
}

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PatientEditModalComponent],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent implements OnInit {
  private patientSvc   = inject(PatientService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);

  activeFilter  = signal<'all' | PatientFlag>('all');
  searchQuery   = signal('');
  sortOrder     = signal('newest');
  selectedId    = signal<string | null>(null);
  currentPage   = signal(1);
  totalPages    = signal(1);
  totalCount    = signal(0);
  isLoading     = signal(false);
  editingPatient = signal<Patient | null>(null);

  stats    = signal<PatientStats>({ total: 0, activeThisMonth: 0, newToday: 0, vip: 0 });
  patients = signal<Patient[]>([]);

  selectedPatient = computed(() =>
    this.patients().find(p => p.id === this.selectedId()) ?? null
  );

  ngOnInit(): void {
    this.loadPatients();
    this.loadStats();
  }

  private loadPatients(): void {
    const filter = this.activeFilter();
    const params: PatientParams = {
      page:      this.currentPage(),
      limit:     10,
      search:    this.searchQuery() || undefined,
      flag:      filter !== 'all' ? filter : undefined,
      sortOrder: this.sortOrder() === 'oldest' ? 'asc' : 'desc',
    };

    this.isLoading.set(true);
    this.patientSvc.getAll(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.patients.set(res.data);
          this.totalCount.set(res.meta.total);
          this.totalPages.set(res.meta.totalPages);
          if (!this.selectedId() && res.data.length > 0) {
            this.selectedId.set(res.data[0].id);
          }
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server. Check your internet.');
          else if (err.status === 500) this.notification.error('Server Error', 'Something went wrong. Please try again.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to load patients.');
        }
      });
  }

  private loadStats(): void {
    this.patientSvc.getAll({ page: 1, limit: 1 }).subscribe({
      next: (res) => {
        const total = res.meta.total;
        this.patientSvc.getAll({ page: 1, limit: 1, flag: 'vip' }).subscribe(r => {
          this.stats.update(s => ({ ...s, total, vip: r.meta.total }));
        });
        this.patientSvc.getAll({ page: 1, limit: 1, flag: 'new' }).subscribe(r => {
          this.stats.update(s => ({ ...s, newToday: r.meta.total }));
        });
      },
      error: () => {}
    });
  }

  setFilter(f: 'all' | PatientFlag): void {
    this.activeFilter.set(f);
    this.currentPage.set(1);
    this.selectedId.set(null);
    this.loadPatients();
  }

  selectPatient(id: string): void { this.selectedId.set(id); }

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.selectedId.set(null);
    this.loadPatients();
  }

  onSortChange(e: Event): void {
    this.sortOrder.set((e.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    this.loadPatients();
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
    this.loadPatients();
  }

  get pageRange(): number[] {
    const total   = this.totalPages();
    const current = this.currentPage();
    const start   = Math.max(1, current - 2);
    const end     = Math.min(total, current + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  openEdit(p: Patient): void  { this.editingPatient.set(p); }
  closeEdit(): void           { this.editingPatient.set(null); }

  onPatientUpdated(_updated: Patient): void {
    this.editingPatient.set(null);
    this.loadPatients();
  }

  newBooking(p: Patient): void {
    this.notification.info('New Booking', `Booking flow for ${p.fullName} coming soon.`);
  }

  confirmDelete(p: Patient): void {
    this.modal.confirm({
      title:        'Delete Patient',
      message:      `Delete ${p.fullName}'s record? This action cannot be undone.`,
      confirmLabel: 'Delete',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.patientSvc.delete(p.id).subscribe({
        next: () => {
          this.notification.success('Patient Deleted', `${p.fullName}'s record has been removed.`);
          if (this.selectedId() === p.id) this.selectedId.set(null);
          this.loadPatients();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 400) this.notification.error('Cannot Delete', err.error?.message ?? 'Patient may have active bookings.');
          else                    this.notification.error('Error', err.error?.message ?? 'Failed to delete patient.');
        }
      });
    });
  }

  getInitials(fullName: string): string {
    return fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  getAge(dateOfBirth: string): number {
    const today = new Date();
    const dob   = new Date(dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  flagClass(flag: string): string {
    return { regular: 'flag-ok', new: 'flag-warn', vip: 'flag-vip', blacklisted: 'flag-risk' }[flag] ?? 'flag-ok';
  }

  flagLabel(flag: string): string {
    return { regular: 'Regular', new: 'New', vip: 'VIP', blacklisted: 'Blacklisted' }[flag] ?? flag;
  }
}