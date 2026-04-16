import { VehicleStatus } from '../enums/vehicle-status.enum';

export interface Vehicle {
  id:                   string;
  plate_number:         string;
  chassis_number:       string;
  vehicle_id_code:      string | null;
  make_model:           string | null;
  year_of_manufacture:  number | null;
  color:                string | null;
  vehicle_type:         VehicleType;
  branch_id:            string;
  branch_name:          string;
  status:               VehicleStatus;
  current_driver_id:    string | null;
  current_driver_name:  string | null;
  notes:                string | null;
  created_at:           string;
  updated_at:           string;
  deleted_at:           string | null;
}

export type VehicleType = 'van' | 'car';

export interface CreateVehicleDto {
  plate_number:         string;
  chassis_number:       string;
  vehicle_type:         VehicleType;
  branch_id:            string;
  vehicle_id_code?:     string;
  make_model?:          string;
  year_of_manufacture?: number;
  color?:               string;
  notes?:               string;
}

export interface UpdateVehicleDto extends Partial<CreateVehicleDto> {
  status?: VehicleStatus;
}