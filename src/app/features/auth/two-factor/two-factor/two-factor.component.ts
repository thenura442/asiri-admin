import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './two-factor.component.html',
  styleUrl: './two-factor.component.scss'
})
export class TwoFactorComponent implements OnInit, OnDestroy {
  timerDisplay = signal('04:59');
  resendEnabled = signal(false);

  private seconds = 299;
  private interval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.interval = setInterval(() => {
      this.seconds--;
      const m = Math.floor(this.seconds / 60);
      const s = this.seconds % 60;
      this.timerDisplay.set(
        `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
      if (this.seconds <= 0) {
        clearInterval(this.interval);
        this.resendEnabled.set(true);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }
}