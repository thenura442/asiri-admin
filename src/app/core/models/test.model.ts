import { SampleType } from '../enums/sample-type.enum';

export interface Test {
  id:                   string;
  name:                 string;
  code:                 string;
  price:                number;
  turnaroundTime:       string | null;
  sampleType:           SampleType;
  prescriptionReq:      boolean;
  timeSensitivityHrs:   number | null;
  isActive:             boolean;
  notes:                string | null;
  createdAt:            string;
  updatedAt:            string;
  deletedAt:            string | null;
}

export interface TestListResponse {
  data: Test[];
  meta: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
    hasNext:    boolean;
    hasPrev:    boolean;
  };
}

export interface CreateTestDto {
  name:                 string;
  code:                 string;
  price:                number;
  sampleType:           SampleType;
  turnaroundTime?:      string;
  prescriptionReq?:     boolean;
  timeSensitivityHrs?:  number;
  notes?:               string;
}

export interface UpdateTestDto extends Partial<CreateTestDto> {
  isActive?: boolean;
}