import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AvailableVehicle {
  id: string; plateNumber: string; vehicleType: string;
  driverName: string; driverInitials: string;
  distanceKm: number; etaMinutes: number; isRecommended: boolean;
}

@Component({
  selector: 'app-allocate-vehicle-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './allocate-vehicle-modal.component.html',
  styleUrl: './allocate-vehicle-modal.component.scss'
})
export class AllocateVehicleModalComponent {
  jobNumber = input('');
  closed    = output<void>();
  allocated = output<{ vehicleId: string; driverId: string }>();

  selectedVehicleId = signal<string | null>(null);
  usePickMe         = signal(false);
  pickMeFare        = signal(0);

  vehicles = signal<AvailableVehicle[]>([
    { id: 'v1', plateNumber: 'WP CAB-4521', vehicleType: 'Van', driverName: 'Nimal Perera', driverInitials: 'NP', distanceKm: 2.1, etaMinutes: 12, isRecommended: true },
    { id: 'v2', plateNumber: 'WP CAB-4532', vehicleType: 'Car', driverName: 'Sunil Fernando', driverInitials: 'SF', distanceKm: 3.4, etaMinutes: 18, isRecommended: false },
    { id: 'v3', plateNumber: 'WP CAB-4589', vehicleType: 'Van', driverName: 'Kasun Perera', driverInitials: 'KP', distanceKm: 5.2, etaMinutes: 26, isRecommended: false },
  ]);

  get pickMeTotal(): number { return (this.pickMeFare() * 2) + 200; }

  select(id: string): void { this.selectedVehicleId.set(id); }

  confirm(): void {
    if (!this.selectedVehicleId()) return;
    this.allocated.emit({ vehicleId: this.selectedVehicleId()!, driverId: 'd1' });
    this.closed.emit();
  }

  close(): void { this.closed.emit(); }
}