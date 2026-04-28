import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats, DashboardDriver, DashboardRecentJob } from '../../../services/dashboard/dashboard.service';
import { StatCardComponent } from '../../../components/stat-card/stat-card/stat-card.component';
import { TimeAgoPipe } from '@shared/pipes/time-ago/time-ago.pipe';
import { DriverStatusPanelComponent } from '@features/dashboard/components/driver-status-panel/driver-status-panel/driver-status-panel.component';
import { FleetMapComponent } from '@features/dashboard/components/fleet-map/fleet-map/fleet-map.component';
import { NotificationWidgetComponent } from '@features/dashboard/components/notification-widget/notification-widget/notification-widget.component';
import { RecentJobsComponent } from '@features/dashboard/components/recent-jobs/recent-jobs/recent-jobs.component';
import { FulfillmentBarComponent } from '@features/dashboard/components/fulfillment-bar/fulfillment-bar/fulfillment-bar.component';

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
    TimeAgoPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);

  // Clock
  greeting  = signal('Good morning');
  userName  = signal('Arjuna');
  clockTime = signal('');
  private clockInterval: ReturnType<typeof setInterval> | null = null;

  // Data signals
  stats         = signal<DashboardStats | null>(null);
  drivers       = signal<DashboardDriver[]>([]);
  recentJobs    = signal<DashboardRecentJob[]>([]);
  isLoading     = signal(true);

  // Mock data for static UI
  private mockStats: DashboardStats = {
    unallocated: 12, allocated: 24, inProgress: 18,
    completedToday: 145, completionGoal: 200,
    completionRate: 0.725, avgDispatchMinutes: 4.2,
    onlineDrivers: 8, activeVehicles: 6
  };

  private mockDrivers: DashboardDriver[] = [
    { id: '1', initials: 'AJ', fullName: 'Aruna Jayawardene', vehicleCode: 'VAN-LK-2033', status: 'active', isOnline: true,  currentJobStatus: null, jobProgress: 0 },
    { id: '2', initials: 'KM', fullName: 'Kasun Mendis',      vehicleCode: 'VAN-LK-4412', status: 'active', isOnline: true,  currentJobStatus: 'en_route', jobProgress: 0.65 },
    { id: '3', initials: 'SP', fullName: 'Sunil Perera',      vehicleCode: 'VAN-LK-1099', status: 'active', isOnline: true,  currentJobStatus: 'collecting', jobProgress: 0.3 },
    { id: '4', initials: 'DC', fullName: 'Dinesh Chandimal',  vehicleCode: 'VAN-LK-8821', status: 'suspended', isOnline: false, currentJobStatus: null, jobProgress: 0 },
    { id: '5', initials: 'PS', fullName: 'Prasad Silva',      vehicleCode: 'VAN-LK-3055', status: 'active', isOnline: true,  currentJobStatus: null, jobProgress: 0 },
    { id: '6', initials: 'NF', fullName: 'Nuwan Fernando',    vehicleCode: 'VAN-LK-7721', status: 'active', isOnline: true,  currentJobStatus: 'en_route', jobProgress: 0.45 },
  ];

  private mockJobs: DashboardRecentJob[] = [
    { id: '1', requestNumber: 'REQ-2026-8801', patientName: 'Johnathan Doe',   patientInitials: 'JD', testNames: ['Full Blood Count'], status: 'en_route',  urgency: 'normal', address: 'Colombo 03', createdAt: new Date(Date.now() - 1800000).toISOString() },
    { id: '2', requestNumber: 'REQ-2026-8802', patientName: 'Sarah Jenkins',   patientInitials: 'SJ', testNames: ['Lipid Profile'],    status: 'pending',   urgency: 'urgent', address: 'Kandy',      createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', requestNumber: 'REQ-2026-8803', patientName: 'Robert Brown',    patientInitials: 'RB', testNames: ['FBS'],              status: 'allocated', urgency: 'normal', address: 'Negombo',    createdAt: new Date(Date.now() - 5400000).toISOString() },
  ];

  ngOnInit(): void {
    this.setGreeting();
    this.startClock();
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  private setGreeting(): void {
    const h = new Date().getHours();
    this.greeting.set(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
  }

  private startClock(): void {
    const tick = () => {
      this.clockTime.set(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }));
    };
    tick();
    this.clockInterval = setInterval(tick, 1000);
  }

  private loadData(): void {
    // Using mock data for static UI — replace with API calls when wiring up
    setTimeout(() => {
      this.stats.set(this.mockStats);
      this.drivers.set(this.mockDrivers);
      this.recentJobs.set(this.mockJobs);
      this.isLoading.set(false);
    }, 400);
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      pending: 'var(--sa)', queued: 'var(--t5)', accepted: 'var(--sb)',
      allocated: 'var(--accent)', en_route: 'var(--sb)', completed: 'var(--sg)',
      cancelled: 'var(--sr)', failed: 'var(--sr)', collecting: 'var(--accent)'
    };
    return map[status] ?? 'var(--t5)';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pending', en_route: 'En Route', allocated: 'Allocated',
      collecting: 'Collecting', completed: 'Completed', cancelled: 'Cancelled',
      failed: 'Failed', accepted: 'Accepted', dispatched: 'Dispatched'
    };
    return map[status] ?? status;
  }
}