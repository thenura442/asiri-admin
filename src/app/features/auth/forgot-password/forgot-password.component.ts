import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  email        = '';
  newPassword  = '';
  confirmPass  = '';

  state = signal<'request' | 'success' | 'reset'>('request');

  // Password requirement states
  req = signal({ len: false, upper: false, lower: false, num: false, match: false });

  showSuccess(): void {
    this.state.set('success');
  }

  showReset(): void {
    this.state.set('reset');
  }

  checkReqs(): void {
    const p = this.newPassword;
    const c = this.confirmPass;
    this.req.set({
      len:   p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      num:   /[0-9]/.test(p),
      match: p.length > 0 && p === c
    });
  }
}