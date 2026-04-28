import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ToastItem } from '@shared/services/modal/modal.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms cubic-bezier(.16,1,.3,1)', style({ opacity: 1, transform: 'none' }))
      ]),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class ToastComponent {
  modal = inject(ModalService);

  dismiss(id: number): void {
    this.modal.dismissToast(id);
  }

  trackById(_: number, t: ToastItem): number { return t.id; }
}