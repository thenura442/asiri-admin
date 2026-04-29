export type Gender      = 'male' | 'female' | 'other';
export type PatientFlag = 'new' | 'regular' | 'vip' | 'blacklisted';

export interface Patient {
  id:                   string;
  authUserId:           string | null;
  uhid:                 string | null;
  fullName:             string;
  nic:                  string;
  dateOfBirth:          string;
  gender:               Gender;
  phone:                string;
  email:                string | null;
  bloodGroup:           string | null;
  nationality:          string | null;
  address:              string;
  city:                 string | null;
  district:             string | null;
  postalCode:           string | null;
  landmark:             string | null;
  emergencyName:        string | null;
  emergencyPhone:       string | null;
  flag:                 PatientFlag;
  flagNewUntil:         string | null;
  pendingCharges:       number;
  allergies:            string | null;
  existingConditions:   string | null;
  specialInstructions:  string | null;
  notes:                string | null;
  createdAt:            string;
  updatedAt:            string;
}

export interface PatientListResponse {
  data: Patient[];
  meta: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
    hasNext:    boolean;
    hasPrev:    boolean;
  };
}

export interface CreatePatientDto {
  fullName:            string;
  nic:                 string;
  dateOfBirth:         string;
  gender:              Gender;
  phone:               string;
  address:             string;
  email?:              string;
  bloodGroup?:         string;
  nationality?:        string;
  city?:               string;
  district?:           string;
  postalCode?:         string;
  landmark?:           string;
  emergencyName?:      string;
  emergencyPhone?:     string;
  allergies?:          string;
  existingConditions?: string;
  // flag, specialInstructions, notes — not accepted by backend on create
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {
  flag?: PatientFlag;
}