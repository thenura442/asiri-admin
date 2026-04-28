import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';

@Injectable({ providedIn: 'root' })
export class TestService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<any>   { return this.api.get<any>('/tests', { params }); }
  getById(id: string): Observable<any>    { return this.api.get<any>(`/tests/${id}`); }
  create(data: any): Observable<any>      { return this.api.post<any>('/tests', data); }
  update(id: string, data: any): Observable<any> { return this.api.patch<any>(`/tests/${id}`, data); }
  delete(id: string): Observable<any>     { return this.api.delete<any>(`/tests/${id}`); }
  toggleActive(id: string, isActive: boolean): Observable<any> { return this.api.patch<any>(`/tests/${id}/toggle`, { isActive }); }
}