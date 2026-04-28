import { Component, input, output, model } from '@angular/core';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  imports: [],
  templateUrl: './toggle-switch.component.html',
  styleUrl: './toggle-switch.component.scss'
})
export class ToggleSwitchComponent {
  checked = model(false);
  label   = input('');
  sublabel = input('');
  disabled = input(false);
  toggled  = output<boolean>();

  toggle(): void {
    if (this.disabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this.toggled.emit(next);
  }
}