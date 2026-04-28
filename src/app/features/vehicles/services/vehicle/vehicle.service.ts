import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<any> { return this.api.get<any>('/vehicles', { params }); }
  getById(id: string): Observable<any>  { return this.api.get<any>(`/vehicles/${id}`); }
  create(data: any): Observable<any>    { return this.api.post<any>('/vehicles', data); }
  update(id: string, data: any): Observable<any> { return this.api.patch<any>(`/vehicles/${id}`, data); }
  delete(id: string): Observable<any>   { return this.api.delete<any>(`/vehicles/${id}`); }
  assignDriver(id: string, data: any): Observable<any> { return this.api.post<any>(`/vehicles/${id}/assign-driver`, data); }
}