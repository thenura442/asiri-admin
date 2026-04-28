import { BranchType } from '../enums/branch-type.enum';

export interface Branch {
  id:               string;
  name:             string;
  type:             BranchType;
  address:          string;
  latitude:         number;
  longitude:        number;
  branchCode:       string | null;
  phone:            string | null;
  email:            string | null;
  serviceRadiusKm:  number | null;
  maxDailyCapacity: number | null;
  managerName:      string | null;
  managerPhone:     string | null;
  defaultLabId:     string | null;
  operatingStart:   string;
  operatingEnd:     string;
  isOnline:         boolean;
  province:         string | null;
  district:         string | null;
  createdAt:        string;
}

export interface BranchListResponse {
  data: Branch[];
  meta: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
    hasNext:    boolean;
    hasPrev:    boolean;
  };
}

export interface CreateBranchDto {
  name:              string;
  type:              BranchType;
  address:           string;
  latitude:          number;
  longitude:         number;
  operatingStart:    string;
  operatingEnd:      string;
  branchCode?:       string | null;
  phone?:            string | null;
  email?:            string | null;
  serviceRadiusKm?:  number | null;
  maxDailyCapacity?: number | null;
  managerName?:      string | null;
  managerPhone?:     string | null;
  defaultLabId?:     string | null;
  province?:         string | null;
  district?:         string | null;
}

export interface UpdateBranchDto extends Partial<CreateBranchDto> {
  isOnline?: boolean;
}