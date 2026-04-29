import { Component, signal, ViewChildren, QueryList, ElementRef, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from '@features/auth/services/auth/auth.service';

@Component({
  selector:    'app-login',
  standalone:  true,
  imports:     [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl:    './login.component.scss'
})
export class LoginComponent {
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private auth   = inject(AuthService);
  private router = inject(Router);

  // Form fields
  email      = '';
  password   = '';
  rememberMe = true;

  // UI state
  showPassword  = signal(false);
  showAlert     = signal(false);
  alertMessage  = signal('Invalid email or password. Please try again.');
  show2FA       = signal(false);
  isLoading     = signal(false);
  is2FALoading  = signal(false);

  // 2FA
  codeDigits = signal<string[]>(['', '', '', '', '', '']);

  // ── UI helpers ─────────────────────────────────────────────────────────────

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  // ── Login ──────────────────────────────────────────────────────────────────

  handleLogin(): void {
    this.showAlert.set(false);

    if (!this.email.trim() || !this.password.trim()) {
      this.alertMessage.set('Please enter your email and password.');
      this.showAlert.set(true);
      return;
    }

    this.isLoading.set(true);

    this.auth.login(this.email.trim(), this.password, this.rememberMe)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.requiresTwoFactor) {
            this.show2FA.set(true);
            // Focus first 2FA input after it renders
            setTimeout(() => {
              const inputs = this.codeInputs.toArray();
              if (inputs.length) inputs[0].nativeElement.focus();
            }, 50);
          } else {
            this.auth.saveSession(res);
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.alertMessage.set('Invalid email or password. Please try again.');
          } else if (err.status === 403) {
            const mins = err.error?.minutesLeft;
            this.alertMessage.set(
              mins
                ? `Account locked. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`
                : err.error?.message ?? 'Account locked or inactive.'
            );
          } else if (err.status === 0) {
            this.alertMessage.set('Cannot reach the server. Check your connection.');
          } else {
            this.alertMessage.set(err.error?.message ?? 'An error occurred. Please try again.');
          }
          this.showAlert.set(true);
        }
      });
  }

  // ── 2FA ────────────────────────────────────────────────────────────────────

  onCodeDigit(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const val   = input.value.replace(/\D/g, '').slice(-1);
    input.value = val;

    const digits = [...this.codeDigits()];
    digits[index] = val;
    this.codeDigits.set(digits);

    // Auto-advance
    if (val && index < 5) {
      const inputs = this.codeInputs.toArray();
      inputs[index + 1]?.nativeElement.focus();
    }
  }

  onCodeKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      const digits = [...this.codeDigits()];
      if (!digits[index] && index > 0) {
        digits[index - 1] = '';
        this.codeDigits.set(digits);
        const inputs = this.codeInputs.toArray();
        inputs[index - 1]?.nativeElement.focus();
      } else {
        digits[index] = '';
        this.codeDigits.set(digits);
      }
    }
  }

  onCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text   = event.clipboardData?.getData('text') ?? '';
    const digits = text.replace(/\D/g, '').slice(0, 6).split('');
    const filled = [...this.codeDigits()];
    digits.forEach((d, i) => { filled[i] = d; });
    this.codeDigits.set(filled);

    // Populate inputs visually and focus last filled
    setTimeout(() => {
      const inputs = this.codeInputs.toArray();
      inputs.forEach((el, i) => { el.nativeElement.value = filled[i] ?? ''; });
      const focusIdx = Math.min(digits.length, 5);
      inputs[focusIdx]?.nativeElement.focus();
    });
  }

  getFullCode(): string {
    return this.codeDigits().join('');
  }

  handleVerify2FA(): void {
    const code = this.getFullCode();
    if (code.length < 6) {
      this.alertMessage.set('Please enter the complete 6-digit code.');
      this.showAlert.set(true);
      return;
    }

    this.showAlert.set(false);
    this.is2FALoading.set(true);

    this.auth.verify2FA(code)
      .pipe(finalize(() => this.is2FALoading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.verified) {
            // Session was already saved at login step when 2FA was triggered;
            // the token is issued after verify — re-read from the login response
            // stored on the service, or navigate directly (token stored at login).
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 401 || err.status === 400) {
            this.alertMessage.set('Invalid or expired code. Please try again.');
          } else if (err.status === 0) {
            this.alertMessage.set('Cannot reach the server. Check your connection.');
          } else {
            this.alertMessage.set(err.error?.message ?? 'Verification failed.');
          }
          this.showAlert.set(true);
          // Clear the code inputs on failure
          this.codeDigits.set(['', '', '', '', '', '']);
          setTimeout(() => {
            const inputs = this.codeInputs.toArray();
            inputs.forEach(el => { el.nativeElement.value = ''; });
            inputs[0]?.nativeElement.focus();
          });
        }
      });
  }
}