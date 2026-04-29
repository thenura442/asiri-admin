import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';
import {
  Branch,
  BranchListResponse,
  CreateBranchDto,
  UpdateBranchDto
} from '@core/models/branch.model';
import { map } from 'rxjs/operators';

export interface BranchParams {
  page?:     number;
  limit?:    number;
  type?:     'lab' | 'collecting_center';
  isOnline?: boolean;
  search?:   string;
  province?: string;
}

@Injectable({ providedIn: 'root' })
export class BranchService {
  private api = inject(ApiService);

  getAll(params?: BranchParams): Observable<BranchListResponse> {
    return this.api.get<BranchListResponse>('/branches', { params: params as any });
  }

  getById(id: string): Observable<Branch> {
    return this.api.get<Branch>(`/branches/${id}`);
  }

  getLabs(): Observable<Branch[]> {
    return this.api.get<{ data: Branch[] }>('/branches/labs').pipe(
      map(res => res.data)
    );
  }

  create(data: CreateBranchDto): Observable<Branch> {
    return this.api.post<Branch>('/branches', data);
  }

  update(id: string, data: UpdateBranchDto): Observable<Branch> {
    return this.api.patch<Branch>(`/branches/${id}`, data);
  }

  toggleOnline(id: string): Observable<{ isOnline: boolean; message: string }> {
    return this.api.patch<{ isOnline: boolean; message: string }>(`/branches/${id}/toggle-online`, {});
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/branches/${id}`);
  }
}