import { Role } from '../enums/role.enum';

export interface User {
  id:                  string;
  staff_id:            string | null;
  email:               string;
  full_name:           string;
  nic:                 string | null;
  phone:               string | null;
  avatar_url:          string | null;
  role:                Role;
  role_title:          string | null;
  department:          string | null;
  qualification:       string | null;
  notes:               string | null;
  branch_id:           string;
  branch_name:         string | null;
  status:              UserStatus;
  two_factor_enabled:  boolean;
  failed_login_count:  number;
  locked_until:        string | null;
  last_login_at:       string | null;
  created_at:          string;
  updated_at:          string;
  deleted_at:          string | null;
}

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface CreateUserDto {
  full_name:     string;
  email:         string;
  role:          Role;
  branch_id:     string;
  phone?:        string;
  staff_id?:     string;
  nic?:          string;
  role_title?:   string;
  department?:   string;
  qualification?: string;
  notes?:        string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  status?: UserStatus;
}