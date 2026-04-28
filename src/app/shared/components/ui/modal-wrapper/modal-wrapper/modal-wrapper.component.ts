import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-modal-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-wrapper.component.html',
  styleUrl: './modal-wrapper.component.scss',
  animations: [
    trigger('backdropIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(24px) scale(.97)' }),
        animate('350ms cubic-bezier(.16,1,.3,1)', style({ opacity: 1, transform: 'none' }))
      ]),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0, transform: 'translateY(12px)' }))
      ])
    ])
  ]
})
export class ModalWrapperComponent {
  size   = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  closed = output<void>();

  close(): void { this.closed.emit(); }
}