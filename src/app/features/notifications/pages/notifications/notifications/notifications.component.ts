import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '@core/services/api/api.service';
import { NotificationService } from '@core/services/notification/notification.service';

type FeedTab = 'all' | 'requests' | 'system' | 'team';

interface AppNotification {
  id:        string;
  type:      string;
  title:     string;
  message:   string;
  isRead:    boolean;
  createdAt: string;
}

interface NotifStats {
  unread:   number;
  today:    number;
  thisWeek: number;
  critical: number;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  private api          = inject(ApiService);
  private notification = inject(NotificationService);

  activeTab   = signal<FeedTab>('all');
  isLoading   = signal(false);
  items       = signal<AppNotification[]>([]);
  currentPage = signal(1);
  totalPages  = signal(1);

  stats = signal<NotifStats>({ unread: 0, today: 0, thisWeek: 0, critical: 0 });

  unreadCount = computed(() => this.items().filter(n => !n.isRead).length);

  tabs: { key: FeedTab; label: string }[] = [
    { key: 'all',      label: 'All'      },
    { key: 'requests', label: 'Requests' },
    { key: 'system',   label: 'System'   },
    { key: 'team',     label: 'Team'     },
  ];

  // Map API notification types to feed tab categories
  private typeToCategory(type: string): string {
    const requestTypes = ['new_request', 'rejection', 'cancellation', 'job_completed', 'report_ready'];
    const systemTypes  = ['system_alert', 'critical_value', 'broadcast'];
    const teamTypes    = ['driver_issue', 'lab_issue', 'escalation'];
    if (requestTypes.includes(type)) return 'requests';
    if (systemTypes.includes(type))  return 'system';
    if (teamTypes.includes(type))    return 'team';
    return 'system';
  }

  // Map API type to display icon type
  typeToIcon(type: string): string {
    if (['new_request', 'report_ready'].includes(type))          return 'new';
    if (['rejection', 'cancellation', 'driver_issue'].includes(type)) return 'warn';
    if (['critical_value', 'system_alert'].includes(type))       return 'err';
    if (['job_completed'].includes(type))                        return 'ok';
    return 'info';
  }

  ngOnInit(): void {
    this.loadNotifications();
    this.loadStats();
  }

  private loadNotifications(): void {
    this.isLoading.set(true);
    this.api.get<any>('/notifications', { params: { page: this.currentPage(), limit: 50 } })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.items.set(res.data ?? res.notifications ?? []);
          this.totalPages.set(res.meta?.totalPages ?? 1);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0) this.notification.error('Connection Error', 'Cannot reach the server.');
          else                  this.notification.error('Error', 'Failed to load notifications.');
        }
      });
  }

  private loadStats(): void {
    this.api.get<any>('/notifications/unread-count').subscribe({
      next: (res) => {
        this.stats.update(s => ({ ...s, unread: res.count ?? res.unreadCount ?? 0 }));
        // Update the bell icon count in topbar
        this.notification.setUnreadCount(res.count ?? res.unreadCount ?? 0);
      },
      error: () => {}
    });
  }

  filteredItems(): AppNotification[] {
    const tab = this.activeTab();
    if (tab === 'all') return this.items();
    return this.items().filter(n => this.typeToCategory(n.type) === tab);
  }

  isToday(dateStr: string): boolean {
    const d = new Date(dateStr);
    const t = new Date();
    return d.getFullYear() === t.getFullYear() &&
           d.getMonth()    === t.getMonth()    &&
           d.getDate()     === t.getDate();
  }

  todayItems(): AppNotification[] {
    return this.filteredItems().filter(n => this.isToday(n.createdAt));
  }

  olderItems(): AppNotification[] {
    return this.filteredItems().filter(n => !this.isToday(n.createdAt));
  }

  setTab(tab: FeedTab): void { this.activeTab.set(tab); }

  markRead(id: string): void {
    const item = this.items().find(n => n.id === id);
    if (!item || item.isRead) return;

    // Optimistic update
    this.items.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
    this.notification.decrementUnread();

    this.api.patch<any>(`/notifications/${id}/read`, {}).subscribe({
      error: () => {
        // Revert on failure
        this.items.update(list => list.map(n => n.id === id ? { ...n, isRead: false } : n));
        this.notification.incrementUnread();
      }
    });
  }

  markAllRead(): void {
    // Optimistic update
    this.items.update(list => list.map(n => ({ ...n, isRead: true })));
    this.notification.setUnreadCount(0);

    this.api.patch<any>('/notifications/mark-all-read', {}).subscribe({
      next: () => {},
      error: () => {
        // Revert on failure
        this.loadNotifications();
        this.loadStats();
        this.notification.error('Error', 'Failed to mark all as read.');
      }
    });
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'just now';
    if (mins < 60)  return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}