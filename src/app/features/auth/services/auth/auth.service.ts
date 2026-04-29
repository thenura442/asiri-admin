import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';

export interface LoginResponse {
  requiresTwoFactor: boolean;
  accessToken?:      string;
  refreshToken?:     string;
  sessionId?:        string;
  userId?:           string;
  user?: {
    id:               string;
    email:            string;
    fullName:         string;
    role:             string;
    branchId:         string;
    branchName:       string;
    branchType:       string;
    avatarUrl:        string | null;
    twoFactorEnabled: boolean;
    status:           string;
  };
}

export interface Verify2FAResponse {
  message:  string;
  verified: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string, rememberMe: boolean): Observable<LoginResponse> {
    return this.http.post<any>(`${this.base}/auth/login`, { email, password, rememberMe }).pipe(
      map(res => res.data ?? res)
    );
  }

  verify2FA(code: string): Observable<Verify2FAResponse> {
    return this.http.post<any>(`${this.base}/auth/verify-2fa`, { code }).pipe(
      map(res => res.data ?? res)
    );
  }

  saveSession(response: LoginResponse): void {
    if (response.accessToken) {
      localStorage.setItem('asiri_access_token', response.accessToken);
    }
    if (response.refreshToken) {
      localStorage.setItem('asiri_refresh_token', response.refreshToken);
    }
    if (response.user) {
      localStorage.setItem('asiri_user', JSON.stringify(response.user));
    }
  }

  clearSession(): void {
    localStorage.removeItem('asiri_access_token');
    localStorage.removeItem('asiri_refresh_token');
    localStorage.removeItem('asiri_user');
  }
}