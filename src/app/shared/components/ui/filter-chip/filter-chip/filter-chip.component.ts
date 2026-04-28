import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-chip.component.html',
  styleUrl: './filter-chip.component.scss'
})
export class FilterChipComponent {
  label   = input.required<string>();
  count   = input<number | null>(null);
  active  = input(false);
  clicked = output<void>();
}