import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';
import { CustomDropdownComponent, DropdownOption } from '@shared/components/ui/custom-dropdown/custom-dropdown/custom-dropdown.component';

interface ChecklistItem { label: string; required: boolean; done: boolean; }

@Component({
  selector: 'app-patient-add',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomDropdownComponent],
  templateUrl: './patient-add.component.html',
  styleUrl: './patient-add.component.scss'
})
export class PatientAddComponent {
  private router = inject(Router);
  private modal  = inject(ModalService);

  isSubmitting = signal(false);

  // Form fields
  fullName    = signal('');
  nic         = signal('');
  dob         = signal('');
  gender      = signal<string | null>(null);
  bloodGroup  = signal<string | null>(null);
  nationality = signal('Sri Lankan');
  phone       = signal('');
  email       = signal('');
  emergencyName  = signal('');
  emergencyPhone = signal('');
  address1    = signal('');
  city        = signal('');
  district    = signal<string | null>(null);
  postalCode  = signal('');
  landmark    = signal('');
  allergies   = signal('');
  conditions  = signal('');
  specialNotes = signal('');
  patientFlag = signal<'regular' | 'vip'>('regular');

  genderOptions: DropdownOption[] = [
    { value: 'male',   label: 'Male',   dot: 'var(--sbl)' },
    { value: 'female', label: 'Female', dot: 'var(--sr)' },
    { value: 'other',  label: 'Other',  dot: 'var(--t4)' },
  ];

  bloodOptions: DropdownOption[] = [
    { value: 'A+', label: 'A+', dot: 'var(--sr)' },
    { value: 'A-', label: 'A-', dot: 'var(--sr)' },
    { value: 'B+', label: 'B+', dot: 'var(--sr)' },
    { value: 'B-', label: 'B-', dot: 'var(--sr)' },
    { value: 'AB+', label: 'AB+', dot: 'var(--sr)' },
    { value: 'AB-', label: 'AB-', dot: 'var(--sr)' },
    { value: 'O+', label: 'O+', dot: 'var(--sr)' },
    { value: 'O-', label: 'O-', dot: 'var(--sr)' },
  ];

  districtOptions: DropdownOption[] = [
    'Colombo','Gampaha','Kalutara','Kandy','Matale','Galle','Matara',
    'Hambantota','Jaffna','Kurunegala','Puttalam','Anuradhapura',
    'Polonnaruwa','Badulla','Moneragala','Ratnapura','Kegalle',
    'Trincomalee','Batticaloa','Ampara','Mannar','Vavuniya','Mullaitivu',
    'Kilinochchi','Nuwara Eliya'
  ].map(d => ({ value: d, label: d }));

  patientStats = { total: 1284, thisMonth: 89, today: 12, rating: '4.8' };

  recentPatients = [
    { initials: 'KP', name: 'Kamala Perera',   date: '1 hour ago',  cls: 'status-reg' },
    { initials: 'JD', name: 'Johnathan Doe',    date: '4 hours ago', cls: 'status-reg' },
    { initials: 'SJ', name: 'Sarah Jenkins',    date: 'Yesterday',   cls: 'status-reg' },
  ];

  checklist = signal<ChecklistItem[]>([
    { label: 'Full name entered',       required: false, done: false },
    { label: 'NIC / Passport number',   required: false, done: false },
    { label: 'Contact number',          required: true,  done: false },
    { label: 'Home address entered',    required: true,  done: false },
    { label: 'Blood type selected',     required: false, done: false },
    { label: 'Emergency contact added', required: true,  done: false },
  ]);

  private updateCheck(i: number, done: boolean): void {
    const list = [...this.checklist()];
    list[i] = { ...list[i], done };
    this.checklist.set(list);
  }

  onFullName(v: string): void { this.fullName.set(v); this.updateCheck(0, v.trim().length > 0); }
  onNic(v: string):     void { this.nic.set(v);      this.updateCheck(1, v.trim().length > 0); }
  onPhone(v: string):   void { this.phone.set(v);    this.updateCheck(2, v.trim().length > 0); }
  onAddress(v: string): void { this.address1.set(v); this.updateCheck(3, v.trim().length > 0); }
  onBloodGroup(v: string | null): void { this.bloodGroup.set(v); this.updateCheck(4, !!v); }
  onEmergencyName(v: string):  void { this.emergencyName.set(v);  this.maybeCheckEmergency(); }
  onEmergencyPhone(v: string): void { this.emergencyPhone.set(v); this.maybeCheckEmergency(); }
  private maybeCheckEmergency(): void { this.updateCheck(5, !!this.emergencyName() && !!this.emergencyPhone()); }

  get canSubmit(): boolean {
    return !!this.fullName() && !!this.phone() && !!this.address1();
  }

  submit(): void {
    if (!this.canSubmit) { this.modal.error('Please fill in all required fields'); return; }
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.modal.success('Patient registered successfully');
      this.router.navigate(['/patients']);
    }, 800);
  }

  cancel(): void { this.router.navigate(['/patients']); }
}