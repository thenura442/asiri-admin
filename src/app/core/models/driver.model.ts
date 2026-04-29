export type DriverStatus = 'active' | 'inactive' | 'suspended';
export type LicenseExpiryWarning = 'none' | 'expiring_soon' | 'expired';

export interface Driver {
  id:                   string;
  staffId:              string | null;
  fullName:             string;
  nic:                  string;
  dateOfBirth:          string;
  phone:                string;
  licenseNumber:        string;
  licenseExpiry:        string;
  licenseExpiryWarning: LicenseExpiryWarning;
  branchId:             string;
  branch:               { id: string; name: string };
  licensePhotoUrl:      string | null;
  idFrontUrl:           string | null;
  idBackUrl:            string | null;
  status:               DriverStatus;
  isAvailable:          boolean;
  createdAt:            string;
}

export interface DriverListResponse {
  data: Driver[];
  meta: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
    hasNext:    boolean;
    hasPrev:    boolean;
  };
}

export interface CreateDriverDto {
  fullName:        string;
  nic:             string;
  dateOfBirth:     string;
  phone:           string;
  licenseNumber:   string;
  licenseExpiry:   string;
  branchId:        string;
  staffId?:        string | null;
  licensePhotoUrl?: string | null;
  idFrontUrl?:     string | null;
  idBackUrl?:      string | null;
}

export interface UpdateDriverDto {
  fullName?:      string;
  nic?:           string;
  dateOfBirth?:   string;
  phone?:         string;
  licenseNumber?: string;
  licenseExpiry?: string;
  branchId?:      string;
  staffId?:       string | null;
  status?:        DriverStatus;
}