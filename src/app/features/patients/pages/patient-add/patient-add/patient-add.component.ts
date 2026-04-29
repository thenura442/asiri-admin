import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PatientService } from '../../../services/patient/patient.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { CustomDropdownComponent, DropdownOption } from '@shared/components/ui/custom-dropdown/custom-dropdown/custom-dropdown.component';
import { CreatePatientDto, Gender, PatientFlag } from '@core/models/patient.model';

interface ChecklistItem { label: string; required: boolean; done: boolean; }

@Component({
  selector: 'app-patient-add',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomDropdownComponent],
  templateUrl: './patient-add.component.html',
  styleUrl: './patient-add.component.scss'
})
export class PatientAddComponent {
  private router       = inject(Router);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);
  private patientSvc   = inject(PatientService);

  isSubmitting = signal(false);
  submitted    = signal(false);
  errors       = signal<Record<string, string>>({});

  // Form fields
  fullName      = signal('');
  nic           = signal('');
  dateOfBirth   = signal('');
  gender        = signal<string | null>(null);
  bloodGroup    = signal<string | null>(null);
  nationality   = signal('Sri Lankan');
  phone         = signal('');
  email         = signal('');
  emergencyName  = signal('');
  emergencyPhone = signal('');
  address       = signal('');
  city          = signal('');
  district      = signal<string | null>(null);
  postalCode    = signal('');
  landmark      = signal('');
  allergies     = signal('');
  existingConditions = signal('');
  specialInstructions = signal('');
  patientFlag   = signal<'regular' | 'vip'>('regular');

  genderOptions: DropdownOption[] = [
    { value: 'male',   label: 'Male',   dot: 'var(--sbl)' },
    { value: 'female', label: 'Female', dot: 'var(--sr)'  },
    { value: 'other',  label: 'Other',  dot: 'var(--t4)'  },
  ];

  bloodOptions: DropdownOption[] = [
    'A+','A-','B+','B-','AB+','AB-','O+','O-'
  ].map(v => ({ value: v, label: v, dot: 'var(--sr)' }));

  districtOptions: DropdownOption[] = [
    'Colombo','Gampaha','Kalutara','Kandy','Matale','Galle','Matara',
    'Hambantota','Jaffna','Kurunegala','Puttalam','Anuradhapura',
    'Polonnaruwa','Badulla','Moneragala','Ratnapura','Kegalle',
    'Trincomalee','Batticaloa','Ampara','Mannar','Vavuniya','Mullaitivu',
    'Kilinochchi','Nuwara Eliya'
  ].map(d => ({ value: d, label: d }));

  checklist = signal<ChecklistItem[]>([
    { label: 'Full name entered',       required: true,  done: false },
    { label: 'NIC / Passport number',   required: true,  done: false },
    { label: 'Date of birth set',       required: true,  done: false },
    { label: 'Gender selected',         required: true,  done: false },
    { label: 'Contact number',          required: true,  done: false },
    { label: 'Home address entered',    required: true,  done: false },
    { label: 'Blood type selected',     required: false, done: false },
    { label: 'Emergency contact added', required: false, done: false },
  ]);

  private updateCheck(i: number, done: boolean): void {
    const list = [...this.checklist()];
    list[i] = { ...list[i], done };
    this.checklist.set(list);
  }

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  onFullName(v: string):    void { this.fullName.set(v);    this.updateCheck(0, v.trim().length > 0); this.clearError('fullName'); }
  onNic(v: string):         void { this.nic.set(v);         this.updateCheck(1, v.trim().length > 0); this.clearError('nic'); }
  onDob(v: string):         void { this.dateOfBirth.set(v); this.updateCheck(2, v.length > 0);        this.clearError('dateOfBirth'); }
  onGender(v: string|null): void { this.gender.set(v);      this.updateCheck(3, !!v);                 this.clearError('gender'); }
  onPhone(v: string):       void { this.phone.set(v);       this.updateCheck(4, v.trim().length > 0); this.clearError('phone'); }
  onAddress(v: string):     void { this.address.set(v);     this.updateCheck(5, v.trim().length > 0); this.clearError('address'); }
  onBloodGroup(v: string | null): void { this.bloodGroup.set(v); this.updateCheck(6, !!v); }
  onEmergencyName(v: string):  void { this.emergencyName.set(v);  this.updateCheck(7, !!v && !!this.emergencyPhone()); }
  onEmergencyPhone(v: string): void { this.emergencyPhone.set(v); this.updateCheck(7, !!this.emergencyName() && !!v); }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.fullName().trim())    e['fullName']    = 'Full name is required';
    if (!this.nic().trim())         e['nic']         = 'NIC or passport number is required';
    if (!this.dateOfBirth())        e['dateOfBirth'] = 'Date of birth is required';
    if (!this.gender())             e['gender']      = 'Gender is required';
    if (!this.phone().trim())       e['phone']       = 'Phone number is required';
    if (!this.address().trim())     e['address']     = 'Address is required';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below.');
      return;
    }

    const dto: CreatePatientDto = {
      fullName:           this.fullName().trim(),
      nic:                this.nic().trim(),
      dateOfBirth:        this.dateOfBirth(),
      gender:             this.gender() as Gender,
      phone:              this.phone().trim(),
      address:            this.address().trim(),
      email:              this.email().trim()          || undefined,
      bloodGroup:         this.bloodGroup()            || undefined,
      nationality:        this.nationality().trim()    || undefined,
      city:               this.city().trim()           || undefined,
      district:           this.district()              || undefined,
      postalCode:         this.postalCode().trim()     || undefined,
      landmark:           this.landmark().trim()       || undefined,
      emergencyName:      this.emergencyName().trim()  || undefined,
      emergencyPhone:     this.emergencyPhone().trim() || undefined,
      allergies:          this.allergies().trim()            || undefined,
      existingConditions: this.existingConditions().trim()   || undefined,
      // ❌ removed: flag, specialInstructions, notes — not in backend CreatePatientDto
    };

    console.log('📤 Sending to API:', JSON.stringify(dto, null, 2)); // ← add this

    this.isSubmitting.set(true);
    this.patientSvc.create(dto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (patient) => {
          this.notification.success('Patient Registered', `${patient.fullName} has been registered successfully.`);
          this.router.navigate(['/patients']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server. Check your internet.');
          else if (err.status === 409) this.notification.error('Conflict', err.error?.message ?? 'A patient with this NIC or phone already exists.');
          else if (err.status === 400) this.notification.error('Validation Error', Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message ?? 'Invalid data.');
          else if (err.status === 500) this.notification.error('Server Error', 'Something went wrong. Please try again.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to register patient.');
        }
      });
  }

  cancel(): void { this.router.navigate(['/patients']); }
}