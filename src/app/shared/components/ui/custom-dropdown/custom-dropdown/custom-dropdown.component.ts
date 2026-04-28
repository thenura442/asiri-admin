import { Component, input, output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '@shared/directives/click-outside/click-outside.directive';

export interface DropdownOption {
  value: string;
  label: string;
  dot?:  string;   // CSS color for dot indicator
  meta?: string;   // right-side meta text
  group?: string;  // group label
}

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './custom-dropdown.component.html',
  styleUrl: './custom-dropdown.component.scss'
})
export class CustomDropdownComponent implements OnInit {
  options      = input.required<DropdownOption[]>();
  value        = input<string | null>(null);
  placeholder  = input('Select...');
  searchable   = input(false);
  disabled     = input(false);
  changed      = output<string | null>();

  isOpen       = signal(false);
  searchQuery  = signal('');

  selectedOption = computed(() =>
    this.options().find(o => o.value === this.value()) ?? null
  );

  filteredOptions = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return q
      ? this.options().filter(o => o.label.toLowerCase().includes(q))
      : this.options();
  });

  groups = computed(() => {
    const grouped: Record<string, DropdownOption[]> = {};
    for (const opt of this.filteredOptions()) {
      const g = opt.group ?? '__none__';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(opt);
    }
    return grouped;
  });

  hasGroups = computed(() =>
    this.filteredOptions().some(o => o.group)
  );

  ngOnInit(): void {}

  toggle(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
    if (!this.isOpen()) this.searchQuery.set('');
  }

  close(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  select(opt: DropdownOption): void {
    this.changed.emit(opt.value);
    this.close();
  }

  clearSelection(e: Event): void {
    e.stopPropagation();
    this.changed.emit(null);
    this.close();
  }

  groupKeys(): string[] {
    return Object.keys(this.groups());
  }
}