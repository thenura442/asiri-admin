import { Injectable, signal, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api/api.service';
import { API } from '../../constants/api-endpoints.constants';
import { ApiResponse } from '../../models/api-response.model';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id:      string;
  type:    ToastType;
  title:   string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = inject(ApiService);

  // Bell count — shared across all components
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  // Toast messages — signal for reactive rendering
  toasts = signal<ToastMessage[]>([]);

  // ── Bell count ─────────────────────────────────────────────

  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  incrementUnread(): void {
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }

  decrementUnread(): void {
    const current = this.unreadCountSubject.value;
    this.unreadCountSubject.next(Math.max(0, current - 1));
  }

  fetchUnreadCount(): void {
    this.api.get<ApiResponse<{ count: number }>>(API.NOTIFICATIONS.UNREAD_COUNT)
      .subscribe({
        next: (res) => this.setUnreadCount(res.data.count),
        error: () => {}
      });
  }

  // ── Toast notifications ───────────────────────────────────

  success(title: string, message: string): void {
    this.addToast('success', title, message);
  }

  error(title: string, message: string): void {
    this.addToast('error', title, message);
  }

  warning(title: string, message: string): void {
    this.addToast('warning', title, message);
  }

  info(title: string, message: string): void {
    this.addToast('info', title, message);
  }

  dismiss(id: string): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }

  private addToast(type: ToastType, title: string, message: string): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.toasts.update(t => [...t, { id, type, title, message }]);
    // Auto-dismiss after 6 seconds
    setTimeout(() => this.dismiss(id), 6000);
  }
}