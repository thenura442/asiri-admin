import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DriverService } from '../../../services/driver/driver.service';
import { BranchService } from '@features/branches/services/branch/branch.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { CustomDropdownComponent, DropdownOption } from '@shared/components/ui/custom-dropdown/custom-dropdown/custom-dropdown.component';
import { FileUploadComponent } from '@shared/components/ui/file-upload/file-upload/file-upload.component';
import { CreateDriverDto } from '@core/models/driver.model';

interface ChecklistItem { label: string; required: boolean; done: boolean; }

@Component({
  selector: 'app-driver-registration',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomDropdownComponent, FileUploadComponent],
  templateUrl: './driver-register.component.html',
  styleUrl: './driver-register.component.scss'
})
export class DriverRegistrationComponent implements OnInit {
  private router       = inject(Router);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);
  private driverSvc    = inject(DriverService);
  private branchSvc    = inject(BranchService);

  isSubmitting  = signal(false);
  isLoadingData = signal(false);
  submitted     = signal(false);
  errors        = signal<Record<string, string>>({});

  // Form fields
  fullName      = signal('');
  nic           = signal('');
  dateOfBirth   = signal('');
  phone         = signal('');
  staffId       = signal('');
  licenseNumber = signal('');
  licenseExpiry = signal('');
  branchId      = signal<string | null>(null);
  licensePhotoUrl = signal<string | null>(null);
  idFrontUrl    = signal<string | null>(null);
  idBackUrl     = signal<string | null>(null);

  branchOptions = signal<DropdownOption[]>([]);

  checklist = signal<ChecklistItem[]>([
    { label: 'Full name entered',        required: true,  done: false },
    { label: 'NIC number provided',      required: true,  done: false },
    { label: 'Date of birth set',        required: true,  done: false },
    { label: 'Contact number provided',  required: true,  done: false },
    { label: 'Base branch assigned',     required: true,  done: false },
    { label: 'License number & expiry',  required: true,  done: false },
    { label: 'License photo uploaded',   required: false, done: false },
    { label: 'ID front & back uploaded', required: false, done: false },
  ]);

  ngOnInit(): void {
    this.loadBranches();
  }

  private loadBranches(): void {
    this.isLoadingData.set(true);
    // Drivers must also use getLabs() — lab-type branches only
    this.branchSvc.getLabs()
      .pipe(finalize(() => this.isLoadingData.set(false)))
      .subscribe({
        next: (branches) => {
          this.branchOptions.set(
            branches.map(b => ({ value: b.id, label: b.name, dot: 'var(--accent)' }))
          );
        },
        error: () => this.notification.error('Error', 'Failed to load lab branches.')
      });
  }

  private updateCheck(i: number, done: boolean): void {
    const list = [...this.checklist()];
    list[i] = { ...list[i], done };
    this.checklist.set(list);
  }

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  onFullName(v: string):      void { this.fullName.set(v);      this.updateCheck(0, v.trim().length > 0); this.clearError('fullName'); }
  onNic(v: string):           void { this.nic.set(v);           this.updateCheck(1, v.trim().length > 0); this.clearError('nic'); }
  onDob(v: string):           void { this.dateOfBirth.set(v);   this.updateCheck(2, v.length > 0);        this.clearError('dateOfBirth'); }
  onPhone(v: string):         void { this.phone.set(v);         this.updateCheck(3, v.trim().length > 0); this.clearError('phone'); }
  onBranchSelect(v: string | null): void { this.branchId.set(v); this.updateCheck(4, !!v);               this.clearError('branchId'); }
  onLicenseNumber(v: string): void { this.licenseNumber.set(v); this.updateLicenseCheck(); this.clearError('licenseNumber'); }
  onLicenseExpiry(v: string): void { this.licenseExpiry.set(v); this.updateLicenseCheck(); this.clearError('licenseExpiry'); }

  private updateLicenseCheck(): void {
    this.updateCheck(5, !!this.licenseNumber().trim() && !!this.licenseExpiry());
  }

  onLicensePhotoUpload(event: { url?: string; file: File }): void {
    this.licensePhotoUrl.set(event.url ?? event.file.name);
    this.updateCheck(6, true);
  }

  onIdFrontUpload(event: { url?: string; file: File }): void {
    this.idFrontUrl.set(event.url ?? event.file.name);
    this.updateIdCheck();
  }

  onIdBackUpload(event: { url?: string; file: File }): void {
    this.idBackUrl.set(event.url ?? event.file.name);
    this.updateIdCheck();
  }

  private updateIdCheck(): void {
    this.updateCheck(7, !!this.idFrontUrl() && !!this.idBackUrl());
  }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.fullName().trim())      e['fullName']      = 'Full name is required';
    if (!this.nic().trim())           e['nic']           = 'NIC number is required';
    if (!this.dateOfBirth())          e['dateOfBirth']   = 'Date of birth is required';
    if (!this.phone().trim())         e['phone']         = 'Contact number is required';
    if (!this.branchId())             e['branchId']      = 'Base branch is required';
    if (!this.licenseNumber().trim()) e['licenseNumber'] = 'License number is required';
    if (!this.licenseExpiry())        e['licenseExpiry'] = 'License expiry date is required';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below.');
      return;
    }

    const dto: CreateDriverDto = {
      fullName:        this.fullName().trim(),
      nic:             this.nic().trim(),
      dateOfBirth:     this.dateOfBirth(),
      phone:           this.phone().trim(),
      licenseNumber:   this.licenseNumber().trim(),
      licenseExpiry:   this.licenseExpiry(),
      branchId:        this.branchId()!,
      staffId:         this.staffId().trim() || null,
      licensePhotoUrl: this.licensePhotoUrl(),
      idFrontUrl:      this.idFrontUrl(),
      idBackUrl:       this.idBackUrl(),
    };

    this.isSubmitting.set(true);
    this.driverSvc.create(dto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (driver) => {
          this.notification.success('Driver Registered', `${driver.fullName} has been registered successfully.`);
          this.router.navigate(['/drivers']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server. Check your internet.');
          else if (err.status === 409) this.notification.error('Conflict', err.error?.message ?? 'A driver with this NIC or phone already exists.');
          else if (err.status === 400) this.notification.error('Validation Error', Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message ?? 'Invalid data.');
          else if (err.status === 500) this.notification.error('Server Error', 'Something went wrong. Please try again.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to register driver.');
        }
      });
  }

  cancel(): void { this.router.navigate(['/drivers']); }
}