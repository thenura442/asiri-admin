import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NotificationService } from '@core/services/notification/notification.service';
import { UserService } from '@features/users/services/user/user.service';
import { BranchService } from '@features/branches/services/branch/branch.service';
import { CustomDropdownComponent, DropdownOption } from '@shared/components/ui/custom-dropdown/custom-dropdown/custom-dropdown.component';
import { CreateUserDto } from '@core/models/user.model';
import { Role } from '@core/enums/role.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

interface ChecklistItem { label: string; required: boolean; done: boolean; }

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomDropdownComponent],
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.scss'
})
export class UserAddComponent implements OnInit {
  private router       = inject(Router);
  private notification = inject(NotificationService);
  private userSvc      = inject(UserService);
  private branchSvc    = inject(BranchService);

  isSubmitting = signal(false);
  submitted    = signal(false);

  // Form fields
  fullName      = signal('');
  staffId       = signal('');
  nic           = signal('');
  phone         = signal('');
  email         = signal('');
  tempPassword  = signal('');
  role          = signal<string | null>(null);
  branchId      = signal<string | null>(null);
  require2fa    = signal(true);
  department    = signal('');
  qualification = signal('');
  roleTitle     = signal('');
  notes         = signal('');

  // Validation errors
  errors = signal<Record<string, string>>({});

  // Dropdowns loaded from API
  branchOptions = signal<DropdownOption[]>([]);

  roleOptions: DropdownOption[] = [
    { value: Role.FRONT_OFFICE,   label: 'Front Office',   dot: 'var(--sa)',     meta: 'Bookings & Dispatch' },
    { value: Role.LAB_MANAGER,    label: 'Lab Manager',    dot: 'var(--sbl)',    meta: 'Branch Operations'   },
    { value: Role.LAB_TECHNICIAN, label: 'Lab Technician', dot: 'var(--accent)', meta: 'Lab Access'          },
    { value: Role.BUSINESS_ADMIN, label: 'Business Admin', dot: 'var(--t4)',     meta: 'View Only'           },
  ];

  portalStats = signal({ total: 0, active: 0, suspended: 0, locked: 0 });

  recentAccounts = signal<{ initials: string; name: string; date: string }[]>([]);

  checklist = signal<ChecklistItem[]>([
    { label: 'Full name entered',        required: true,  done: false },
    { label: 'Email address entered',    required: true,  done: false },
    { label: 'Role selected',            required: true,  done: false },
    { label: 'Branch assigned',          required: true,  done: false },
    { label: 'Temporary password set',   required: true,  done: false },
    { label: '2FA preference confirmed', required: false, done: true  },
  ]);

  ngOnInit(): void {
    this.loadBranches();
    this.loadPortalStats();
  }

  private loadBranches(): void {
    this.branchSvc.getAll({ limit: 100 }).subscribe({
      next: (res) => {
        this.branchOptions.set(
          res.data.map(b => ({
            value: b.id,
            label: b.name,
            dot:   b.type === 'lab' ? 'var(--accent)' : 'var(--sbl)',
            group: b.type === 'lab' ? 'Laboratories' : 'Collecting Centers'
          }))
        );
      },
      error: () => {}
    });
  }

  private loadPortalStats(): void {
    this.userSvc.getAll({ limit: 100 }).subscribe({
      next: (res) => {
        const active    = res.data.filter(u => u.status === 'active').length;
        const suspended = res.data.filter(u => u.status === 'suspended').length;
        const locked    = res.data.filter(u => !!u.lockedUntil && new Date(u.lockedUntil) > new Date()).length;
        this.portalStats.set({ total: res.meta.total, active, suspended, locked });

        const recent = [...res.data]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map(u => ({
            initials: u.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
            name:     u.fullName,
            date:     this.timeAgo(u.createdAt)
          }));
        this.recentAccounts.set(recent);
      },
      error: () => {}
    });
  }

  private timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7)  return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  private updateCheck(i: number, done: boolean): void {
    const list = [...this.checklist()];
    list[i] = { ...list[i], done };
    this.checklist.set(list);
  }

  private clearError(field: string): void {
    const e = { ...this.errors() };
    delete e[field];
    this.errors.set(e);
  }

  onFullName(v: string):      void { this.fullName.set(v);     this.updateCheck(0, v.trim().length > 0);    this.clearError('fullName'); }
  onEmail(v: string):         void { this.email.set(v);        this.updateCheck(1, v.includes('@'));         this.clearError('email'); }
  onRole(v: string | null):   void { this.role.set(v);         this.updateCheck(2, !!v);                    this.clearError('role'); }
  onBranch(v: string | null): void { this.branchId.set(v);     this.updateCheck(3, !!v);                    this.clearError('branchId'); }
  onTempPw(v: string):        void { this.tempPassword.set(v); this.updateCheck(4, v.length >= 8);          this.clearError('password'); }

  private validate(): boolean {
    const e: Record<string, string> = {};

    if (!this.fullName().trim())
      e['fullName'] = 'Full name is required';

    if (!this.email().trim())
      e['email'] = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()))
      e['email'] = 'Invalid email address';

    if (!this.role())
      e['role'] = 'Role is required';

    if (!this.branchId())
      e['branchId'] = 'Branch is required';

    if (!this.tempPassword())
      e['password'] = 'Temporary password is required';
    else if (this.tempPassword().length < 8)
      e['password'] = 'Password must be at least 8 characters';

    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below before submitting');
      return;
    }

    this.isSubmitting.set(true);

    const dto: CreateUserDto = {
      fullName:        this.fullName(),
      email:           this.email(),
      password:        this.tempPassword(),
      role:            this.role() as Role,
      branchId:        this.branchId()!,
      staffId:         this.staffId()  || null,
      nic:             this.nic()      || null,
      phone:           this.phone()    || null,
      roleTitle:       this.roleTitle() || null,
      department:      this.department() || null,
      qualification:   this.qualification() || null,
      notes:           this.notes()    || null,
      twoFactorEnabled: this.require2fa(),
    };

    this.userSvc.create(dto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (user) => {
          this.notification.success('User Created', `${user.fullName}'s account has been created`);
          this.router.navigate(['/users']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0) {
            this.notification.error('Connection Error', 'Cannot reach the server. Check your internet connection.');
          } else if (err.status === 409) {
            const msg = err.error?.message ?? 'This email is already in use.';
            this.errors.update(e => ({ ...e, email: msg }));
            this.notification.error('Conflict', msg);
          } else if (err.status === 400) {
            const msg = Array.isArray(err.error?.message)
              ? err.error.message.join(', ')
              : err.error?.message ?? 'Invalid data submitted.';
            this.notification.error('Validation Error', msg);
          } else if (err.status === 500) {
            this.notification.error('Server Error', 'Something went wrong. Please try again.');
          } else {
            this.notification.error('Error', err.error?.message ?? 'Failed to create user.');
          }
        }
      });
  }

  cancel(): void { this.router.navigate(['/users']); }
}