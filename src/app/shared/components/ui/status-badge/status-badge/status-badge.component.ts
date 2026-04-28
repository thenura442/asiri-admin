import { Component, Input } from '@angular/core';

// All badge variants from the HTML prototypes
export type BadgeVariant =
  | 'active' | 'avail' | 'online' | 'done' | 'complete' | 'received'
  | 'pend' | 'busy' | 'arriving' | 'locked'
  | 'prog' | 'processing' | 'alloc'
  | 'rej' | 'suspended' | 'issue'
  | 'inactive' | 'offline'
  | 'vip' | 'new' | 'regular' | 'blacklisted';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  @Input() variant: BadgeVariant = 'active';
  @Input() label = '';
}