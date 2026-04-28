import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardDriver } from '../../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-driver-status-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './driver-status-panel.component.html',
  styleUrl: './driver-status-panel.component.scss'
})
export class DriverStatusPanelComponent {
  drivers = input<DashboardDriver[]>([]);

  dotColor(driver: DashboardDriver): string {
    if (!driver.isOnline) return 'var(--t5)';
    if (driver.currentJobStatus) return 'var(--sb)';
    return 'var(--sg)';
  }

  badgeClass(driver: DashboardDriver): string {
    if (!driver.isOnline)         return 'bd-offline';
    if (driver.currentJobStatus)  return 'bd-progress';
    return 'bd-available';
  }

  badgeLabel(driver: DashboardDriver): string {
    if (!driver.isOnline)         return 'Offline';
    if (driver.currentJobStatus)  return 'In Progress';
    return 'Available';
  }
}