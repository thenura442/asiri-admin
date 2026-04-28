import { Component, input, output, signal } from '@angular/core';
import { DebounceInputDirective } from '@shared/directives/debounce-input/debounce-input.directive';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [DebounceInputDirective],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {
  placeholder  = input('Search...');
  debounceMs   = input(350);
  searched     = output<string>();

  query = signal('');

  onDebounced(val: string): void {
    this.query.set(val);
    this.searched.emit(val);
  }

  clear(): void {
    this.query.set('');
    this.searched.emit('');
  }
}