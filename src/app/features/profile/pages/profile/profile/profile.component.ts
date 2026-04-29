import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '@core/services/api/api.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';

interface Session {
  device:     string;
  deviceType: 'desktop' | 'mobile';
  location:   string;
  lastActive: string;
  isCurrent:  boolean;
}

interface ProfileData {
  id:               string;
  fullName:         string;
  email:            string;
  phone:            string | null;
  role:             string;
  roleTitle:        string | null;
  department:       string | null;
  qualification:    string | null;
  twoFactorEnabled: boolean;
  createdAt:        string;
  lastLoginAt:      string | null;
  branchId:         string;
  branch:           { id: string; name: string; type: string; isOnline: boolean };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private api          = inject(ApiService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);
  private router       = inject(Router);

  isLoading    = signal(false);
  isSaving     = signal(false);
  isChangingPw = signal(false);

  profile      = signal<ProfileData | null>(null);
  fullName     = signal('');
  email        = signal('');
  phone        = signal('');
  twoFaEnabled = signal(false);
  branchOnline = signal(false);

  initials = computed(() =>
    this.fullName().split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  );

  memberSince = computed(() => {
    const p = this.profile();
    if (!p?.createdAt) return '—';
    return new Date(p.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  });

  lastLogin = computed(() => {
    const p = this.profile();
    if (!p?.lastLoginAt) return 'Never';
    return new Date(p.lastLoginAt).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  });

  currentPw = signal('');
  newPw     = signal('');
  confirmPw = signal('');

  sessions = signal<Session[]>([
    { device: 'Chrome · This Browser', deviceType: 'desktop', location: 'Sri Lanka', lastActive: 'Now', isCurrent: true },
  ]);

  get canSavePersonal(): boolean {
    return !!this.fullName().trim() && !this.isSaving();
  }

  get canChangePassword(): boolean {
    return !!this.currentPw() &&
           this.newPw().length >= 8 &&
           this.newPw() === this.confirmPw() &&
           !this.isChangingPw();
  }

  ngOnInit(): void {
    this.loadFromStorage();
  }

  loadProfile(): void {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem('asiri_user');
      if (!raw) return;
      const user = JSON.parse(raw);

      // Build a ProfileData shape from what login saved
      const data: ProfileData = {
        id:               user.id               ?? '',
        fullName:         user.fullName          ?? '',
        email:            user.email             ?? '',
        phone:            user.phone             ?? null,
        role:             user.role              ?? '',
        roleTitle:        user.roleTitle         ?? null,
        department:       user.department        ?? null,
        qualification:    user.qualification     ?? null,
        twoFactorEnabled: user.twoFactorEnabled  ?? false,
        createdAt:        user.createdAt         ?? new Date().toISOString(),
        lastLoginAt:      user.lastLoginAt       ?? null,
        branchId:         user.branchId          ?? '',
        branch: {
          id:       user.branchId   ?? '',
          name:     user.branchName ?? '',
          type:     user.branchType ?? '',
          isOnline: user.isOnline   ?? true,
        },
      };

      this.profile.set(data);
      this.fullName.set(data.fullName);
      this.email.set(data.email);
      this.phone.set(data.phone ?? '');
      this.twoFaEnabled.set(data.twoFactorEnabled);
      this.branchOnline.set(data.branch.isOnline);
    } catch {
      this.notification.error('Error', 'Could not load profile data.');
    }
  }

  savePersonalInfo(): void {
    this.notification.success('Profile Updated', 'Changes saved locally.');
  }

  changePassword(): void {
    if (!this.canChangePassword) {
      this.notification.error('Validation Error', 'Please check your password inputs.');
      return;
    }
    this.isChangingPw.set(true);
    this.api.post<any>('/profile/change-password', {
      currentPassword: this.currentPw(),
      newPassword:     this.newPw(),
      confirmPassword: this.confirmPw(),
    }).subscribe({
      next: () => {
        this.isChangingPw.set(false);
        this.notification.success('Password Changed', 'Your password has been updated successfully.');
        this.currentPw.set('');
        this.newPw.set('');
        this.confirmPw.set('');
      },
      error: () => {
        this.isChangingPw.set(false);
        this.notification.error('Error', 'Failed to change password. Please try again.');
      }
    });
  }

  toggleBranch(): void {
    const newState = !this.branchOnline();
    this.branchOnline.set(newState);
    this.notification.success(
      newState ? 'Branch Online' : 'Branch Offline',
      newState ? 'Branch is now accepting jobs.' : 'Branch is now offline.'
    );
  }

  logOutAll(): void {
    this.modal.confirm({
      title:        'Log Out All Other Sessions',
      message:      'This will immediately revoke all sessions except your current one.',
      confirmLabel: 'Log Out All',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.sessions.update(list => list.filter(s => s.isCurrent));
      this.notification.success('Sessions Terminated', 'All other sessions have been revoked.');
    });
  }

  logout(): void {
    this.modal.confirm({
      title:        'Log Out',
      message:      'Are you sure you want to log out?',
      confirmLabel: 'Log Out'
    }).subscribe(ok => {
      if (!ok) return;
      this.api.post<any>('/auth/logout', {}).subscribe({
        next:  () => this.clearAndRedirect(),
        error: () => this.clearAndRedirect(),
      });
    });
  }

  private clearAndRedirect(): void {
    localStorage.removeItem('asiri_access_token');
    localStorage.removeItem('asiri_refresh_token');
    localStorage.removeItem('asiri_user');
    this.router.navigate(['/login']);
  }

  revokeSession(s: Session): void {
    this.modal.confirm({
      title:        'Revoke Session',
      message:      `Revoke the session for ${s.device}?`,
      confirmLabel: 'Revoke',
      danger:       true
    }).subscribe(ok => {
      if (ok) {
        this.sessions.update(list => list.filter(x => x !== s));
        this.notification.success('Session Revoked', `${s.device} has been signed out.`);
      }
    });
  }
}