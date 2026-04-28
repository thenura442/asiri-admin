import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TimeAgoPipe } from '@shared/pipes/time-ago/time-ago.pipe';

interface WidgetNotif {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  dotColor: string;
  createdAt: string;
}

@Component({
  selector: 'app-notification-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe],
  templateUrl: './notification-widget.component.html',
  styleUrl: './notification-widget.component.scss'
})
export class NotificationWidgetComponent {
  activeTab = signal<'all' | 'system' | 'jobs'>('all');

  notifications = signal<WidgetNotif[]>([
    { id: '1', type: 'escalation', title: 'Job #REQ-8812 unallocated', message: 'No driver available in Kandy zone', isRead: false, dotColor: 'var(--sa)', createdAt: new Date(Date.now() - 120000).toISOString() },
    { id: '2', type: 'driver_issue', title: 'Vehicle AS-MOB-12 breakdown', message: 'Driver reported engine issue — Gampaha', isRead: false, dotColor: 'var(--sr)', createdAt: new Date(Date.now() - 1080000).toISOString() },
    { id: '3', type: 'job_completed', title: 'Report approved · Perera, K.', message: 'Lab manager signed off results', isRead: true, dotColor: 'var(--sg)', createdAt: new Date(Date.now() - 2040000).toISOString() },
    { id: '4', type: 'system_alert', title: 'System maintenance window', message: 'Scheduled tonight 02:00 – 03:00 AM', isRead: true, dotColor: 'var(--sb)', createdAt: new Date(Date.now() - 3600000).toISOString() },
  ]);

  unreadCount = signal(2);
  setTab(tab: 'all' | 'system' | 'jobs'): void { this.activeTab.set(tab); }
}