import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { VehicleService } from '../../../services/vehicle/vehicle.service';
import { BranchService } from '@features/branches/services/branch/branch.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { CustomDropdownComponent, DropdownOption } from '@shared/components/ui/custom-dropdown/custom-dropdown/custom-dropdown.component';
import { FileUploadComponent } from '@shared/components/ui/file-upload/file-upload/file-upload.component';
import { CreateVehicleDto } from '@core/models/vehicle.model';

interface ChecklistItem { label: string; required: boolean; done: boolean; }

@Component({
  selector: 'app-vehicle-add',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomDropdownComponent, FileUploadComponent],
  templateUrl: './vehicle-add.component.html',
  styleUrl: './vehicle-add.component.scss'
})
export class VehicleAddComponent implements OnInit {
  private router       = inject(Router);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);
  private vehicleSvc   = inject(VehicleService);
  private branchSvc    = inject(BranchService);

  isSubmitting  = signal(false);
  isLoadingData = signal(false);
  submitted     = signal(false);
  errors        = signal<Record<string, string>>({});

  // Form fields
  vehicleIdCode     = signal('');
  plateNumber       = signal('');
  chassisNumber     = signal('');
  vehicleType       = signal<string | null>(null);
  makeModel         = signal('');
  year              = signal('');
  color             = signal('');
  branchId          = signal<string | null>(null);
  insuranceProvider = signal('');
  insuranceExpiry   = signal('');
  revenueLicExpiry  = signal('');
  lastServiceDate   = signal('');
  mileage           = signal('');
  nextServiceKm     = signal('');
  notes             = signal('');
  insuranceCertUrl  = signal<string | null>(null);

  typeOptions: DropdownOption[] = [
    { value: 'van', label: 'Van', dot: 'var(--accent)' },
    { value: 'car', label: 'Car', dot: 'var(--sbl)' },
  ];

  branchOptions = signal<DropdownOption[]>([]);

  // Sidebar context data from API
  fleetStats = signal({ total: 0, available: 0, busy: 0, offline: 0 });

  checklist = signal<ChecklistItem[]>([
    { label: 'License plate number provided', required: true,  done: false },
    { label: 'Chassis number provided',       required: true,  done: false },
    { label: 'Vehicle type selected',         required: true,  done: false },
    { label: 'Base branch assigned',          required: true,  done: false },
    { label: 'Insurance expiry date set',     required: false, done: false },
    { label: 'Revenue licence expiry set',    required: false, done: false },
  ]);

  ngOnInit(): void {
    this.loadBranches();
    this.loadFleetStats();
  }

  private loadBranches(): void {
    this.isLoadingData.set(true);
    // Vehicles must use getLabs() — only lab-type branches allowed
    this.branchSvc.getLabs()
      .pipe(finalize(() => this.isLoadingData.set(false)))
      .subscribe({
        next: (branches) => {
          this.branchOptions.set(
            branches.map(b => ({
              value: b.id,
              label: b.name,
              dot:   'var(--accent)',
            }))
          );
        },
        error: () => {
          this.notification.error('Error', 'Failed to load lab branches.');
        }
      });
  }

  private loadFleetStats(): void {
    this.vehicleSvc.getAll({ page: 1, limit: 1 }).subscribe({
      next: (res) => {
        this.fleetStats.set({
          total:     res.meta.total,
          available: res.meta.stats?.available ?? 0,
          busy:      res.meta.stats?.busy      ?? 0,
          offline:   res.meta.stats?.offline   ?? 0,
        });
      },
      error: () => {} // sidebar stats — fail silently
    });
  }

  private updateCheck(i: number, done: boolean): void {
    const list = [...this.checklist()];
    list[i] = { ...list[i], done };
    this.checklist.set(list);
  }

  onPlate(v: string):              void { this.plateNumber.set(v);      this.updateCheck(0, v.trim().length > 0); this.clearError('plateNumber'); }
  onChassis(v: string):            void { this.chassisNumber.set(v);    this.updateCheck(1, v.trim().length > 0); this.clearError('chassisNumber'); }
  onTypeSelect(v: string | null):  void { this.vehicleType.set(v);      this.updateCheck(2, !!v);                this.clearError('vehicleType'); }
  onBranchSelect(v: string | null):void { this.branchId.set(v);         this.updateCheck(3, !!v);                this.clearError('branchId'); }
  onInsuranceExpiry(v: string):    void { this.insuranceExpiry.set(v);  this.updateCheck(4, v.length > 0); }
  onRevenueLicExpiry(v: string):   void { this.revenueLicExpiry.set(v); this.updateCheck(5, v.length > 0); }

  onInsuranceCertUpload(event: { url?: string; file: File }): void {
    // After a real upload via POST /api/uploads/driver-document, the URL is returned
    // For now store the returned URL; real upload wired in uploads batch
    this.insuranceCertUrl.set(event.url ?? event.file.name);
  }

  onVehicleId(v: string): void {
    this.vehicleIdCode.set(v);
  }

  private clearError(field: string): void {
    this.errors.update(e => { const copy = { ...e }; delete copy[field]; return copy; });
  }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.plateNumber().trim())  e['plateNumber']  = 'License plate number is required';
    if (!this.chassisNumber().trim()) e['chassisNumber'] = 'Chassis number is required';
    if (!this.vehicleType())         e['vehicleType']  = 'Vehicle type is required';
    if (!this.branchId())            e['branchId']     = 'Base branch is required';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below.');
      return;
    }

    const dto: CreateVehicleDto = {
      plateNumber:       this.plateNumber().trim(),
      chassisNumber:     this.chassisNumber().trim(),
      vehicleType:       this.vehicleType() as 'van' | 'car',
      branchId:          this.branchId()!,
      vehicleIdCode:     this.vehicleIdCode().trim()   || null,
      makeModel:         this.makeModel().trim()        || null,
      yearOfManufacture: this.year() ? Number(this.year()) : null,
      color:             this.color().trim()            || null,
      notes:             this.notes().trim()            || null,
      insuranceProvider: this.insuranceProvider().trim() || null,
      insuranceExpiry:   this.insuranceExpiry()         || null,
      revenueLicExpiry:  this.revenueLicExpiry()        || null,
      lastServiceDate:   this.lastServiceDate()         || null,
      mileageKm:         this.mileage()    ? Number(this.mileage())    : null,
      nextServiceKm:     this.nextServiceKm() ? Number(this.nextServiceKm()) : null,
      insuranceCertUrl:  this.insuranceCertUrl(),
    };

    this.isSubmitting.set(true);
    this.vehicleSvc.create(dto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (vehicle) => {
          this.notification.success('Vehicle Registered', `${vehicle.plateNumber} has been added to the fleet.`);
          this.router.navigate(['/vehicles']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server. Check your internet.');
          else if (err.status === 400) this.notification.error('Validation Error', Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message ?? 'Invalid data.');
          else if (err.status === 409) this.notification.error('Conflict', err.error?.message ?? 'A vehicle with this plate or chassis already exists.');
          else if (err.status === 500) this.notification.error('Server Error', 'Something went wrong. Please try again.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to register vehicle.');
        }
      });
  }

  cancel(): void { this.router.navigate(['/vehicles']); }
}