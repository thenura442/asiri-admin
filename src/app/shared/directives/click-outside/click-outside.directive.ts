import { Directive, ElementRef, output, HostListener, inject } from '@angular/core';

@Directive({ selector: '[appClickOutside]', standalone: true })
export class ClickOutsideDirective {
  private el = inject(ElementRef);
  appClickOutside = output<void>();

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (target && !this.el.nativeElement.contains(target)) {
      this.appClickOutside.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.appClickOutside.emit();
  }
}