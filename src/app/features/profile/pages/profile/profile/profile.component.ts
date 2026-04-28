import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';

interface Session { device: string; deviceType: 'desktop' | 'mobile'; location: string; lastActive: string; isCurrent: boolean; }

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private modal = inject(ModalService);

  // Profile identity
  initials  = 'AD';
  fullName  = signal('Arjuna Silva');
  email     = signal('arjuna.silva@asiri.lk');
  phone     = signal('+94 77 123 4567');
  role      = 'Super Admin';
  memberSince = 'Jan 15, 2025';
  lastLogin   = 'Apr 20, 2026 · 09:14 AM';

  // Branch status (front-office focused, shown for demo)
  branchOnline = signal(true);
  branchName   = 'Colombo 03 Center';

  // Change password
  currentPw = signal('');
  newPw     = signal('');
  confirmPw = signal('');

  // 2FA
  twoFaEnabled = signal(true);

  // Active sessions
  sessions = signal<Session[]>([
    { device: 'Chrome · macOS',    deviceType: 'desktop', location: 'Colombo, LK', lastActive: 'Now',    isCurrent: true  },
    { device: 'Safari · iPhone',   deviceType: 'mobile',  location: 'Colombo, LK', lastActive: '2h ago', isCurrent: false },
    { device: 'Firefox · Windows', deviceType: 'desktop', location: 'Kandy, LK',   lastActive: '1d ago', isCurrent: false },
  ]);

  get canSavePersonal(): boolean {
    return !!this.fullName() && !!this.email();
  }

  get canChangePassword(): boolean {
    return !!this.currentPw() && this.newPw().length >= 8 && this.newPw() === this.confirmPw();
  }

  savePersonalInfo(): void {
    this.modal.success('Personal information updated');
  }

  changePassword(): void {
    if (!this.canChangePassword) { this.modal.error('Please check your password inputs'); return; }
    this.modal.success('Password changed successfully');
    this.currentPw.set(''); this.newPw.set(''); this.confirmPw.set('');
  }

  revokeSession(s: Session): void {
    this.modal.confirm({
      title: 'Revoke Session',
      message: `Revoke the session for ${s.device} (${s.location})?`,
      confirmLabel: 'Revoke',
      danger: true
    }).subscribe(ok => {
      if (ok) {
        this.sessions.update(list => list.filter(x => x !== s));
        this.modal.success('Session revoked');
      }
    });
  }

  logOutAll(): void {
    this.modal.confirm({
      title: 'Log Out All Other Sessions',
      message: 'This will immediately revoke all sessions except your current one.',
      confirmLabel: 'Log Out All',
      danger: true
    }).subscribe(ok => {
      if (ok) {
        this.sessions.update(list => list.filter(x => x.isCurrent));
        this.modal.success('All other sessions revoked');
      }
    });
  }

  logout(): void {
    this.modal.confirm({
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      confirmLabel: 'Log Out'
    }).subscribe(ok => {
      if (ok) this.modal.info('Logging out...');
    });
  }

  toggleBranch(): void {
    const goingOffline = this.branchOnline();
    if (goingOffline) {
      this.modal.confirm({
        title: 'Go Offline',
        message: `Take ${this.branchName} offline? No new jobs will be dispatched to this branch.`,
        confirmLabel: 'Go Offline',
        danger: true
      }).subscribe(ok => { if (ok) this.branchOnline.set(false); });
    } else {
      this.branchOnline.set(true);
      this.modal.success(`${this.branchName} is now online`);
    }
  }
}