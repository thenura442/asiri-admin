import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  'dashboard':     'Dashboard',
  'job-requests':  'Job Requests',
  'vehicles':      'Vehicles',
  'drivers':       'Drivers',
  'patients':      'Patients',
  'tests':         'Tests & Services',
  'branches':      'Branches',
  'lab-approvals': 'Lab Approvals',
  'users':         'User Management',
  'reports':       'Reports & Analytics',
  'notifications': 'Notifications',
  'settings':      'Settings',
  'profile':       'Profile',
  'new':           'New',
  'add':           'Add',
  'tracking':      'Tracking',
};

const SECTION_LABELS: Record<string, string> = {
  'dashboard':     'Operations',
  'job-requests':  'Operations',
  'vehicles':      'Fleet',
  'drivers':       'Fleet',
  'patients':      'Management',
  'tests':         'Management',
  'branches':      'Management',
  'lab-approvals': 'Lab',
  'users':         'System',
  'reports':       'Analytics',
  'notifications': 'System',
  'settings':      'System',
  'profile':       'System',
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private clockInterval: any;

  userInitials      = 'AD';
  notificationCount = 3;
  greeting          = this.getGreeting();
  time              = this.getTime();

  isDashboard  = false;
  breadcrumbs: BreadcrumbItem[] = [];

  ngOnInit(): void {
    this.buildBreadcrumbs(this.router.url);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.buildBreadcrumbs(e.urlAfterRedirects));

    this.clockInterval = setInterval(() => {
      this.time     = this.getTime();
      this.greeting = this.getGreeting();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  private buildBreadcrumbs(url: string): void {
    const segments = url.split('/').filter(Boolean);
    const root     = segments[0];

    this.isDashboard = root === 'dashboard';

    if (this.isDashboard) {
      this.breadcrumbs = [];
      return;
    }

    const section = SECTION_LABELS[root];
    const crumbs: BreadcrumbItem[] = [];

    if (section) {
      crumbs.push({ label: section });
    }

    if (segments[0] && ROUTE_LABELS[segments[0]]) {
      crumbs.push({ label: ROUTE_LABELS[segments[0]], route: '/' + segments[0] });
    }

    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      const label = ROUTE_LABELS[seg] ?? seg;
      crumbs.push({ label });
    }

    if (crumbs.length > 0) {
      crumbs[crumbs.length - 1].route = undefined;
    }

    this.breadcrumbs = crumbs;
  }

  private getTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  private getGreeting(): string {
    const h = new Date().getHours();
    return `Good ${h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'},`;
  }
}