import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';

export interface DashboardStats {
  unallocated: number;
  allocated: number;
  inProgress: number;
  completedToday: number;
  completionGoal: number;
  completionRate: number;
  avgDispatchMinutes: number;
  onlineDrivers: number;
  activeVehicles: number;
}

export interface DashboardDriver {
  id: string;
  initials: string;
  fullName: string;
  vehicleCode: string;
  status: string;
  isOnline: boolean;
  currentJobStatus: string | null;
  jobProgress: number;
}

export interface DashboardRecentJob {
  id: string;
  requestNumber: string;
  patientName: string;
  patientInitials: string;
  testNames: string[];
  status: string;
  urgency: string;
  address: string;
  createdAt: string;
}

export interface FleetLocation {
  vehicleId: string;
  vehicleCode: string;
  driverName: string;
  driverInitials: string;
  status: string;
  latitude: number;
  longitude: number;
  lastUpdatedAt: string;
}

export interface DashboardNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(ApiService);

  getStats(): Observable<any> {
    return this.api.get<any>('/dashboard/stats');
  }

  getDrivers(): Observable<any> {
    return this.api.get<any>('/dashboard/drivers');
  }

  getRecentJobs(): Observable<any> {
    return this.api.get<any>('/dashboard/recent-jobs');
  }

  getFleetLocations(): Observable<any> {
    return this.api.get<any>('/dashboard/fleet-locations');
  }
}