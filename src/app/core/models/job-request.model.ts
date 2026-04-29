import { JobStatus } from '../enums/job-status.enum';

// ─── List API shapes (/api/jobs) ───────────────────────────────────────────

export interface JobListTest {
  id:     string;
  status: string;
  test: {
    id:         string;
    name:       string;
    code:       string;
    sampleType: string;
  };
}

export interface JobListPatient {
  id:       string;
  fullName: string;
  phone:    string;
  flag:     string;
}

export interface JobListItem {
  id:                  string;
  requestNumber:       string;
  status:              string;
  urgency:             'normal' | 'urgent';
  address:             string;
  latitude:            number | null;
  longitude:           number | null;
  scheduledAt:         string | null;
  isScheduled:         boolean;
  totalPrice:          number;
  isExternalTransport: boolean;
  createdAt:           string;
  patient:             JobListPatient;
  branch:              { id: string; name: string } | null;
  driver:              { id: string; fullName: string } | null;
  vehicle:             { id: string; plateNumber: string; vehicleIdCode: string | null } | null;
  tests:               JobListTest[];
}

export interface JobListMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
  summary?:   {
    unallocated:    number;
    onMission:      number;
    urgent:         number;
    completedToday: number;
  };
}

export interface JobListResponse {
  data: JobListItem[];
  meta: JobListMeta;
}

// ─── Detail API shapes (/api/jobs/:id) ────────────────────────────────────

export interface JobDetailTest {
  id:              string;
  testId:          string;
  status:          string;
  collectionNotes: string | null;
  labReceived:     boolean;
  labReceivedAt:   string | null;
  reportUrl:       string | null;
  isCriticalValue: boolean;
  test: {
    id:                  string;
    name:                string;
    code:                string;
    sampleType:          string;
    prescriptionReq:     boolean;
  };
}

export interface JobDetailPatient {
  id:                   string;
  fullName:             string;
  initials:             string;
  age:                  number;
  gender:               string;
  uhid:                 string | null;
  phone:                string;
  address:              string;
  landmark:             string | null;
  emergencyName:        string | null;
  emergencyPhone:       string | null;
  flag:                 string;
  pendingCharges:       number;
  allergies:            string | null;
  existingConditions:   string | null;
  specialInstructions:  string | null;
}

export interface JobDetailDriver {
  id:          string;
  fullName:    string;
  phone:       string;
  avatarUrl:   string | null;
  status:      string;
  isOnline:    boolean;
}

export interface JobDetailVehicle {
  id:            string;
  plateNumber:   string;
  vehicleIdCode: string | null;
  vehicleType:   string;
  status:        string;
}

export interface JobRequest {
  id:                  string;
  requestNumber:       string;
  status:              string;
  urgency:             'normal' | 'urgent';
  address:             string;
  latitude:            number | null;
  longitude:           number | null;
  scheduledAt:         string | null;
  isScheduled:         boolean;
  basePrice:           number | null;
  distanceKm:          number | null;
  perKmRate:           number | null;
  transportFee:        number;
  totalPrice:          number | null;
  isExternalTransport: boolean;
  prescriptionUrl:     string | null;
  rejectionReason:     string | null;
  cancellationReason:  string | null;
  createdAt:           string;
  acceptedAt:          string | null;
  dispatchedAt:        string | null;
  completedAt:         string | null;
  patient:             JobDetailPatient;
  tests:               JobDetailTest[];
  driver:              JobDetailDriver | null;
  vehicle:             JobDetailVehicle | null;
  branch:              { id: string; name: string } | null;
}

// ─── Timeline (/api/jobs/:id/timeline) ───────────────────────────────────

export interface JobTimeline {
  id:          string;
  stepNumber:  number;
  title:       string;
  description: string | null;
  status:      'done' | 'active' | 'pending' | 'failed';
  timestamp:   string | null;
  performedBy: string | null;
  performer:   { id: string; fullName: string; role: string } | null;
  metadata:    Record<string, unknown> | null;
}

// ─── Available vehicles (/api/jobs/:id/available-vehicles) ───────────────

export interface AvailableVehicle {
  id:               string;
  plateNumber:      string;
  vehicleIdCode:    string | null;
  vehicleType:      string;
  distanceKm:       number;
  etaMinutes:       number;
  status:           string;
  currentDriverId:  string | null;
  currentDriver:    { id: string; fullName: string; phone: string } | null;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────

export interface CreateJobRequestDto {
  patientId:           string;
  testIds:             string[];
  address:             string;
  latitude:            number | null;
  longitude:           number | null;
  isScheduled:         boolean;
  scheduledAt:         string | null;
  urgency:             'normal' | 'urgent';
  prescriptionUrl:     string | null;
  notes:               string | null;
}

export interface AllocateJobDto {
  vehicleId: string;
  driverId:  string;
}

export interface RejectJobDto {
  reason: string;
}

export interface CancelJobDto {
  reason: string;
}