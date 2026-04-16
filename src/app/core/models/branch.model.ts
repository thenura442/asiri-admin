import { BranchType } from '../enums/branch-type.enum';

export interface Branch {
  id:                 string;
  name:               string;
  type:               BranchType;
  address:            string;
  latitude:           number;
  longitude:          number;
  branch_code:        string | null;
  phone:              string | null;
  email:              string | null;
  service_radius_km:  number | null;
  max_daily_capacity: number | null;
  manager_name:       string | null;
  manager_phone:      string | null;
  default_lab_id:     string;
  operating_start:    string;
  operating_end:      string;
  is_online:          boolean;
  province:           string | null;
  district:           string | null;
  created_at:         string;
  updated_at:         string;
  deleted_at:         string | null;
}

export interface CreateBranchDto {
  name:               string;
  type:               BranchType;
  address:            string;
  latitude:           number;
  longitude:          number;
  default_lab_id:     string;
  branch_code?:       string;
  phone?:             string;
  email?:             string;
  service_radius_km?: number;
  max_daily_capacity?: number;
  manager_name?:      string;
  manager_phone?:     string;
  operating_start?:   string;
  operating_end?:     string;
  province?:          string;
  district?:          string;
}

export interface UpdateBranchDto extends Partial<CreateBranchDto> {
  is_online?: boolean;
}