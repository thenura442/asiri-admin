import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';

interface ToggleSetting { label: string; desc: string; value: boolean; }

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private modal = inject(ModalService);

  // User stats for the link card
  userStats = { total: 58, active: 53, locked: 1 };

  // Role Permissions toggles
  rolePermissions = signal<ToggleSetting[]>([
    { label: 'Fleet Access',    desc: 'Manage vehicle maintenance & driver logs',  value: true  },
    { label: 'Billing Reports', desc: 'View and export financial service data',      value: false },
    { label: 'Patient Data',    desc: 'Full access to medical records (PII)',        value: false },
  ]);

  // Security settings
  enforceMfa     = signal(true);
  sessionTimeout = signal('30 minutes');
  timeoutOptions = ['15 minutes', '30 minutes', '1 hour', '2 hours', '4 hours'];

  // Platform config
  serviceRadius      = signal(25);
  autoDispatchThresh = signal('3 requests/hr');
  bufferTime         = signal(15);
  aiOptimization     = signal(true);

  // Maintenance
  adminMaintenance  = signal(false);
  mobileMaintenance = signal(false);

  // Last modified (static for now)
  lastModified = 'Oct 24, 2023 at 14:32';

  togglePermission(i: number): void {
    const list = [...this.rolePermissions()];
    list[i] = { ...list[i], value: !list[i].value };
    this.rolePermissions.set(list);
  }

  rotateKeys(): void {
    this.modal.confirm({
      title: 'Rotate Security Keys',
      message: 'This will invalidate all existing session tokens. All users will be logged out immediately.',
      confirmLabel: 'Rotate Keys',
      danger: true
    }).subscribe(ok => {
      if (ok) this.modal.success('Security keys rotated successfully. All sessions invalidated.');
    });
  }

  restoreDefaults(): void {
    this.modal.confirm({
      title: 'Restore Defaults',
      message: 'Reset all platform configuration to factory defaults? This cannot be undone.',
      confirmLabel: 'Restore',
      danger: true
    }).subscribe(ok => {
      if (ok) {
        this.serviceRadius.set(25);
        this.bufferTime.set(15);
        this.autoDispatchThresh.set('3 requests/hr');
        this.modal.success('Platform defaults restored');
      }
    });
  }

  saveSettings(): void {
    this.modal.success('Global settings saved');
  }

  toggleMaintenance(type: 'admin' | 'mobile', value: boolean): void {
    if (value) {
      const label = type === 'admin' ? 'Admin Portal' : 'Mobile App';
      this.modal.confirm({
        title: `Enable ${label} Maintenance`,
        message: `This will immediately block all ${type === 'admin' ? 'admin portal users (except Super Admin)' : 'customer mobile app users'}. Are you sure?`,
        confirmLabel: 'Enable Maintenance',
        danger: true
      }).subscribe(ok => {
        if (ok) {
          if (type === 'admin') this.adminMaintenance.set(true);
          else this.mobileMaintenance.set(true);
          this.modal.warning(`${label} maintenance mode enabled`);
        }
      });
    } else {
      if (type === 'admin') this.adminMaintenance.set(false);
      else this.mobileMaintenance.set(false);
    }
  }
}