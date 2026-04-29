import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '@core/services/api/api.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';

interface ToggleSetting { label: string; desc: string; key: string; value: boolean; }

interface UserStats { total: number; active: number; locked: number; }

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private api          = inject(ApiService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);

  isLoading  = signal(false);
  isSaving   = signal(false);
  lastModified = signal<string | null>(null);

  userStats = signal<UserStats>({ total: 0, active: 0, locked: 0 });

  rolePermissions = signal<ToggleSetting[]>([
    { label: 'Fleet Access',    desc: 'Manage vehicle maintenance & driver logs',  key: 'perm_fleet_access',    value: true  },
    { label: 'Billing Reports', desc: 'View and export financial service data',     key: 'perm_billing_reports', value: false },
    { label: 'Patient Data',    desc: 'Full access to medical records (PII)',       key: 'perm_patient_data',    value: false },
  ]);

  enforceMfa         = signal(true);
  sessionTimeout     = signal('30 minutes');
  serviceRadius      = signal(25);
  autoDispatchThresh = signal('3 requests/hr');
  bufferTime         = signal(15);
  aiOptimization     = signal(true);
  adminMaintenance   = signal(false);
  mobileMaintenance  = signal(false);

  timeoutOptions = ['15 minutes', '30 minutes', '1 hour', '2 hours', '4 hours'];

  ngOnInit(): void {
    this.loadSettings();
    this.loadUserStats();
  }

  public loadSettings(): void {
    this.isLoading.set(true);
    this.api.get<any>('/settings')
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          // Backend returns array of { key, value, updatedAt, updatedBy }
          // or object map — handle both
          const settings: Record<string, any> = Array.isArray(res)
            ? res.reduce((acc: any, s: any) => { acc[s.key] = s.value; return acc; }, {})
            : (res.data ?? res);

          if (settings['enforce_mfa']          !== undefined) this.enforceMfa.set(settings['enforce_mfa']);
          if (settings['session_timeout']       !== undefined) this.sessionTimeout.set(settings['session_timeout']);
          if (settings['service_radius_km']     !== undefined) this.serviceRadius.set(Number(settings['service_radius_km']));
          if (settings['auto_dispatch_thresh']  !== undefined) this.autoDispatchThresh.set(settings['auto_dispatch_thresh']);
          if (settings['buffer_time_mins']      !== undefined) this.bufferTime.set(Number(settings['buffer_time_mins']));
          if (settings['ai_optimization']       !== undefined) this.aiOptimization.set(settings['ai_optimization']);
          if (settings['admin_maintenance']     !== undefined) this.adminMaintenance.set(settings['admin_maintenance']);
          if (settings['mobile_maintenance']    !== undefined) this.mobileMaintenance.set(settings['mobile_maintenance']);
          if (settings['perm_fleet_access']     !== undefined) this.updatePermValue('perm_fleet_access',    settings['perm_fleet_access']);
          if (settings['perm_billing_reports']  !== undefined) this.updatePermValue('perm_billing_reports', settings['perm_billing_reports']);
          if (settings['perm_patient_data']     !== undefined) this.updatePermValue('perm_patient_data',    settings['perm_patient_data']);

          // Last modified from most recent updatedAt
          if (Array.isArray(res) && res.length > 0) {
            const latest = res.reduce((a: any, b: any) =>
              new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
            );
            if (latest.updatedAt) {
              this.lastModified.set(new Date(latest.updatedAt).toLocaleString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              }));
            }
          }
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0) this.notification.error('Connection Error', 'Cannot reach the server.');
          else                  this.notification.error('Error', 'Failed to load settings.');
        }
      });
  }

  private loadUserStats(): void {
    this.api.get<any>('/users', { params: { page: 1, limit: 1 } }).subscribe({
      next: (res) => {
        this.userStats.update(s => ({ ...s, total: res.meta?.total ?? 0 }));
      },
      error: () => {}
    });
    this.api.get<any>('/users', { params: { page: 1, limit: 1, status: 'active' } }).subscribe({
      next: (res) => this.userStats.update(s => ({ ...s, active: res.meta?.total ?? 0 })),
      error: () => {}
    });
  }

  private updatePermValue(key: string, value: boolean): void {
    this.rolePermissions.update(list =>
      list.map(p => p.key === key ? { ...p, value } : p)
    );
  }

  togglePermission(i: number): void {
    const list = [...this.rolePermissions()];
    list[i] = { ...list[i], value: !list[i].value };
    this.rolePermissions.set(list);
  }

  saveSettings(): void {
    const payload: Record<string, any> = {
      enforce_mfa:         this.enforceMfa(),
      session_timeout:     this.sessionTimeout(),
      service_radius_km:   this.serviceRadius(),
      auto_dispatch_thresh: this.autoDispatchThresh(),
      buffer_time_mins:    this.bufferTime(),
      ai_optimization:     this.aiOptimization(),
    };

    // Add permission keys
    this.rolePermissions().forEach(p => { payload[p.key] = p.value; });

    this.isSaving.set(true);
    this.api.patch<any>('/settings', payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.notification.success('Settings Saved', 'Global settings updated successfully.');
          this.loadSettings();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)   this.notification.error('Connection Error', 'Cannot reach the server.');
          else if (err.status === 403) this.notification.error('Access Denied', 'Only Super Admins can modify settings.');
          else                    this.notification.error('Error', 'Failed to save settings.');
        }
      });
  }

  rotateKeys(): void {
    this.modal.confirm({
      title:        'Rotate Security Keys',
      message:      'This will invalidate all existing session tokens. All users will be logged out immediately.',
      confirmLabel: 'Rotate Keys',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.api.post<any>('/auth/rotate-keys', {}).subscribe({
        next: () => this.notification.success('Keys Rotated', 'All sessions invalidated successfully.'),
        error: () => this.notification.error('Error', 'Failed to rotate keys.')
      });
    });
  }

  restoreDefaults(): void {
    this.modal.confirm({
      title:        'Restore Defaults',
      message:      'Reset all platform configuration to factory defaults? This cannot be undone.',
      confirmLabel: 'Restore',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.serviceRadius.set(25);
      this.bufferTime.set(15);
      this.autoDispatchThresh.set('3 requests/hr');
      this.saveSettings();
    });
  }

  toggleMaintenance(type: 'admin' | 'mobile', value: boolean): void {
    if (value) {
      const label = type === 'admin' ? 'Admin Portal' : 'Mobile App';
      this.modal.confirm({
        title:        `Enable ${label} Maintenance`,
        message:      `This will immediately block all ${type === 'admin' ? 'admin portal users (except Super Admin)' : 'customer mobile app users'}. Are you sure?`,
        confirmLabel: 'Enable Maintenance',
        danger:       true
      }).subscribe(ok => {
        if (!ok) return;
        const key = type === 'admin' ? 'admin_maintenance' : 'mobile_maintenance';
        this.api.patch<any>(`/settings/${key}`, { value: true }).subscribe({
          next: () => {
            if (type === 'admin') this.adminMaintenance.set(true);
            else                  this.mobileMaintenance.set(true);
            this.notification.warning('Maintenance Enabled', `${label} is now in maintenance mode.`);
          },
          error: () => this.notification.error('Error', 'Failed to enable maintenance mode.')
        });
      });
    } else {
      const key = type === 'admin' ? 'admin_maintenance' : 'mobile_maintenance';
      this.api.patch<any>(`/settings/${key}`, { value: false }).subscribe({
        next: () => {
          if (type === 'admin') this.adminMaintenance.set(false);
          else                  this.mobileMaintenance.set(false);
          this.notification.success('Maintenance Disabled', `${type === 'admin' ? 'Admin Portal' : 'Mobile App'} is back online.`);
        },
        error: () => this.notification.error('Error', 'Failed to disable maintenance mode.')
      });
    }
  }
}