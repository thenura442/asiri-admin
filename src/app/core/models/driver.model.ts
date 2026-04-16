import { DriverStatus } from '../enums/driver-status.enum';

export interface Driver {
  id:                   string;
  staff_id:             string | null;
  full_name:            string;
  nic:                  string;
  date_of_birth:        string;
  phone:                string;
  license_number:       string;
  license_expiry:       string;
  branch_id:            string;
  branch_name:          string;
  license_photo_url:    string | null;
  id_front_url:         string | null;
  id_back_url:          string | null;
  status:               DriverStatus;
  is_online:            boolean;
  current_vehicle_id:   string | null;
  current_vehicle_plate: string | null;
  created_at:           string;
  updated_at:           string;
}

export interface CreateDriverDto {
  full_name:      string;
  nic:            string;
  date_of_birth:  string;
  phone:          string;
  license_number: string;
  license_expiry: string;
  branch_id:      string;
  staff_id?:      string;
}

export interface UpdateDriverDto extends Partial<CreateDriverDto> {
  status?: DriverStatus;
}

export interface DriverDocument {
  id:          string;
  driver_id:   string;
  type:        DocumentType;
  url:         string;
  expiry_date: string | null;
  uploaded_at: string;
}

export type DocumentType = 'nic' | 'license' | 'medical' | 'other';