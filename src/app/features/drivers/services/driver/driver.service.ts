import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';
import {
  Driver, DriverListResponse,
  CreateDriverDto, UpdateDriverDto
} from '@core/models/driver.model';

export interface DriverParams {
  page?:                number;
  limit?:               number;
  status?:              'active' | 'inactive' | 'suspended';
  branchId?:            string;
  search?:              string;
  licenseExpiringSoon?: boolean;
  [key: string]: string | number | boolean | undefined;
}

@Injectable({ providedIn: 'root' })
export class DriverService {
  private api = inject(ApiService);

  getAll(params?: DriverParams): Observable<DriverListResponse> {
    return this.api.get<DriverListResponse>('/drivers', { params });
  }

  getById(id: string): Observable<Driver> {
    return this.api.get<Driver>(`/drivers/${id}`);
  }

  create(dto: CreateDriverDto): Observable<Driver> {
    return this.api.post<Driver>('/drivers', dto);
  }

  update(id: string, dto: UpdateDriverDto): Observable<Driver> {
    return this.api.patch<Driver>(`/drivers/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/drivers/${id}`);
  }

  updateDocuments(id: string, dto: { licensePhotoUrl?: string | null; idFrontUrl?: string | null; idBackUrl?: string | null }): Observable<Driver> {
    return this.api.patch<Driver>(`/drivers/${id}/documents`, dto);
  }
}