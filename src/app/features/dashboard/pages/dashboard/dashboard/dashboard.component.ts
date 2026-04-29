import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardService, DashboardStats, DashboardDriver, DashboardRecentJob, FleetLocation } from '../../../services/dashboard/dashboard.service';
import { StatCardComponent } from '../../../components/stat-card/stat-card/stat-card.component';
import { TimeAgoPipe } from '@shared/pipes/time-ago/time-ago.pipe';
import { DriverStatusPanelComponent } from '@features/dashboard/components/driver-status-panel/driver-status-panel/driver-status-panel.component';
import { FleetMapComponent } from '@features/dashboard/components/fleet-map/fleet-map/fleet-map.component';
import { NotificationWidgetComponent } from '@features/dashboard/components/notification-widget/notification-widget/notification-widget.component';
import { RecentJobsComponent } from '@features/dashboard/components/recent-jobs/recent-jobs/recent-jobs.component';
import { FulfillmentBarComponent } from '@features/dashboard/components/fulfillment-bar/fulfillment-bar/fulfillment-bar.component';
import { NotificationService } from '@core/services/notification/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    DriverStatusPanelComponent,
    FleetMapComponent,
    NotificationWidgetComponent,
    RecentJobsComponent,
    FulfillmentBarComponent,
    TimeAgoPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private notification     = inject(NotificationService);

  greeting       = signal('Good morning');
  userName       = signal('');
  clockTime      = signal('');
  isLoading      = signal(true);

  stats          = signal<DashboardStats | null>(null);
  drivers        = signal<DashboardDriver[]>([]);
  recentJobs     = signal<DashboardRecentJob[]>([]);
  fleetLocations = signal<FleetLocation[]>([]);

  private clockInterval:  ReturnType<typeof setInterval> | null = null;
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.setGreeting();
    this.loadUserName();
    this.startClock();
    this.loadData();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.clockInterval)   clearInterval(this.clockInterval);
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  private setGreeting(): void {
    const h = new Date().getHours();
    this.greeting.set(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
  }

  private loadUserName(): void {
    try {
      const raw = localStorage.getItem('asiri_user');
      if (raw) {
        const user = JSON.parse(raw);
        const first = (user.fullName ?? user.name ?? '').split(' ')[0];
        this.userName.set(first || 'there');
      }
    } catch {
      this.userName.set('there');
    }
  }

  private startClock(): void {
    const tick = () => {
      this.clockTime.set(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
    };
    tick();
    this.clockInterval = setInterval(tick, 1000);
  }

  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.loadData(true);
    }, 60_000);
  }

  loadData(silent = false): void {
    if (!silent) this.isLoading.set(true);

    // Stats
    this.dashboardService.getStats()
      .pipe(finalize(() => { if (!silent) this.isLoading.set(false); }))
      .subscribe({
        next:  (data) => this.stats.set(data),
        error: (err: HttpErrorResponse) => {
          if (!silent) {
            if (err.status === 0) this.notification.error('Connection Error', 'Cannot reach the server.');
            else                  this.notification.error('Error', 'Failed to load dashboard stats.');
          }
        }
      });

    // Drivers
    this.dashboardService.getDrivers().subscribe({
      next:  (data) => this.drivers.set(data),
      error: () => {}
    });

    // Recent jobs
    this.dashboardService.getRecentJobs().subscribe({
      next:  (data) => this.recentJobs.set(data),
      error: () => {}
    });

    // Fleet locations
    this.dashboardService.getFleetLocations().subscribe({
      next:  (data) => this.fleetLocations.set(data),
      error: () => {}
    });
  }
}