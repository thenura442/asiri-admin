import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '@core/services/api/api.service';
import {
  JobRequest, JobListResponse, CreateJobRequestDto,
  AllocateJobDto, RejectJobDto, CancelJobDto,
  JobTimeline, AvailableVehicle
} from '@core/models/job-request.model';

export interface JobParams {
  page?:    number;
  limit?:   number;
  status?:  string;
  urgency?: 'normal' | 'urgent';
  search?:  string;
  [key: string]: string | number | boolean | undefined;
}

@Injectable({ providedIn: 'root' })
export class JobRequestService {
  private api = inject(ApiService);

  getAll(params?: JobParams): Observable<JobListResponse> {
    return this.api.get<JobListResponse>('/jobs', { params });
  }

  getById(id: string): Observable<JobRequest> {
    return this.api.get<any>(`/jobs/${id}`).pipe(
      map(res => res.data ?? res)
    );
  }

  getTimeline(id: string): Observable<JobTimeline[]> {
    return this.api.get<any>(`/jobs/${id}/timeline`).pipe(
      map(res => res.data ?? res)
    );
  }

  getAvailableVehicles(id: string): Observable<AvailableVehicle[]> {
    return this.api.get<any>(`/jobs/${id}/available-vehicles`).pipe(
      map(res => {
        console.log('available-vehicles raw:', res);
        const unwrapped = res.data ?? res;
        console.log('available-vehicles unwrapped:', unwrapped);
        return unwrapped;
      })
    );
  }

  updateStatus(id: string, status: string): Observable<JobRequest> {
    return this.api.patch<any>(`/jobs/${id}/status`, { status }).pipe(
      map(res => res.data ?? res)
    );
  }

  create(dto: CreateJobRequestDto): Observable<JobRequest> {
    return this.api.post<any>('/jobs', dto).pipe(
      map(res => res.data ?? res)
    );
  }

  accept(id: string): Observable<JobRequest> {
    return this.api.post<any>(`/jobs/${id}/accept`, {}).pipe(
      map(res => res.data ?? res)
    );
  }

  allocate(id: string, dto: AllocateJobDto): Observable<JobRequest> {
    return this.api.post<any>(`/jobs/${id}/allocate`, dto).pipe(
      map(res => res.data ?? res)
    );
  }

  reject(id: string, dto: RejectJobDto): Observable<JobRequest> {
    return this.api.post<any>(`/jobs/${id}/reject`, dto).pipe(
      map(res => res.data ?? res)
    );
  }

  cancel(id: string, dto: CancelJobDto): Observable<JobRequest> {
    return this.api.post<any>(`/jobs/${id}/cancel`, dto).pipe(
      map(res => res.data ?? res)
    );
  }
}