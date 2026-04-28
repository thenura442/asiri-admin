import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';

@Injectable({ providedIn: 'root' })
export class LabApprovalService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<any>  { return this.api.get<any>('/lab-approvals', { params }); }
  receiveSamples(id: string, data: any): Observable<any> { return this.api.patch<any>(`/lab-approvals/${id}/receive`, data); }
  startProcessing(id: string): Observable<any>           { return this.api.patch<any>(`/lab-approvals/${id}/processing`, {}); }
  reportIssue(id: string, data: any): Observable<any>    { return this.api.patch<any>(`/lab-approvals/${id}/issue`, data); }
  uploadReport(id: string, data: any): Observable<any>   { return this.api.patch<any>(`/lab-approvals/${id}/report`, data); }
}