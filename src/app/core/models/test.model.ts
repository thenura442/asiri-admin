import { SampleType } from '../enums/sample-type.enum';

export interface LabTest {
  id:                    string;
  name:                  string;
  code:                  string;
  price:                 number;
  turnaround_time:       string | null;
  sample_type:           SampleType;
  prescription_req:      boolean;
  time_sensitivity_hrs:  number | null;
  is_active:             boolean;
  notes:                 string | null;
  created_at:            string;
  updated_at:            string;
  deleted_at:            string | null;
}

export interface CreateLabTestDto {
  name:                  string;
  code:                  string;
  price:                 number;
  turnaround_time?:      string;
  sample_type:           SampleType;
  prescription_req?:     boolean;
  time_sensitivity_hrs?: number;
  notes?:                string;
}

export interface UpdateLabTestDto extends Partial<CreateLabTestDto> {
  is_active?: boolean;
}