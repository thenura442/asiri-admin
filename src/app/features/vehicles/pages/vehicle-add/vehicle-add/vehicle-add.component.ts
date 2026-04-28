import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';
import { CustomDropdownComponent, DropdownOption } from '@shared/components/ui/custom-dropdown/custom-dropdown/custom-dropdown.component';
import { FileUploadComponent } from '@shared/components/ui/file-upload/file-upload/file-upload.component';

interface ChecklistItem { label: string; required: boolean; done: boolean; }

@Component({
  selector: 'app-vehicle-add',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomDropdownComponent, FileUploadComponent],
  templateUrl: './vehicle-add.component.html',
  styleUrl: './vehicle-add.component.scss'
})
export class VehicleAddComponent {
  private router = inject(Router);
  private modal  = inject(ModalService);

  isSubmitting = signal(false);

  // Form fields
  vehicleIdCode     = signal('');
  plateNumber       = signal('');
  vehicleType       = signal<string | null>(null);
  makeModel         = signal('');
  year              = signal('');
  color             = signal('');
  branchId          = signal<string | null>(null);
  driverId          = signal<string | null>(null);
  insuranceProvider = signal('');
  insuranceExpiry   = signal('');
  revenueLicExpiry  = signal('');
  lastServiceDate   = signal('');
  mileage           = signal('');
  nextServiceKm     = signal('');
  photoUrl          = signal<string | null>(null);
  insuranceCertUrl  = signal<string | null>(null);

  typeOptions: DropdownOption[] = [
    { value: 'van', label: 'Van', dot: 'var(--accent)' },
    { value: 'car', label: 'Car', dot: 'var(--sbl)' },
  ];

  branchOptions: DropdownOption[] = [
    { value: 'b1', label: 'Asiri Central Lab',    dot: 'var(--accent)', group: 'Laboratories' },
    { value: 'b2', label: 'Asiri Surgical Lab',   dot: 'var(--accent)', group: 'Laboratories' },
    { value: 'b3', label: 'Colombo 03 Center',    dot: 'var(--sbl)',   group: 'Collecting Centers' },
    { value: 'b4', label: 'Nugegoda Center',      dot: 'var(--sbl)',   group: 'Collecting Centers' },
    { value: 'b5', label: 'Dehiwala Center',      dot: 'var(--sbl)',   group: 'Collecting Centers' },
    { value: 'b6', label: 'Kandy Center',         dot: 'var(--sbl)',   group: 'Collecting Centers' },
    { value: 'b7', label: 'Matara Center',        dot: 'var(--sbl)',   group: 'Collecting Centers' },
  ];

  driverOptions: DropdownOption[] = [
    { value: '',   label: 'None (assign later)', dot: 'var(--t5)' },
    { value: 'd1', label: 'Nimal Perera',        dot: 'var(--sg)' },
    { value: 'd2', label: 'Kamal Silva',         dot: 'var(--sg)' },
    { value: 'd3', label: 'Sunil Gamage',        dot: 'var(--sg)' },
    { value: 'd4', label: 'Aruna Jayawardene',   dot: 'var(--sg)' },
  ];

  fleetStats = { total: 42, active: 36, maintenance: 4, offline: 2 };

  recentAdditions = [
    { id: 'AS-MOB-41', initials: 'M1', date: '3 hours ago', status: 'Available', cls: 'status-avail' },
    { id: 'AS-MOB-40', initials: 'V2', date: '1 day ago',   status: 'Active',    cls: 'status-avail' },
    { id: 'AS-MOB-39', initials: 'K3', date: '3 days ago',  status: 'Maintenance', cls: 'status-maint' },
  ];

  checklist = signal<ChecklistItem[]>([
    { label: 'Vehicle ID entered',           required: false, done: false },
    { label: 'License plate number provided', required: false, done: false },
    { label: 'Vehicle type selected',         required: true,  done: false },
    { label: 'Base branch assigned',          required: true,  done: false },
    { label: 'Insurance expiry date set',     required: true,  done: false },
    { label: 'Vehicle photo uploaded',        required: true,  done: false },
  ]);

  private updateCheck(i: number, done: boolean): void {
    const list = [...this.checklist()];
    list[i] = { ...list[i], done };
    this.checklist.set(list);
  }

  onVehicleId(v: string):   void { this.vehicleIdCode.set(v); this.updateCheck(0, v.trim().length > 0); }
  onPlate(v: string):       void { this.plateNumber.set(v);   this.updateCheck(1, v.trim().length > 0); }
  onTypeSelect(v: string | null):   void { this.vehicleType.set(v);  this.updateCheck(2, !!v); }
  onBranchSelect(v: string | null): void { this.branchId.set(v);    this.updateCheck(3, !!v); }
  onInsuranceExpiry(v: string): void { this.insuranceExpiry.set(v); this.updateCheck(4, v.length > 0); }
  onPhotoUpload(): void { this.photoUrl.set('uploaded'); this.updateCheck(5, true); }

  get canSubmit(): boolean {
    return !!this.vehicleType() && !!this.branchId() && this.insuranceExpiry().length > 0;
  }

  submit(): void {
    if (!this.canSubmit) { this.modal.error('Please fill in all required fields'); return; }
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.modal.success('Vehicle registered successfully');
      this.router.navigate(['/vehicles']);
    }, 800);
  }

  cancel(): void { this.router.navigate(['/vehicles']); }
}