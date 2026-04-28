import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';

@Injectable({ providedIn: 'root' })
export class JobRequestService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<any> {
    return this.api.get<any>('/jobs', { params });
  }

  getById(id: string): Observable<any> {
    return this.api.get<any>(`/jobs/${id}`);
  }

  getTimeline(id: string): Observable<any> {
    return this.api.get<any>(`/jobs/${id}/timeline`);
  }

  getAvailableVehicles(id: string): Observable<any> {
    return this.api.get<any>(`/jobs/${id}/available-vehicles`);
  }

  create(data: any): Observable<any> {
    return this.api.post<any>('/jobs', data);
  }

  allocate(id: string, data: any): Observable<any> {
    return this.api.post<any>(`/jobs/${id}/allocate`, data);
  }

  reject(id: string, data: any): Observable<any> {
    return this.api.post<any>(`/jobs/${id}/reject`, data);
  }

  updateStatus(id: string, data: any): Observable<any> {
    return this.api.patch<any>(`/jobs/${id}/status`, data);
  }
}