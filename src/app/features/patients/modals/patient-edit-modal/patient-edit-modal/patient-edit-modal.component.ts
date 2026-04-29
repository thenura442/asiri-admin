import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PatientService } from '../../../services/patient/patient.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { Patient, UpdatePatientDto, PatientFlag } from '@core/models/patient.model';

@Component({
  selector: 'app-patient-edit-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-edit-modal.component.html',
  styleUrl: './patient-edit-modal.component.scss'
})
export class PatientEditModalComponent implements OnInit {
  patient = input<Patient | null>(null);
  closed  = output<void>();
  saved   = output<Patient>();

  private patientSvc   = inject(PatientService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);

  isSaving   = signal(false);
  isDeleting = signal(false);
  errors     = signal<Record<string, string>>({});

  fullName       = signal('');
  nic            = signal('');
  phone          = signal('');
  address        = signal('');
  emergencyName  = signal('');
  emergencyPhone = signal('');
  flag           = signal<PatientFlag>('regular');

  ngOnInit(): void {
    const p = this.patient();
    if (p) {
      this.fullName.set(p.fullName);
      this.nic.set(p.nic);
      this.phone.set(p.phone);
      this.address.set(p.address);
      this.emergencyName.set(p.emergencyName ?? '');
      this.emergencyPhone.set(p.emergencyPhone ?? '');
      this.flag.set(p.flag);
    }
  }

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  onFullName(v: string): void { this.fullName.set(v); this.clearError('fullName'); }
  onNic(v: string):      void { this.nic.set(v);      this.clearError('nic'); }
  onPhone(v: string):    void { this.phone.set(v);    this.clearError('phone'); }
  onAddress(v: string):  void { this.address.set(v);  this.clearError('address'); }
  setFlag(f: PatientFlag): void { this.flag.set(f); }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.fullName().trim()) e['fullName'] = 'Full name is required';
    if (!this.nic().trim())      e['nic']      = 'NIC is required';
    if (!this.phone().trim())    e['phone']    = 'Phone number is required';
    if (!this.address().trim())  e['address']  = 'Address is required';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  save(): void {
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below.');
      return;
    }
    const p = this.patient();
    if (!p) return;

    const dto: UpdatePatientDto = {
      fullName:      this.fullName().trim(),
      nic:           this.nic().trim(),
      phone:         this.phone().trim(),
      address:       this.address().trim(),
      emergencyName:  this.emergencyName().trim()  || undefined,
      emergencyPhone: this.emergencyPhone().trim() || undefined,
      flag:          this.flag(),
    };

    this.isSaving.set(true);
    this.patientSvc.update(p.id, dto)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updated) => {
          this.notification.success('Patient Updated', `${updated.fullName} has been updated successfully.`);
          this.saved.emit(updated);
          this.closed.emit();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409)      this.notification.error('Conflict', err.error?.message ?? 'NIC or phone already in use by another patient.');
          else if (err.status === 400) this.notification.error('Validation Error', Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message ?? 'Invalid data.');
          else if (err.status === 0)   this.notification.error('Connection Error', 'Cannot reach the server.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to update patient.');
        }
      });
  }

  confirmDelete(): void {
    const p = this.patient();
    if (!p) return;
    this.modal.confirm({
      title:        'Delete Patient',
      message:      `Delete ${p.fullName}'s record? This action cannot be undone.`,
      confirmLabel: 'Delete Patient',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.isDeleting.set(true);
      this.patientSvc.delete(p.id)
        .pipe(finalize(() => this.isDeleting.set(false)))
        .subscribe({
          next: () => {
            this.notification.success('Patient Deleted', `${p.fullName}'s record has been removed.`);
            this.closed.emit();
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 400) this.notification.error('Cannot Delete', err.error?.message ?? 'Patient may have active bookings.');
            else                    this.notification.error('Error', err.error?.message ?? 'Failed to delete patient.');
          }
        });
    });
  }

  close(): void {
    if (this.isSaving() || this.isDeleting()) return;
    this.closed.emit();
  }
}