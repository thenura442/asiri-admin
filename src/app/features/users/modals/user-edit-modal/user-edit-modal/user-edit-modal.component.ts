import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '@features/users/services/user/user.service';
import { BranchService } from '@features/branches/services/branch/branch.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { CustomDropdownComponent, DropdownOption } from '@shared/components/ui/custom-dropdown/custom-dropdown/custom-dropdown.component';
import { User, UpdateUserDto } from '@core/models/user.model';
import { Branch } from '@core/models/branch.model';

@Component({
  selector: 'app-user-edit-modal',
  standalone: true,
  imports: [CommonModule, CustomDropdownComponent],
  templateUrl: './user-edit-modal.component.html',
  styleUrl: './user-edit-modal.component.scss'
})
export class UserEditModalComponent implements OnInit {
  user   = input<User | null>(null);
  closed = output<void>();
  saved  = output<void>();

  private userSvc      = inject(UserService);
  private branchSvc    = inject(BranchService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);

  isSaving   = signal(false);
  isDeleting = signal(false);
  errors     = signal<Record<string, string>>({});
  branches   = signal<Branch[]>([]);

  fullName         = signal('');
  nic              = signal('');
  phone            = signal('');
  role             = signal<string | null>(null);
  branchId         = signal<string | null>(null);
  status           = signal<'active' | 'inactive' | 'suspended'>('active');
  twoFactorEnabled = signal(false);

  roleOptions: DropdownOption[] = [
    { value: 'front_office',   label: 'Front Office'   },
    { value: 'lab_manager',    label: 'Lab Manager'    },
    { value: 'lab_technician', label: 'Lab Technician' },
    { value: 'business_admin', label: 'Business Admin' },
  ];

  branchOptions = signal<DropdownOption[]>([]);

  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.fullName.set(u.fullName);
      this.nic.set(u.nic ?? '');
      this.phone.set(u.phone ?? '');
      this.role.set(u.role);
      this.branchId.set(u.branchId);
      this.status.set(u.status);
      this.twoFactorEnabled.set(u.twoFactorEnabled);
    }
    this.loadBranches();
  }

  private loadBranches(): void {
    this.branchSvc.getAll({ limit: 100 }).subscribe({
      next: (res) => {
        this.branches.set(res.data);
        this.branchOptions.set(
          res.data.map(b => ({ value: b.id, label: b.name, meta: b.type }))
        );
      },
      error: () => {}
    });
  }

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  onFullName(v: string): void { this.fullName.set(v); this.clearError('fullName'); }
  onNic(v: string):      void { this.nic.set(v); }
  onPhone(v: string):    void { this.phone.set(v); }
  onRole(v: string | null):     void { this.role.set(v);     this.clearError('role'); }
  onBranch(v: string | null):   void { this.branchId.set(v); this.clearError('branchId'); }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.fullName().trim()) e['fullName'] = 'Full name is required';
    if (!this.role())            e['role']     = 'Role is required';
    if (!this.branchId())        e['branchId'] = 'Branch is required';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  save(): void {
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below.');
      return;
    }
    const u = this.user();
    if (!u) return;

    const dto: UpdateUserDto = {
      fullName:         this.fullName().trim(),
      nic:              this.nic().trim()   || undefined,
      phone:            this.phone().trim() || undefined,
      role:             this.role() as any,
      branchId:         this.branchId()!,
      status:           this.status(),
      twoFactorEnabled: this.twoFactorEnabled(),
    };

    this.isSaving.set(true);
    this.userSvc.update(u.id, dto)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.saved.emit();
          this.closed.emit();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server.');
          else if (err.status === 409) this.notification.error('Conflict', err.error?.message ?? 'NIC already in use.');
          else if (err.status === 400) this.notification.error('Validation Error', Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message ?? 'Invalid data.');
          else if (err.status === 500) this.notification.error('Server Error', 'Something went wrong. Please try again.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to update user.');
        }
      });
  }

  resetPassword(): void {
    const u = this.user();
    if (!u) return;
    this.modal.confirm({
      title:        'Reset Password',
      message:      `Send a password reset email to ${u.email}?`,
      confirmLabel: 'Send Reset Email'
    }).subscribe(ok => {
      if (!ok) return;
      this.userSvc.resetPassword(u.id).subscribe({
        next: () => this.notification.success('Reset Email Sent', `Password reset email sent to ${u.email}`),
        error: (err: HttpErrorResponse) => this.notification.error('Error', err.error?.message ?? 'Failed to send reset email.')
      });
    });
  }

  confirmDelete(): void {
    const u = this.user();
    if (!u) return;
    this.modal.confirm({
      title:        'Delete User',
      message:      `Delete ${u.fullName}'s account? This cannot be undone.`,
      confirmLabel: 'Delete User',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.isDeleting.set(true);
      this.userSvc.delete(u.id)
        .pipe(finalize(() => this.isDeleting.set(false)))
        .subscribe({
          next: () => {
            this.notification.success('User Deleted', `${u.fullName}'s account has been deleted.`);
            this.closed.emit();
          },
          error: (err: HttpErrorResponse) => {
            this.notification.error('Error', err.error?.message ?? 'Failed to delete user.');
          }
        });
    });
  }

  close(): void {
    if (this.isSaving() || this.isDeleting()) return;
    this.closed.emit();
  }
}