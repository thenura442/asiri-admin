import { Role } from '../enums/role.enum';

export interface AuthUser {
  id:            string;
  email:         string;
  full_name:     string;
  role:          Role;
  branch_id:     string | null;
  branch_name:   string | null;
  avatar_url:    string | null;
  is_2fa_enabled: boolean;
}

export interface LoginRequest {
  email:      string;
  password:   string;
  rememberMe: boolean;
}

export interface LoginResponse {
  user:         AuthUser;
  access_token: string;
  requires_2fa: boolean;
  session_token?: string;
}

export interface TwoFactorRequest {
  code:          string;
  session_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token:       string;
  newPassword: string;
}