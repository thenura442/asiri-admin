import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { VehicleService, UpdateVehicleDto } from '../../../services/vehicle/vehicle.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { Vehicle } from '@core/models/vehicle.model';

@Component({
  selector: 'app-vehicle-edit-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-edit-modal.component.html',
  styleUrl: './vehicle-edit-modal.component.scss'
})
export class VehicleEditModalComponent implements OnInit {
  vehicle = input<Vehicle | null>(null);
  closed  = output<void>();
  saved   = output<Vehicle>();

  private vehicleSvc   = inject(VehicleService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);

  isSaving   = signal(false);
  isDeleting = signal(false);
  errors     = signal<Record<string, string>>({});

  plateNumber   = signal('');
  chassisNumber = signal('');
  type          = signal<'van' | 'car'>('van');
  status        = signal<'available' | 'busy' | 'offline'>('available');
  notes         = signal('');

  ngOnInit(): void {
    const v = this.vehicle();
    if (v) {
      this.plateNumber.set(v.plateNumber);
      this.chassisNumber.set(v.chassisNumber);
      this.type.set(v.vehicleType);
      this.status.set(v.status);
      this.notes.set(v.notes ?? '');
    }
  }

  onPlateNumber(v: string): void {
    this.plateNumber.set(v);
    this.clearError('plateNumber');
  }

  onChassisNumber(v: string): void {
    this.chassisNumber.set(v);
    this.clearError('chassisNumber');
  }

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.plateNumber().trim())   e['plateNumber']   = 'Plate number is required';
    if (!this.chassisNumber().trim()) e['chassisNumber'] = 'Chassis number is required';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  save(): void {
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below.');
      return;
    }
    const v = this.vehicle();
    if (!v) return;

    const dto: UpdateVehicleDto = {
      plateNumber:   this.plateNumber().trim(),
      chassisNumber: this.chassisNumber().trim(),
      vehicleType:   this.type(),
      status:        this.status(),
      notes:         this.notes().trim() || null,
    };

    this.isSaving.set(true);
    this.vehicleSvc.update(v.id, dto)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updated) => {
          this.notification.success('Vehicle Updated', `${updated.plateNumber} has been updated successfully.`);
          this.saved.emit(updated);
          this.closed.emit();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409)      this.notification.error('Conflict', err.error?.message ?? 'Plate or chassis number already in use.');
          else if (err.status === 400) this.notification.error('Validation Error', Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message ?? 'Invalid data.');
          else if (err.status === 0)   this.notification.error('Connection Error', 'Cannot reach the server.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to update vehicle.');
        }
      });
  }

  confirmDelete(): void {
    const v = this.vehicle();
    if (!v) return;
    this.modal.confirm({
      title:        'Delete Vehicle',
      message:      `Delete ${v.plateNumber}? This action cannot be undone.`,
      confirmLabel: 'Delete Vehicle',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.isDeleting.set(true);
      this.vehicleSvc.delete(v.id)
        .pipe(finalize(() => this.isDeleting.set(false)))
        .subscribe({
          next: () => {
            this.notification.success('Vehicle Deleted', `${v.plateNumber} has been removed from the fleet.`);
            this.closed.emit();
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 400) this.notification.error('Cannot Delete', err.error?.message ?? 'Vehicle may currently be on an active job.');
            else                    this.notification.error('Error', err.error?.message ?? 'Failed to delete vehicle.');
          }
        });
    });
  }

  close(): void {
    if (this.isSaving() || this.isDeleting()) return;
    this.closed.emit();
  }
}