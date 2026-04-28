import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '@shared/services/modal/modal.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
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
    trigger('dialogIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(.95) translateY(12px)' }),
        animate('300ms cubic-bezier(.34,1.56,.64,1)', style({ opacity: 1, transform: 'none' }))
      ]),
      transition(':leave', [
        animate('150ms ease', style({ opacity: 0, transform: 'scale(.97)' }))
      ])
    ])
  ]
})
export class ConfirmDialogComponent {
  modal = inject(ModalService);

  confirm(): void  { this.modal.resolveConfirm(true); }
  cancel(): void   { this.modal.resolveConfirm(false); }
}