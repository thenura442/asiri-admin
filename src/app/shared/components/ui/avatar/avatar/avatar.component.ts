import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent implements OnChanges {
  @Input() name    = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() online?: boolean;

  initials = '';

  ngOnChanges(): void {
    const parts = this.name.trim().split(' ').filter(Boolean);
    this.initials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (parts[0]?.[0] ?? '?').toUpperCase();
  }
}