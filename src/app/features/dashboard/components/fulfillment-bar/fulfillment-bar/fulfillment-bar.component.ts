import { Component, input, signal, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-fulfillment-bar',
  standalone: true,
  imports: [],
  templateUrl: './fulfillment-bar.component.html',
  styleUrl: './fulfillment-bar.component.scss'
})
export class FulfillmentBarComponent implements AfterViewInit {
  done   = input(0);
  target = input(200);
  animWidth = signal(0);

  get pct(): number {
    if (!this.target() || this.target() === 0) return 0;
    return Math.min(Math.round((this.done() / this.target()) * 100), 100);
  }

  get remaining(): number {
    return Math.max(this.target() - this.done(), 0);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.animWidth.set(this.pct), 300);
  }
}