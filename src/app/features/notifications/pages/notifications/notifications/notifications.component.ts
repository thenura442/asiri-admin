import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type NotifType = 'new' | 'warn' | 'err' | 'info' | 'ok';
type FeedTab   = 'all' | 'requests' | 'system' | 'team';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  group: 'Today' | 'Yesterday';
  category: 'requests' | 'system' | 'team';
  unread: boolean;
}

interface PrefToggle { label: string; value: boolean; }

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  activeTab = signal<FeedTab>('all');

  notifications = signal<Notification[]>([
    { id: 'n1', type: 'new',  title: 'New patient request received',       message: 'Kamala Perera requested a Full Blood Count at 42 Temple Rd, Dehiwala. Awaiting vehicle allocation.', time: '2 minutes ago',   group: 'Today',     category: 'requests', unread: true  },
    { id: 'n2', type: 'warn', title: 'Technician rejected job assignment',  message: 'Sunil Perera rejected job #REQ-8799. Reason: vehicle maintenance required. Please reassign.',         time: '15 minutes ago',  group: 'Today',     category: 'requests', unread: true  },
    { id: 'n3', type: 'err',  title: 'Vehicle AS-MOB-12 reported breakdown',message: 'Vehicle is at Asiri Central Lab maintenance bay. ETA for repair: 4 hours. 2 pending jobs need reassignment.', time: '32 minutes ago', group: 'Today',   category: 'system',   unread: true  },
    { id: 'n4', type: 'ok',   title: 'Job #REQ-8795 completed successfully',message: 'Arjun Kumara collected samples from Robert Brown at Negombo. Report processing initiated.',           time: 'Yesterday at 4:32 PM', group: 'Yesterday', category: 'requests', unread: false },
    { id: 'n5', type: 'info', title: 'New driver registration pending approval', message: 'Rohit Jayawardene submitted a driver application with all required documents. Awaiting review.', time: 'Yesterday at 2:15 PM', group: 'Yesterday', category: 'team',     unread: false },
    { id: 'n6', type: 'ok',   title: 'Daily report generated',               message: 'October 23 operational report is ready. 89 jobs completed, 7 cancelled. Revenue: Rs. 142,500.',      time: 'Yesterday at 11:59 PM', group: 'Yesterday', category: 'system', unread: false },
  ]);

  preferences = signal<PrefToggle[]>([
    { label: 'New patient requests',  value: true  },
    { label: 'Job rejections',        value: true  },
    { label: 'Vehicle breakdowns',    value: true  },
    { label: 'Job delays',            value: true  },
    { label: 'Customer complaints',   value: false },
    { label: 'System errors',         value: true  },
  ]);

  channels = signal<{ label: string; icon: string; active: boolean }[]>([
    { label: 'In-App', icon: 'bell',  active: true  },
    { label: 'SMS',    icon: 'sms',   active: false },
    { label: 'Email',  icon: 'email', active: false },
  ]);

  stats = { unread: 3, today: 24, thisWeek: 156, critical: 12 };

  unreadCount = computed(() => this.notifications().filter(n => n.unread).length);

  filteredByGroup(group: 'Today' | 'Yesterday'): Notification[] {
    const tab = this.activeTab();
    return this.notifications().filter(n =>
      n.group === group && (tab === 'all' || n.category === tab)
    );
  }

  hasGroup(group: 'Today' | 'Yesterday'): boolean {
    return this.filteredByGroup(group).length > 0;
  }

  setTab(tab: FeedTab): void { this.activeTab.set(tab); }

  markAllRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, unread: false })));
  }

  markRead(id: string): void {
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  }

  togglePref(i: number): void {
    const list = [...this.preferences()];
    list[i] = { ...list[i], value: !list[i].value };
    this.preferences.set(list);
  }

  toggleChannel(i: number): void {
    const list = [...this.channels()];
    list[i] = { ...list[i], active: !list[i].active };
    this.channels.set(list);
  }

  tabs: { key: FeedTab; label: string }[] = [
    { key: 'all',      label: 'All'      },
    { key: 'requests', label: 'Requests' },
    { key: 'system',   label: 'System'   },
    { key: 'team',     label: 'Team'     },
  ];
}