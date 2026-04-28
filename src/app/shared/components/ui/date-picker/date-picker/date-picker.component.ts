import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '@shared/directives/click-outside/click-outside.directive';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent {
  value       = input<Date | null>(null);
  placeholder = input('Select date...');
  showTime    = input(false);
  minDate     = input<Date | null>(null);
  changed     = output<Date | null>();

  isOpen      = signal(false);
  viewYear    = signal(new Date().getFullYear());
  viewMonth   = signal(new Date().getMonth());
  hour        = signal('09');
  minute      = signal('00');
  ampm        = signal<'AM' | 'PM'>('AM');

  readonly months = MONTHS;
  readonly dayLabels = DAYS;

  monthLabel = computed(() => `${MONTHS[this.viewMonth()]} ${this.viewYear()}`);

  displayText = computed(() => {
    if (!this.value()) return null;
    const d = this.value()!;
    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    if (this.showTime()) {
      return `${dateStr}, ${this.hour()}:${this.minute()} ${this.ampm()}`;
    }
    return dateStr;
  });

  calendarDays = computed((): CalendarDay[] => {
    const year  = this.viewYear();
    const month = this.viewMonth();
    const today = new Date();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];

    // Previous month padding
    for (let i = first.getDay() - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, day: d.getDate(), isCurrentMonth: false,
        isToday: false, isSelected: false, isDisabled: true });
    }
    // Current month
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(year, month, d);
      const isDisabled = this.minDate() ? date < this.minDate()! : false;
      days.push({
        date, day: d, isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: this.value() ? date.toDateString() === this.value()!.toDateString() : false,
        isDisabled
      });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      days.push({ date, day: d, isCurrentMonth: false,
        isToday: false, isSelected: false, isDisabled: true });
    }
    return days;
  });

  toggle(): void { this.isOpen.update(v => !v); }
  close():  void { this.isOpen.set(false); }

  prevMonth(): void {
    if (this.viewMonth() === 0) { this.viewMonth.set(11); this.viewYear.update(y => y - 1); }
    else this.viewMonth.update(m => m - 1);
  }

  nextMonth(): void {
    if (this.viewMonth() === 11) { this.viewMonth.set(0); this.viewYear.update(y => y + 1); }
    else this.viewMonth.update(m => m + 1);
  }

  selectDay(day: CalendarDay): void {
    if (day.isDisabled) return;
    this.changed.emit(day.date);
    if (!this.showTime()) this.close();
  }

  goToToday(): void {
    const now = new Date();
    this.viewYear.set(now.getFullYear());
    this.viewMonth.set(now.getMonth());
  }

  apply(): void {
    if (this.value()) this.changed.emit(this.value());
    this.close();
  }

  setAmpm(val: 'AM' | 'PM'): void { this.ampm.set(val); }
}