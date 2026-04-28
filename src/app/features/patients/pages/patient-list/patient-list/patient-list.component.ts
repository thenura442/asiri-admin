import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';
import { TimeAgoPipe } from '@shared/pipes/time-ago/time-ago.pipe';

interface PatientStats { total: number; activeThisMonth: number; newToday: number; vip: number; }

interface PatientBooking { date: string; testName: string; status: 'done' | 'cancelled'; }

interface Patient {
  id: string; fullName: string; initials: string;
  age: number; gender: string; address: string;
  uhid: string | null; phone: string; emergencyPhone: string | null;
  totalVisits: number; lastVisitDate: string;
  flag: 'regular' | 'new' | 'vip' | 'flagged';
  pendingCharges: number;
  allergies: string | null; conditions: string | null;
  recentBookings: PatientBooking[];
}

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent implements OnInit {
  private modal = inject(ModalService);

  activeFilter = signal<'all' | 'regular' | 'new' | 'vip' | 'flagged'>('all');
  searchQuery  = signal('');
  sortOrder    = signal('newest');
  selectedId   = signal<string | null>(null);
  currentPage  = signal(1);
  totalCount   = signal(1284);

  stats = signal<PatientStats>({ total: 1284, activeThisMonth: 89, newToday: 12, vip: 34 });

  patients = signal<Patient[]>([
    { id: 'p1', fullName: 'Kamala Perera',      initials: 'KP', age: 52, gender: 'F', address: 'Dehiwala',  uhid: 'UHID-331087', phone: '+94 77 234 5678', emergencyPhone: '+94 71 876 5432', totalVisits: 14, lastVisitDate: '2025-10-15', flag: 'regular', pendingCharges: 0, allergies: null, conditions: 'Diabetes', recentBookings: [{ date: '15 Oct', testName: 'Thyroid Panel', status: 'done' }, { date: '12 Sep', testName: 'FBS', status: 'done' }] },
    { id: 'p2', fullName: 'Johnathan Doe',       initials: 'JD', age: 45, gender: 'M', address: 'Colombo 03', uhid: 'UHID-129938', phone: '+94 77 456 7890', emergencyPhone: '+94 71 654 3210', totalVisits: 8,  lastVisitDate: '2025-10-24', flag: 'regular', pendingCharges: 0, allergies: 'Penicillin', conditions: null, recentBookings: [{ date: '24 Oct', testName: 'Full Blood Count', status: 'done' }, { date: '01 Sep', testName: 'Lipid Panel', status: 'done' }] },
    { id: 'p3', fullName: 'Sarah Jenkins',       initials: 'SJ', age: 29, gender: 'F', address: 'Kandy',      uhid: null, phone: '+94 76 123 4567', emergencyPhone: null, totalVisits: 1, lastVisitDate: '2025-10-24', flag: 'new', pendingCharges: 0, allergies: null, conditions: null, recentBookings: [{ date: '24 Oct', testName: 'Lipid Profile', status: 'done' }] },
    { id: 'p4', fullName: 'Robert Brown',        initials: 'RB', age: 61, gender: 'M', address: 'Negombo',    uhid: 'UHID-445210', phone: '+94 77 890 1234', emergencyPhone: '+94 71 098 7654', totalVisits: 22, lastVisitDate: '2025-10-23', flag: 'vip', pendingCharges: 0, allergies: null, conditions: 'Hypertension', recentBookings: [{ date: '23 Oct', testName: 'FBS', status: 'done' }, { date: '15 Oct', testName: 'HBA1C', status: 'cancelled' }] },
    { id: 'p5', fullName: 'Malinda Amarasinghe', initials: 'MA', age: 34, gender: 'M', address: 'Borella',    uhid: 'UHID-228901', phone: '+94 76 345 6789', emergencyPhone: '+94 77 543 2109', totalVisits: 3,  lastVisitDate: '2025-10-18', flag: 'flagged', pendingCharges: 500, allergies: null, conditions: null, recentBookings: [{ date: '18 Oct', testName: 'CBC', status: 'cancelled' }, { date: '10 Oct', testName: 'FBS', status: 'cancelled' }] },
    { id: 'p6', fullName: 'Nimal Samaraweera',   initials: 'NS', age: 38, gender: 'M', address: 'Borella',    uhid: 'UHID-220145', phone: '+94 71 234 5678', emergencyPhone: '+94 76 876 5432', totalVisits: 6,  lastVisitDate: '2025-10-20', flag: 'regular', pendingCharges: 0, allergies: null, conditions: null, recentBookings: [{ date: '20 Oct', testName: 'HBA1C', status: 'done' }] },
  ]);

  ngOnInit(): void { this.selectedId.set(this.patients()[0].id); }

  get selectedPatient(): Patient | null {
    return this.patients().find(p => p.id === this.selectedId()) ?? null;
  }

  filteredPatients(): Patient[] {
    let list = this.patients();
    if (this.activeFilter() !== 'all') list = list.filter(p => p.flag === this.activeFilter());
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(p =>
      p.fullName.toLowerCase().includes(q) ||
      (p.uhid ?? '').toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
    return list;
  }

  setFilter(f: 'all' | 'regular' | 'new' | 'vip' | 'flagged'): void { this.activeFilter.set(f); }
  selectPatient(id: string): void { this.selectedId.set(id); }
  onSearch(e: Event): void { this.searchQuery.set((e.target as HTMLInputElement).value); }

  flagClass(flag: string): string {
    return { regular: 'flag-ok', new: 'flag-warn', vip: 'flag-vip', flagged: 'flag-risk' }[flag] ?? 'flag-ok';
  }

  flagLabel(flag: string): string {
    return { regular: 'Regular', new: 'New', vip: 'VIP', flagged: 'Flagged' }[flag] ?? flag;
  }

  openEdit(p: Patient): void {
    this.modal.info(`Edit modal for ${p.fullName}`);
  }

  newBooking(p: Patient): void {
    this.modal.info(`New booking for ${p.fullName}`);
  }

  confirmDelete(p: Patient): void {
    this.modal.confirm({
      title: 'Delete Patient',
      message: `Delete ${p.fullName}'s record? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true
    }).subscribe(ok => {
      if (ok) {
        this.patients.update(list => list.filter(x => x.id !== p.id));
        this.selectedId.set(this.patients()[0]?.id ?? null);
        this.modal.success('Patient deleted');
      }
    });
  }

  get totalPages(): number { return Math.ceil(this.totalCount() / 10); }
  get pageRange(): number[] { return Array.from({ length: Math.min(this.totalPages, 5) }, (_, i) => i + 1); }
  setPage(p: number): void { this.currentPage.set(p); }
}