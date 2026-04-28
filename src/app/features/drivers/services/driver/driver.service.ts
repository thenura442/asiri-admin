import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<any>  { return this.api.get<any>('/drivers', { params }); }
  getById(id: string): Observable<any>   { return this.api.get<any>(`/drivers/${id}`); }
  create(data: any): Observable<any>     { return this.api.post<any>('/drivers', data); }
  update(id: string, data: any): Observable<any> { return this.api.patch<any>(`/drivers/${id}`, data); }
  delete(id: string): Observable<any>    { return this.api.delete<any>(`/drivers/${id}`); }
  updateStatus(id: string, data: any): Observable<any> { return this.api.patch<any>(`/drivers/${id}/status`, data); }
}