import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DriverOption {
  id: string; fullName: string; initials: string;
  isOnline: boolean; status: string;
}

@Component({
  selector: 'app-assign-driver-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assign-driver-modal.component.html',
  styleUrl: './assign-driver-modal.component.scss'
})
export class AssignDriverModalComponent {
  vehicle   = input<any>(null);
  closed    = output<void>();
  assigned  = output<string | null>();

  selectedDriverId = signal<string | null>(null);

  drivers = signal<DriverOption[]>([
    { id: 'd1', fullName: 'Nimal Perera',      initials: 'NP', isOnline: true,  status: 'Available' },
    { id: 'd2', fullName: 'Sunil Gamage',      initials: 'SG', isOnline: true,  status: 'Available' },
    { id: 'd3', fullName: 'Aruna Jayawardene', initials: 'AJ', isOnline: false, status: 'Offline'   },
    { id: 'd4', fullName: 'Kasun Mendis',      initials: 'KM', isOnline: true,  status: 'On Break'  },
  ]);

  select(id: string): void { this.selectedDriverId.set(id); }
  unassign(): void  { this.selectedDriverId.set(null); }

  confirm(): void {
    this.assigned.emit(this.selectedDriverId());
    this.closed.emit();
  }

  close(): void { this.closed.emit(); }

  dotColor(driver: DriverOption): string {
    if (!driver.isOnline) return 'var(--t5)';
    if (driver.status === 'Available') return 'var(--sg)';
    return 'var(--sa)';
  }
}