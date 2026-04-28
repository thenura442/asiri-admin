import { Component, input, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent implements AfterViewInit {
  label       = input.required<string>();
  value       = input.required<number>();
  ringPercent = input(0.5);
  trend       = input<'up' | 'down' | null>(null);
  change      = input('');
  changeLabel = input('vs yesterday');
  isFeatured  = input(false);
  goalLabel   = input('');
  sparkTrend  = input<'up' | 'down'>('up');

  @ViewChild('ringCanvas') ringRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sparkCanvas') sparkRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.drawRing();
      this.drawSparkline();
    }, 200);
  }

  private drawRing(): void {
    const c = this.ringRef?.nativeElement;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 52;
    c.width  = size * dpr;
    c.height = size * dpr;
    c.style.width  = size + 'px';
    c.style.height = size + 'px';
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, r = 21, lw = 5;

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,43,76,.06)';
    ctx.lineWidth = lw;
    ctx.stroke();

    // Fill
    const color = this.isFeatured() ? '#3FBCB9' : '#002B4C';
    const end   = -Math.PI / 2 + Math.PI * 2 * this.ringPercent();
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, end);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap   = 'round';
    ctx.stroke();
  }

  private drawSparkline(): void {
    const c = this.sparkRef?.nativeElement;
    if (!c) return;
    const parent = c.parentElement!;
    const w  = parent.offsetWidth || 200;
    const ht = 56;
    const dpr = window.devicePixelRatio || 1;
    c.width  = w * dpr;
    c.height = ht * dpr;
    c.style.width  = w + 'px';
    c.style.height = ht + 'px';
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const pts = this.sparkTrend() === 'up'
      ? [10, 12, 9, 14, 11, 16, 14, 18, 16, 20, 18, 23]
      : [23, 20, 18, 16, 18, 14, 16, 12, 10, 9, 12, 10];
    const max = Math.max(...pts);
    const min = Math.min(...pts);

    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = ht - ((p - min) / (max - min)) * (ht - 10) - 5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(0,43,76,.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Fill area
    ctx.lineTo(w, ht);
    ctx.lineTo(0, ht);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,43,76,.025)';
    ctx.fill();
  }
}