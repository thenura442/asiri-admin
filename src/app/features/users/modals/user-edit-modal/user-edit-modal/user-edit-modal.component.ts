import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '@shared/services/modal/modal.service';

@Component({
  selector: 'app-user-edit-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-edit-modal.component.html',
  styleUrl: './user-edit-modal.component.scss'
})
export class UserEditModalComponent implements OnInit {
  user   = input<any>(null);
  closed = output<void>();
  saved  = output<void>();

  private modal = inject(ModalService);

  fullName  = signal('');
  email     = signal('');
  nic       = signal('');
  phone     = signal('');
  role      = signal('front_office');
  branch    = signal('Colombo 03 Center');
  status    = signal<'active' | 'inactive' | 'suspended'>('active');
  require2fa = signal(true);

  roles = [
    { value: 'super_admin',    label: 'Super Admin'    },
    { value: 'lab_manager',    label: 'Lab Manager'    },
    { value: 'lab_technician', label: 'Lab Technician' },
    { value: 'front_office',   label: 'Front Office'   },
    { value: 'business_admin', label: 'Business Admin' },
  ];

  branches = [
    'All Access', 'Asiri Central Lab', 'Asiri Surgical Lab',
    'Colombo 03 Center', 'Nugegoda Center', 'Dehiwala Center', 'Kandy Center', 'Matara Center'
  ];

  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.fullName.set(u.fullName ?? '');
      this.email.set(u.email ?? '');
      this.nic.set(u.nic ?? '');
      this.role.set(u.role ?? 'front_office');
      this.branch.set(u.branchLabel ?? '');
      this.status.set(u.status === 'locked' ? 'active' : (u.status ?? 'active'));
    }
  }

  resetPassword(): void {
    this.modal.confirm({
      title: 'Reset Password',
      message: `Send a password reset email to ${this.email()}?`,
      confirmLabel: 'Send Reset Email'
    }).subscribe(ok => { if (ok) this.modal.success('Password reset email sent'); });
  }

  confirmDelete(): void {
    this.modal.confirm({
      title: 'Delete User',
      message: `Delete ${this.fullName()}'s account? This cannot be undone.`,
      confirmLabel: 'Delete User',
      danger: true
    }).subscribe(ok => { if (ok) this.closed.emit(); });
  }

  save(): void { this.saved.emit(); }
  close(): void { this.closed.emit(); }
}