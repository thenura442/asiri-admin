import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';

export interface DashboardStats {
  unallocated:        number;
  allocated:          number;
  inProgress:         number;
  completedToday:     number;
  completionGoal:     number;
  completionRate:     number;
  avgDispatchMinutes: number;
  onlineDrivers:      number;
  activeVehicles:     number;
}

export interface DashboardDriver {
  id:               string;
  initials:         string;
  fullName:         string;
  vehicleCode:      string;
  status:           string;
  isOnline:         boolean;
  currentJobStatus: string | null;
  jobProgress:      number;
}

export interface DashboardRecentJob {
  id:              string;
  requestNumber:   string;
  patientName:     string;
  patientInitials: string;
  testNames:       string[];
  status:          string;
  urgency:         string;
  address:         string;
  createdAt:       string;
}

export interface FleetLocation {
  vehicleId:     string;
  vehicleCode:   string;
  driverName:    string;
  status:        string;
  latitude:      number;
  longitude:     number;
  lastUpdatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(ApiService);

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/dashboard/stats').pipe(
      map((res: any) => res.data ?? res),
      catchError(() => of(this.mockStats()))
    );
  }

  getDrivers(): Observable<DashboardDriver[]> {
    return this.api.get<DashboardDriver[]>('/dashboard/drivers').pipe(
      map((res: any) => res.data ?? res),
      catchError(() => of(this.mockDrivers()))
    );
  }

  getRecentJobs(): Observable<DashboardRecentJob[]> {
    return this.api.get<any>('/dashboard/recent-jobs', { params: { limit: 3 } }).pipe(
      map((res: any) => {
        const list = res.data ?? res;
        return list.map((j: any) => ({
          id:              j.id,
          requestNumber:   j.requestNumber,
          patientName:     j.patientName,
          patientInitials: j.patientInitials,
          testNames:       j.testNames ?? [],
          status:          j.status,
          urgency:         j.urgency ?? 'normal',
          address:         j.address ?? '',  // not in API — fallback to empty
          createdAt:       j.createdAt,
        }));
      }),
      catchError(() => of(this.mockJobs()))
    );
  }

  getFleetLocations(): Observable<FleetLocation[]> {
    return this.api.get<FleetLocation[]>('/dashboard/fleet-locations').pipe(
      map((res: any) => res.data ?? res),
      catchError(() => of([]))
    );
  }

  // ─── Mock fallbacks ───────────────────────────────────────────────────────

  private mockStats(): DashboardStats {
    return {
      unallocated: 12, allocated: 24, inProgress: 18,
      completedToday: 145, completionGoal: 200,
      completionRate: 0.725, avgDispatchMinutes: 4.2,
      onlineDrivers: 8, activeVehicles: 6,
    };
  }

  private mockDrivers(): DashboardDriver[] {
    return [
      { id: '1', initials: 'AJ', fullName: 'Aruna Jayawardene', vehicleCode: 'VAN-LK-2033', status: 'active',    isOnline: true,  currentJobStatus: null,         jobProgress: 0    },
      { id: '2', initials: 'KM', fullName: 'Kasun Mendis',      vehicleCode: 'VAN-LK-4412', status: 'active',    isOnline: true,  currentJobStatus: 'en_route',   jobProgress: 0.65 },
      { id: '3', initials: 'SP', fullName: 'Sunil Perera',      vehicleCode: 'VAN-LK-1099', status: 'active',    isOnline: true,  currentJobStatus: 'collecting', jobProgress: 0.3  },
      { id: '4', initials: 'DC', fullName: 'Dinesh Chandimal',  vehicleCode: 'VAN-LK-8821', status: 'suspended', isOnline: false, currentJobStatus: null,         jobProgress: 0    },
      { id: '5', initials: 'PS', fullName: 'Prasad Silva',      vehicleCode: 'VAN-LK-3055', status: 'active',    isOnline: true,  currentJobStatus: null,         jobProgress: 0    },
      { id: '6', initials: 'NF', fullName: 'Nuwan Fernando',    vehicleCode: 'VAN-LK-7721', status: 'active',    isOnline: true,  currentJobStatus: 'en_route',   jobProgress: 0.45 },
    ];
  }

  private mockJobs(): DashboardRecentJob[] {
    return [
      { id: '1', requestNumber: 'REQ-2026-8801', patientName: 'Johnathan Doe', patientInitials: 'JD', testNames: ['Full Blood Count'], status: 'en_route',  urgency: 'normal', address: 'Colombo 03', createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: '2', requestNumber: 'REQ-2026-8802', patientName: 'Sarah Jenkins', patientInitials: 'SJ', testNames: ['Lipid Profile'],    status: 'pending',   urgency: 'urgent', address: 'Kandy',      createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: '3', requestNumber: 'REQ-2026-8803', patientName: 'Robert Brown',  patientInitials: 'RB', testNames: ['FBS'],              status: 'allocated', urgency: 'normal', address: 'Negombo',    createdAt: new Date(Date.now() - 5400000).toISOString() },
    ];
  }
}