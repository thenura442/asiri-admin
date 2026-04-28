import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email        = '';
  password     = '';
  rememberMe   = true;
  showPassword = signal(false);
  showAlert    = signal(false);
  show2FA      = signal(false);

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  handleLogin(): void {
    this.show2FA.set(true);
  }
}