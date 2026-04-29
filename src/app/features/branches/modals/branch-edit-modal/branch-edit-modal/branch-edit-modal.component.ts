import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { BranchService } from '@features/branches/services/branch/branch.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { Branch, UpdateBranchDto } from '@core/models/branch.model';
import { BranchType } from '@core/enums/branch-type.enum';

@Component({
  selector: 'app-branch-edit-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-edit-modal.component.html',
  styleUrl: './branch-edit-modal.component.scss'
})
export class BranchEditModalComponent implements OnInit {
  branch = input<Branch | null>(null);
  closed = output<void>();
  saved  = output<Branch>();

  private branchSvc    = inject(BranchService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);

  isSaving   = signal(false);
  isDeleting = signal(false);
  errors     = signal<Record<string, string>>({});

  // Form fields
  name             = signal('');
  address          = signal('');
  latitude         = signal('');
  longitude        = signal('');
  phone            = signal('');
  email            = signal('');
  branchType       = signal<BranchType>(BranchType.LAB);
  operatingStart   = signal('06:30');
  operatingEnd     = signal('16:00');
  serviceRadiusKm  = signal('');
  maxDailyCapacity = signal('');
  managerName      = signal('');
  managerPhone     = signal('');
  province         = signal('');
  district         = signal('');

  branchTypeOptions = [
    { value: BranchType.LAB,               label: 'Lab (Collection + Testing)' },
    { value: BranchType.COLLECTING_CENTER, label: 'Collecting Center (Collection Only)' },
  ];

  ngOnInit(): void {
    const b = this.branch();
    if (b) {
      this.name.set(b.name);
      this.address.set(b.address);
      this.latitude.set(String(b.latitude));
      this.longitude.set(String(b.longitude));
      this.phone.set(b.phone ?? '');
      this.email.set(b.email ?? '');
      this.branchType.set(b.type);
      this.operatingStart.set(b.operatingStart);
      this.operatingEnd.set(b.operatingEnd);
      this.serviceRadiusKm.set(b.serviceRadiusKm ? String(b.serviceRadiusKm) : '');
      this.maxDailyCapacity.set(b.maxDailyCapacity ? String(b.maxDailyCapacity) : '');
      this.managerName.set(b.managerName ?? '');
      this.managerPhone.set(b.managerPhone ?? '');
      this.province.set(b.province ?? '');
      this.district.set(b.district ?? '');
    }
  }

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  onName(v: string):    void { this.name.set(v);    this.clearError('name'); }
  onAddress(v: string): void { this.address.set(v); this.clearError('address'); }
  onLat(v: string):     void { this.latitude.set(v);  this.clearError('latitude'); }
  onLng(v: string):     void { this.longitude.set(v); this.clearError('longitude'); }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.name().trim())       e['name']      = 'Branch name is required';
    if (!this.address().trim())    e['address']   = 'Address is required';
    if (!this.latitude().trim())   e['latitude']  = 'Latitude is required';
    else if (isNaN(parseFloat(this.latitude())))  e['latitude']  = 'Must be a valid number';
    if (!this.longitude().trim())  e['longitude'] = 'Longitude is required';
    else if (isNaN(parseFloat(this.longitude()))) e['longitude'] = 'Must be a valid number';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  save(): void {
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below.');
      return;
    }
    const b = this.branch();
    if (!b) return;

    const dto: UpdateBranchDto = {
      name:             this.name().trim(),
      address:          this.address().trim(),
      latitude:         parseFloat(this.latitude()),
      longitude:        parseFloat(this.longitude()),
      type:             this.branchType(),
      operatingStart:   this.operatingStart(),
      operatingEnd:     this.operatingEnd(),
      phone:            this.phone().trim()            || null,
      email:            this.email().trim()            || null,
      serviceRadiusKm:  this.serviceRadiusKm()  ? parseInt(this.serviceRadiusKm())  : null,
      maxDailyCapacity: this.maxDailyCapacity() ? parseInt(this.maxDailyCapacity()) : null,
      managerName:      this.managerName().trim()      || null,
      managerPhone:     this.managerPhone().trim()     || null,
      province:         this.province().trim()         || null,
      district:         this.district().trim()         || null,
    };

    this.isSaving.set(true);
    this.branchSvc.update(b.id, dto)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updated) => {
          this.notification.success('Branch Updated', `"${updated.name}" has been updated successfully.`);
          this.saved.emit(updated);
          this.closed.emit();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409)      this.notification.error('Conflict', err.error?.message ?? 'Branch code already in use.');
          else if (err.status === 400) this.notification.error('Validation Error', Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message ?? 'Invalid data.');
          else if (err.status === 0)   this.notification.error('Connection Error', 'Cannot reach the server.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to update branch.');
        }
      });
  }

  confirmDelete(): void {
    const b = this.branch();
    if (!b) return;
    this.modal.confirm({
      title:        'Delete Branch',
      message:      `Delete "${b.name}"? Branches with active jobs cannot be deleted.`,
      confirmLabel: 'Delete Branch',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.isDeleting.set(true);
      this.branchSvc.delete(b.id)
        .pipe(finalize(() => this.isDeleting.set(false)))
        .subscribe({
          next: () => {
            this.notification.success('Branch Deleted', `"${b.name}" has been removed.`);
            this.closed.emit();
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 400) this.notification.error('Cannot Delete', err.error?.message ?? 'Branch may have active jobs.');
            else                    this.notification.error('Error', err.error?.message ?? 'Failed to delete branch.');
          }
        });
    });
  }

  close(): void {
    if (this.isSaving() || this.isDeleting()) return;
    this.closed.emit();
  }
}