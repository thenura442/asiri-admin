import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { UserService } from '@features/users/services/user/user.service';
import { User, UserStatus } from '@core/models/user.model';
import { Role } from '@core/enums/role.enum';
import { TimeAgoPipe } from '@shared/pipes/time-ago/time-ago.pipe';
import { UserEditModalComponent } from '@features/users/modals/user-edit-modal/user-edit-modal/user-edit-modal.component';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

interface UserStats {
  superAdmins: number; frontOffice: number;
  labManagers: number; labTechnicians: number; businessAdmins: number;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UserEditModalComponent, TimeAgoPipe],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);
  private userSvc      = inject(UserService);

  activeFilter = signal<string>('all');
  searchQuery  = signal('');
  currentPage  = signal(1);
  totalCount   = signal(0);
  totalPages   = signal(1);
  isLoading    = signal(false);
  editingUser  = signal<User | null>(null);
  users        = signal<User[]>([]);

  stats = signal<UserStats>({
    superAdmins: 0, frontOffice: 0,
    labManagers: 0, labTechnicians: 0, businessAdmins: 0
  });

  filters = [
    { key: 'all',       label: 'All Users'  },
    { key: 'active',    label: 'Active'     },
    { key: 'inactive',  label: 'Inactive'   },
    { key: 'suspended', label: 'Suspended'  },
  ];

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.isLoading.set(true);
    const params: any = { page: this.currentPage(), limit: 10 };
    if (this.activeFilter() !== 'all') params.status = this.activeFilter();
    if (this.searchQuery())            params.search  = this.searchQuery();

    this.userSvc.getAll(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.users.set(res.data);
          this.totalCount.set(res.meta.total);
          this.totalPages.set(res.meta.totalPages);
          this.computeStats(res.data);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0) this.notification.error('Connection Error', 'Cannot reach the server.');
          else this.notification.error('Error', 'Failed to load users.');
        }
      });
  }

  private computeStats(users: User[]): void {
    this.stats.set({
      superAdmins:    users.filter(u => u.role === Role.SUPER_ADMIN).length,
      frontOffice:    users.filter(u => u.role === Role.FRONT_OFFICE).length,
      labManagers:    users.filter(u => u.role === Role.LAB_MANAGER).length,
      labTechnicians: users.filter(u => u.role === Role.LAB_TECHNICIAN).length,
      businessAdmins: users.filter(u => u.role === Role.BUSINESS_ADMIN).length,
    });
  }

  setFilter(key: string): void { this.activeFilter.set(key); this.currentPage.set(1); this.loadUsers(); }

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  getInitials(fullName: string): string {
    return fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  roleBadgeClass(role: string): string {
    const m: Record<string, string> = {
      super_admin: 'role-sa', front_office: 'role-fo',
      lab_manager: 'role-lm', lab_technician: 'role-lt', business_admin: 'role-ba'
    };
    return m[role] ?? 'role-fo';
  }

  roleLabel(role: string): string {
    const m: Record<string, string> = {
      super_admin: 'Super Admin', front_office: 'Front Office',
      lab_manager: 'Lab Manager', lab_technician: 'Lab Technician', business_admin: 'Business Admin'
    };
    return m[role] ?? role;
  }

  statusBadgeClass(status: string): string {
    return { active: 'bd-active', inactive: 'bd-inactive', suspended: 'bd-suspended' }[status] ?? 'bd-inactive';
  }

  isLocked(u: User): boolean {
    return !!u.lockedUntil && new Date(u.lockedUntil) > new Date();
  }

  openEdit(u: User): void { this.editingUser.set(u); }
  closeEdit(): void       { this.editingUser.set(null); }

  onUserSaved(): void {
    this.notification.success('User Updated', 'User account updated successfully');
    this.closeEdit();
    this.loadUsers();
  }

  unlockAccount(u: User): void {
    this.modal.confirm({
      title: 'Unlock Account',
      message: `Unlock ${u.fullName}'s account? Their failed login attempts will be reset.`,
      confirmLabel: 'Unlock'
    }).subscribe(ok => {
      if (!ok) return;
      this.userSvc.unlockAccount(u.id).subscribe({
        next: () => {
          this.notification.success('Account Unlocked', `${u.fullName}'s account has been unlocked`);
          this.loadUsers();
        },
        error: (err: HttpErrorResponse) => {
          this.notification.error('Error', err.error?.message ?? 'Failed to unlock account');
        }
      });
    });
  }

  resetPassword(u: User): void {
    this.modal.confirm({
      title: 'Reset Password',
      message: `Send a password reset email to ${u.fullName} (${u.email})?`,
      confirmLabel: 'Send Reset Email'
    }).subscribe(ok => {
      if (!ok) return;
      this.userSvc.resetPassword(u.id).subscribe({
        next: () => this.notification.success('Reset Email Sent', `Password reset email sent to ${u.email}`),
        error: (err: HttpErrorResponse) => this.notification.error('Error', err.error?.message ?? 'Failed to send reset email')
      });
    });
  }

  toggleSuspend(u: User): void {
    const isSuspended = u.status === 'suspended';
    this.modal.confirm({
      title:        isSuspended ? 'Reactivate User' : 'Suspend User',
      message:      isSuspended
        ? `Reactivate ${u.fullName}? They will regain access immediately.`
        : `Suspend ${u.fullName}? They will lose portal access immediately.`,
      confirmLabel: isSuspended ? 'Reactivate' : 'Suspend',
      danger:       !isSuspended
    }).subscribe(ok => {
      if (!ok) return;
      const newStatus: UserStatus = isSuspended ? 'active' : 'suspended';
      this.userSvc.update(u.id, { status: newStatus }).subscribe({
        next: () => {
          this.notification.success(
            isSuspended ? 'User Reactivated' : 'User Suspended',
            `${u.fullName} has been ${isSuspended ? 'reactivated' : 'suspended'}`
          );
          this.loadUsers();
        },
        error: (err: HttpErrorResponse) => this.notification.error('Error', err.error?.message ?? 'Failed to update status')
      });
    });
  }

  confirmDelete(u: User): void {
    this.modal.confirm({
      title: 'Delete User',
      message: `Delete ${u.fullName}'s account? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true
    }).subscribe(ok => {
      if (!ok) return;
      this.userSvc.delete(u.id).subscribe({
        next: () => {
          this.notification.success('User Deleted', `${u.fullName}'s account has been deleted`);
          this.loadUsers();
        },
        error: (err: HttpErrorResponse) => this.notification.error('Error', err.error?.message ?? 'Failed to delete user')
      });
    });
  }

  get pageRange(): number[] {
    return Array.from({ length: Math.min(this.totalPages(), 5) }, (_, i) => i + 1);
  }

  setPage(p: number): void { this.currentPage.set(p); this.loadUsers(); }
}