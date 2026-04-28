import { Directive, input, output, HostListener, OnDestroy } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Directive({ selector: '[appDebounceInput]', standalone: true })
export class DebounceInputDirective implements OnDestroy {
  debounceMs     = input(350);
  debouncedValue = output<string>();

  private input$   = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.input$.pipe(
      debounceTime(this.debounceMs()),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => this.debouncedValue.emit(val));
  }

  @HostListener('input', ['$event.target'])
  onInput(target: EventTarget | null): void {
    if (target) {
      this.input$.next((target as HTMLInputElement).value);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}