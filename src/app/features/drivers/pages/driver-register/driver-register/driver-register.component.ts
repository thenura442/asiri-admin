import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';
import { FileUploadComponent } from '@shared/components/ui/file-upload/file-upload/file-upload.component';

interface ChecklistItem { label: string; required: boolean; done: boolean; }

@Component({
  selector: 'app-driver-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FileUploadComponent],
  templateUrl: './driver-register.component.html',
  styleUrl: './driver-register.component.scss'
})
export class DriverRegisterComponent {
  private router = inject(Router);
  private modal  = inject(ModalService);

  isSubmitting = signal(false);

  // Form fields
  fullName      = signal('');
  nic           = signal('');
  dob           = signal('');
  phone         = signal('');
  licenseNumber = signal('');
  licenseExpiry = signal('');
  licensePhoto  = signal<string | null>(null);
  idFront       = signal<string | null>(null);
  idBack        = signal<string | null>(null);

  driverStats = { total: 48, activeToday: 12, pending: 6, compliance: '97%' };

  recentRegistrations = [
    { initials: 'KP', name: 'Kasun Perera',     date: '2 hours ago', status: 'Approved', cls: 'status-approved' },
    { initials: 'NS', name: 'Nuwan Silva',      date: '5 hours ago', status: 'Pending',  cls: 'status-pending'  },
    { initials: 'DF', name: 'Dinesh Fernando',  date: 'Yesterday',   status: 'Approved', cls: 'status-approved' },
  ];

  checklist = signal<ChecklistItem[]>([
    { label: 'Full name entered',          required: false, done: false },
    { label: 'NIC number provided',        required: false, done: false },
    { label: 'Contact number',             required: true,  done: false },
    { label: 'License number & expiry',    required: true,  done: false },
    { label: 'License photo uploaded',     required: true,  done: false },
    { label: 'ID front & back uploaded',   required: true,  done: false },
  ]);

  private updateCheck(i: number, done: boolean): void {
    const list = [...this.checklist()];
    list[i] = { ...list[i], done };
    this.checklist.set(list);
  }

  onFullName(v: string):      void { this.fullName.set(v);      this.updateCheck(0, v.trim().length > 0); }
  onNic(v: string):           void { this.nic.set(v);           this.updateCheck(1, v.trim().length > 0); }
  onPhone(v: string):         void { this.phone.set(v);         this.updateCheck(2, v.trim().length > 0); }
  onLicenseNumber(v: string): void { this.licenseNumber.set(v); this.maybeUpdateLicenseCheck(); }
  onLicenseExpiry(v: string): void { this.licenseExpiry.set(v); this.maybeUpdateLicenseCheck(); }
  private maybeUpdateLicenseCheck(): void { this.updateCheck(3, !!this.licenseNumber() && !!this.licenseExpiry()); }
  onLicensePhoto(): void { this.licensePhoto.set('uploaded'); this.updateCheck(4, true); }
  onIdFront(): void { this.idFront.set('uploaded'); this.maybeUpdateIdCheck(); }
  onIdBack():  void { this.idBack.set('uploaded');  this.maybeUpdateIdCheck(); }
  private maybeUpdateIdCheck(): void { this.updateCheck(5, !!this.idFront() && !!this.idBack()); }

  get canSubmit(): boolean {
    return !!this.fullName() && !!this.phone() && !!this.licenseNumber() && !!this.licenseExpiry();
  }

  submit(): void {
    if (!this.canSubmit) { this.modal.error('Please fill in all required fields'); return; }
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.modal.success('Driver registered successfully');
      this.router.navigate(['/drivers']);
    }, 800);
  }

  cancel(): void { this.router.navigate(['/drivers']); }
}