import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';
import { Test, TestListResponse, CreateTestDto, UpdateTestDto } from '@core/models/test.model';

export interface TestParams {
  page?:       number;
  limit?:      number;
  sampleType?: 'blood' | 'urine';
  isActive?:   boolean;
  search?:     string;
  [key: string]: string | number | boolean | undefined;
}

@Injectable({ providedIn: 'root' })
export class TestService {
  private api = inject(ApiService);

  getAll(params?: TestParams): Observable<TestListResponse> {
    return this.api.get<TestListResponse>('/tests', { params });
  }

  getById(id: string): Observable<Test> {
    return this.api.get<Test>(`/tests/${id}`);
  }

  create(dto: CreateTestDto): Observable<Test> {
    return this.api.post<Test>('/tests', dto);
  }

  update(id: string, dto: UpdateTestDto): Observable<Test> {
    return this.api.patch<Test>(`/tests/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/tests/${id}`);
  }
}