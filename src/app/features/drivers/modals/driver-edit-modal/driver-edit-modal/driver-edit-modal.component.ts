import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DriverService } from '../../../services/driver/driver.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { Driver, UpdateDriverDto } from '@core/models/driver.model';

@Component({
  selector: 'app-driver-edit-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-edit-modal.component.html',
  styleUrl: './driver-edit-modal.component.scss'
})
export class DriverEditModalComponent implements OnInit {
  driver = input<Driver | null>(null);
  closed = output<void>();
  saved  = output<Driver>();

  private driverSvc    = inject(DriverService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);

  isSaving   = signal(false);
  isDeleting = signal(false);
  errors     = signal<Record<string, string>>({});

  fullName      = signal('');
  nic           = signal('');
  dateOfBirth   = signal('');
  phone         = signal('');
  licenseNumber = signal('');
  licenseExpiry = signal('');
  status        = signal<'active' | 'inactive' | 'suspended'>('active');

  ngOnInit(): void {
    const d = this.driver();
    if (d) {
      this.fullName.set(d.fullName);
      this.nic.set(d.nic);
      this.dateOfBirth.set(d.dateOfBirth);
      this.phone.set(d.phone);
      this.licenseNumber.set(d.licenseNumber);
      this.licenseExpiry.set(d.licenseExpiry);
      this.status.set(d.status);
    }
  }

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  onFullName(v: string):      void { this.fullName.set(v);      this.clearError('fullName'); }
  onNic(v: string):           void { this.nic.set(v);           this.clearError('nic'); }
  onPhone(v: string):         void { this.phone.set(v);         this.clearError('phone'); }
  onLicenseNumber(v: string): void { this.licenseNumber.set(v); this.clearError('licenseNumber'); }
  onLicenseExpiry(v: string): void { this.licenseExpiry.set(v); this.clearError('licenseExpiry'); }
  setStatus(s: 'active' | 'inactive' | 'suspended'): void { this.status.set(s); }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.fullName().trim())      e['fullName']      = 'Full name is required';
    if (!this.nic().trim())           e['nic']           = 'NIC is required';
    if (!this.phone().trim())         e['phone']         = 'Contact number is required';
    if (!this.licenseNumber().trim()) e['licenseNumber'] = 'License number is required';
    if (!this.licenseExpiry())        e['licenseExpiry'] = 'License expiry is required';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  save(): void {
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below.');
      return;
    }
    const d = this.driver();
    if (!d) return;

    const dto: UpdateDriverDto = {
      fullName:      this.fullName().trim(),
      nic:           this.nic().trim(),
      dateOfBirth:   this.dateOfBirth(),
      phone:         this.phone().trim(),
      licenseNumber: this.licenseNumber().trim(),
      licenseExpiry: this.licenseExpiry(),
      status:        this.status(),
    };

    this.isSaving.set(true);
    this.driverSvc.update(d.id, dto)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updated) => {
          this.notification.success('Driver Updated', `${updated.fullName} has been updated successfully.`);
          this.saved.emit(updated);
          this.closed.emit();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409)      this.notification.error('Conflict', err.error?.message ?? 'NIC or phone already in use.');
          else if (err.status === 400) this.notification.error('Validation Error', Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message ?? 'Invalid data.');
          else if (err.status === 0)   this.notification.error('Connection Error', 'Cannot reach the server.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to update driver.');
        }
      });
  }

  confirmDelete(): void {
    const d = this.driver();
    if (!d) return;
    this.modal.confirm({
      title:        'Delete Driver',
      message:      `Delete ${d.fullName}? This action cannot be undone.`,
      confirmLabel: 'Delete Driver',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.isDeleting.set(true);
      this.driverSvc.delete(d.id)
        .pipe(finalize(() => this.isDeleting.set(false)))
        .subscribe({
          next: () => {
            this.notification.success('Driver Deleted', `${d.fullName} has been removed.`);
            this.closed.emit();
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 400) this.notification.error('Cannot Delete', err.error?.message ?? 'Driver may be on an active job.');
            else                    this.notification.error('Error', err.error?.message ?? 'Failed to delete driver.');
          }
        });
    });
  }

  close(): void {
    if (this.isSaving() || this.isDeleting()) return;
    this.closed.emit();
  }
}