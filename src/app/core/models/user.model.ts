import { Role } from '../enums/role.enum';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id:               string;
  staffId:          string | null;
  email:            string;
  fullName:         string;
  nic:              string | null;
  phone:            string | null;
  avatarUrl:        string | null;
  role:             Role;
  roleTitle:        string | null;
  department:       string | null;
  qualification:    string | null;
  notes:            string | null;
  branchId:         string;
  branch:           { id: string; name: string; type: string };
  status:           UserStatus;
  twoFactorEnabled: boolean;
  failedLoginCount: number;
  lockedUntil:      string | null;
  lastLoginAt:      string | null;
  createdAt:        string;
}

export interface UserListResponse {
  data: User[];
  meta: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
    hasNext:    boolean;
    hasPrev:    boolean;
  };
}

export interface CreateUserDto {
  fullName:        string;
  email:           string;
  password:        string;
  role:            Role;
  branchId:        string;
  staffId?:        string | null;
  nic?:            string | null;
  phone?:          string | null;
  roleTitle?:      string | null;
  department?:     string | null;
  qualification?:  string | null;
  notes?:          string | null;
  twoFactorEnabled?: boolean;
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'email' | 'password'>> {
  status?: UserStatus;
}