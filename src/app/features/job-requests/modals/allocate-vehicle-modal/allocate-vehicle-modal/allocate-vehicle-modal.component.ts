import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { finalize, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { JobRequestService } from '../../../services/job-request/job-request.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { AvailableVehicle, JobListItem } from '@core/models/job-request.model';
import { JobStatus } from '@core/enums/job-status.enum';

@Component({
  selector: 'app-allocate-vehicle-modal',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './allocate-vehicle-modal.component.html',
  styleUrl: './allocate-vehicle-modal.component.scss'
})
export class AllocateVehicleModalComponent implements OnInit {
  job       = input<JobListItem | null>(null);
  closed    = output<void>();
  allocated = output<void>();

  private jobSvc       = inject(JobRequestService);
  private notification = inject(NotificationService);

  isLoading         = signal(false);
  isAllocating      = signal(false);
  selectedVehicleId = signal<string | null>(null);
  selectedDriverId  = signal<string | null>(null);
  vehicles          = signal<AvailableVehicle[]>([]);

  ngOnInit(): void {
    const j = this.job();
    if (j) this.loadAvailableVehicles(j.id);
  }

  private loadAvailableVehicles(jobId: string): void {
    this.isLoading.set(true);
    this.jobSvc.getAvailableVehicles(jobId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (vehicles) => {
          this.vehicles.set(vehicles);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0) this.notification.error('Connection Error', 'Cannot reach the server.');
          else                  this.notification.error('Error', err.error?.message ?? 'Failed to load available vehicles.');
        }
      });
  }

  selectVehicle(vehicle: AvailableVehicle): void {
    this.selectedVehicleId.set(vehicle.id);
    this.selectedDriverId.set(vehicle.currentDriver?.id ?? null);
  }

  getDriverName(vehicle: AvailableVehicle): string {
    return vehicle.currentDriver?.fullName ?? 'No driver assigned';
  }

  confirm(): void {
    const j = this.job();
    if (!j || !this.selectedVehicleId()) return;

    const dto = {
      vehicleId: this.selectedVehicleId()!,
      driverId:  this.selectedDriverId()!,
    };

    this.isAllocating.set(true);

    // Accept first only if pending or queued — skip if already accepted
    const needsAccept = j.status === JobStatus.PENDING || j.status === JobStatus.QUEUED;
    const allocate$ = needsAccept
      ? this.jobSvc.accept(j.id).pipe(switchMap(() => this.jobSvc.allocate(j.id, dto)))
      : this.jobSvc.allocate(j.id, dto);

    allocate$
      .pipe(finalize(() => this.isAllocating.set(false)))
      .subscribe({
        next: () => {
          this.allocated.emit();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server.');
          else if (err.status === 400) this.notification.error('Cannot Allocate', err.error?.message ?? 'Vehicle or driver not available.');
          else if (err.status === 409) this.notification.error('Conflict', err.error?.message ?? 'Vehicle already assigned to another job.');
          else if (err.status === 422) this.notification.error('Invalid State', err.error?.message ?? 'Job cannot be allocated in its current state.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to allocate vehicle.');
        }
      });
  }

  close(): void {
    if (this.isAllocating()) return;
    this.closed.emit();
  }
}