import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';
import {
  Patient, PatientListResponse,
  CreatePatientDto, UpdatePatientDto
} from '@core/models/patient.model';

export interface PatientParams {
  page?:   number;
  limit?:  number;
  flag?:   'new' | 'regular' | 'vip' | 'blacklisted';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private api = inject(ApiService);

  getAll(params?: PatientParams): Observable<PatientListResponse> {
    return this.api.get<PatientListResponse>('/patients', { params });
  }

  getById(id: string): Observable<Patient> {
    return this.api.get<Patient>(`/patients/${id}`);
  }

  create(dto: CreatePatientDto): Observable<Patient> {
    return this.api.post<Patient>('/patients', dto);
  }

  update(id: string, dto: UpdatePatientDto): Observable<Patient> {
    return this.api.patch<Patient>(`/patients/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/patients/${id}`);
  }
}