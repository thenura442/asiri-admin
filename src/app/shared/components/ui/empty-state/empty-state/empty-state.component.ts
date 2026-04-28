import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input() title   = 'No results found';
  @Input() message = 'Try adjusting your search or filters.';
  @Input() icon: 'search' | 'inbox' | 'file' = 'search';
}