import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss'
})
export class SkeletonLoaderComponent {
  type  = input<'table' | 'cards' | 'form' | 'list'>('table');
  rows  = input(6);

  get rowArray(): number[] {
    return Array.from({ length: this.rows() });
  }
}