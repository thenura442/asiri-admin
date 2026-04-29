import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DriverService } from '@features/drivers/services/driver/driver.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { Vehicle } from '@core/models/vehicle.model';

interface DriverOption {
  id:          string;
  fullName:    string;
  initials:    string;
  isAvailable: boolean;
  status:      string;
  branchName:  string;
}

@Component({
  selector: 'app-assign-driver-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assign-driver-modal.component.html',
  styleUrl: './assign-driver-modal.component.scss'
})
export class AssignDriverModalComponent implements OnInit {
  vehicle  = input<Vehicle | null>(null);
  closed   = output<void>();
  assigned = output<string | null>();

  private driverSvc    = inject(DriverService);
  private notification = inject(NotificationService);

  isLoading        = signal(false);
  selectedDriverId = signal<string | null>(null);
  drivers          = signal<DriverOption[]>([]);

  ngOnInit(): void {
    const v = this.vehicle();
    // Pre-select current driver if already assigned
    if (v?.currentDriver) {
      this.selectedDriverId.set(v.currentDriverId ?? null);
    }
    this.loadDrivers();
  }

  private loadDrivers(): void {
    const v = this.vehicle();
    this.isLoading.set(true);
    this.driverSvc.getAll({
      page:     1,
      limit:    100,
      status:   'active',
      branchId: v?.branchId ?? undefined,
    })
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe({
      next: (res) => {
        this.drivers.set(
          res.data.map(d => ({
            id:          d.id,
            fullName:    d.fullName,
            initials:    d.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
            isAvailable: d.isAvailable,
            status:      d.status,
            branchName:  d.branch.name,
          }))
        );
      },
      error: (err: HttpErrorResponse) => {
        this.notification.error('Error', err.error?.message ?? 'Failed to load drivers.');
      }
    });
  }

  select(id: string): void { this.selectedDriverId.set(id); }
  unassign(): void         { this.selectedDriverId.set(null); }

  confirm(): void {
    this.assigned.emit(this.selectedDriverId());
    this.closed.emit();
  }

  close(): void { this.closed.emit(); }

  dotColor(driver: DriverOption): string {
    if (driver.status !== 'active') return 'var(--t5)';
    if (driver.isAvailable)         return 'var(--sg)';
    return 'var(--sa)';
  }
}