import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkMode = signal(false);

  toggle(): void {
    this.isDarkMode.update(v => !v);
  }
}