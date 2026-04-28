import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<any>  { return this.api.get<any>('/patients', { params }); }
  getById(id: string): Observable<any>   { return this.api.get<any>(`/patients/${id}`); }
  create(data: any): Observable<any>     { return this.api.post<any>('/patients', data); }
  update(id: string, data: any): Observable<any> { return this.api.patch<any>(`/patients/${id}`, data); }
  delete(id: string): Observable<any>    { return this.api.delete<any>(`/patients/${id}`); }
  getHistory(id: string): Observable<any>{ return this.api.get<any>(`/patients/${id}/history`); }
}