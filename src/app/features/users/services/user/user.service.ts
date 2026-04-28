import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';
import {
  User,
  UserListResponse,
  CreateUserDto,
  UpdateUserDto
} from '@core/models/user.model';

export interface UserParams {
  page?:     number;
  limit?:    number;
  role?:     string;
  status?:   string;
  branchId?: string;
  search?:   string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);

  getAll(params?: UserParams): Observable<UserListResponse> {
    return this.api.get<UserListResponse>('/users', { params: params as any });
  }

  getById(id: string): Observable<User> {
    return this.api.get<User>(`/users/${id}`);
  }

  create(data: CreateUserDto): Observable<User> {
    return this.api.post<User>('/users', data);
  }

  update(id: string, data: UpdateUserDto): Observable<User> {
    return this.api.patch<User>(`/users/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }

  unlockAccount(id: string): Observable<User> {
    return this.api.post<User>(`/users/${id}/unlock`, {});
  }

  resetPassword(id: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(`/users/${id}/reset-password`, {});
  }
}