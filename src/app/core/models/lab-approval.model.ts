export type LabApprovalStatus =
  | 'sent_to_lab' | 'lab_received' | 'processing'
  | 'report_ready' | 'report_reviewed' | 'failed';

export interface LabApprovalTest {
  id:              string;
  status:          string;
  labReceived:     boolean;
  reportUrl:       string | null;
  isCriticalValue: boolean;
  test: {
    name:       string;
    code:       string;
    sampleType: string;
  };
}

export interface LabApproval {
  id:            string;
  requestNumber: string;
  status:        string;
  urgency:       'normal' | 'urgent';
  collectedAt:   string | null;
  patient: {
    id:       string;
    fullName: string;
    uhid:     string | null;
  };
  tests: LabApprovalTest[];
}

export interface LabApprovalListResponse {
  data: LabApproval[];
  meta: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
    hasNext:    boolean;
    hasPrev:    boolean;
  };
}

export interface ReceiveSampleItem {
  jobRequestTestId:   string;
  received:           boolean;
  notReceivedReason?: string | null;
  notes?:             string | null;
}

export interface ReceiveSamplesDto {
  jobRequestId:      string;
  samples:           ReceiveSampleItem[];   // ← satisfies @IsArray() validator
  jobRequestTestIds: string[];              // ← used by service logic
  overallNotes?:     string | null;
}

export interface ReportIssueDto {
  jobRequestId:     string;
  category:         string;
  details:          string;
  affectedTestIds:  string[];
  notes?:           string | null;
}

export interface UploadReportDto {
  jobRequestTestId: string;    // ← required by validator even though also in URL
  reportUrl:        string;
  isCriticalValue:  boolean;
  // criticalNotes removed — not in backend DTO
}