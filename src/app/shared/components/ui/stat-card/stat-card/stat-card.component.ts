import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

export type StatCardColor = 'blue' | 'green' | 'teal' | 'amber' | 'red' | 'gray';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  @Input() label  = '';
  @Input() value  = '';
  @Input() change = '';
  @Input() changeType: 'up' | 'down' | 'neutral' = 'neutral';
  @Input() color: StatCardColor = 'blue';
}