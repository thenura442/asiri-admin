import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';
import {
  LabApproval, LabApprovalListResponse,
  ReceiveSamplesDto, ReportIssueDto, UploadReportDto
} from '@core/models/lab-approval.model';

export interface LabApprovalParams {
  page?:   number;
  limit?:  number;
  status?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

@Injectable({ providedIn: 'root' })
export class LabApprovalService {
  private api = inject(ApiService);

  getAll(params?: LabApprovalParams): Observable<LabApprovalListResponse> {
    return this.api.get<LabApprovalListResponse>('/lab/approvals', { params });
  }

  receiveSamples(dto: ReceiveSamplesDto): Observable<any> {
    return this.api.post<any>('/lab/receive-samples', dto);
  }

  reportIssue(dto: ReportIssueDto): Observable<any> {
    return this.api.post<any>('/lab/report-issue', dto);
  }

  // jobId and testId both go in the URL — controller reads them as path params
  uploadReport(jobId: string, testId: string, dto: UploadReportDto): Observable<any> {
    return this.api.post<any>(`/lab/${jobId}/${testId}/upload-report`, dto);
  }

  reviewReport(jobId: string): Observable<LabApproval> {
    return this.api.patch<LabApproval>(`/lab/${jobId}/review-report`, {});
  }
}