export interface Patient {
  id:                    string;
  auth_user_id:          string | null;
  uhid:                  string | null;
  full_name:             string;
  nic:                   string;
  date_of_birth:         string;
  gender:                Gender;
  phone:                 string;
  email:                 string | null;
  blood_group:           string | null;
  nationality:           string | null;
  address:               string;
  city:                  string | null;
  district:              string | null;
  postal_code:           string | null;
  landmark:              string | null;
  emergency_name:        string | null;
  emergency_phone:       string | null;
  flag:                  PatientFlag;
  flag_new_until:        string | null;
  pending_charges:       number;
  allergies:             string | null;
  existing_conditions:   string | null;
  special_instructions:  string | null;
  notes:                 string | null;
  created_at:            string;
  updated_at:            string;
}

export type Gender      = 'male' | 'female' | 'other';
export type PatientFlag = 'regular' | 'vip' | 'new' | 'blacklisted';

export interface CreatePatientDto {
  full_name:              string;
  nic:                    string;
  date_of_birth:          string;
  gender:                 Gender;
  phone:                  string;
  address:                string;
  email?:                 string;
  blood_group?:           string;
  nationality?:           string;
  city?:                  string;
  district?:              string;
  postal_code?:           string;
  landmark?:              string;
  emergency_name?:        string;
  emergency_phone?:       string;
  flag?:                  PatientFlag;
  allergies?:             string;
  existing_conditions?:   string;
  special_instructions?:  string;
  notes?:                 string;
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {}