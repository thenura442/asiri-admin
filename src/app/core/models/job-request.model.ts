import { JobStatus } from '../enums/job-status.enum';
import { Urgency }   from '../enums/urgency.enum';

export interface JobRequest {
  id:               string;
  request_number:   string;
  patient_id:       string;
  patient_name:     string;
  patient_phone:    string;
  branch_id:        string | null;
  branch_name:      string | null;
  driver_id:        string | null;
  driver_name:      string | null;
  vehicle_id:       string | null;
  vehicle_plate:    string | null;
  lab_id:           string | null;
  address:          string;
  latitude:         number;
  longitude:        number;
  scheduled_at:     string | null;
  is_scheduled:     boolean;
  status:           JobStatus;
  urgency:          Urgency;
  base_price:       number;
  distance_km:      number | null;
  per_km_rate:      number | null;
  transport_fee:    number;
  total_price:      number;
  is_external_transport: boolean;
  prescription_url: string | null;
  rejection_reason: string | null;
  cancelled_by:     'customer' | 'branch' | 'super_admin' | null;
  cancellation_reason: string | null;
  late_cancellation:   boolean;
  late_cancel_fee:     number;
  tests:            JobRequestTest[];
  created_at:       string;
  updated_at:       string;
  accepted_at:      string | null;
  dispatched_at:    string | null;
  arrived_at:       string | null;
  collected_at:     string | null;
  completed_at:     string | null;
  deleted_at: string | null;
}

export interface JobRequestTest {
  id:               string;
  test_id:          string;
  test_name:        string;
  test_code:        string;
  status:           TestStatus;
  collection_notes: string | null;
  report_url:       string | null;
  is_critical_value: boolean;
}

export type TestStatus =
  | 'pending'
  | 'collected'
  | 'failed'
  | 'received_at_lab'
  | 'processing'
  | 'complete'
  | 'recollection_required';

export interface CreateJobRequestDto {
  patient_id:    string;
  address:       string;
  latitude:      number;
  longitude:     number;
  test_ids:      string[];
  urgency:       Urgency;
  scheduled_at?: string;
  notes?:        string;
}

export interface AllocateJobDto {
  vehicle_id: string;
  driver_id:  string;
}

export interface RejectJobDto {
  reason: string;
}

export interface CancelJobDto {
  reason:       string;
  cancelled_by: 'customer' | 'branch' | 'super_admin';
}