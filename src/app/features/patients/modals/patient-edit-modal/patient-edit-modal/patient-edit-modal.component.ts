import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '@shared/services/modal/modal.service';

@Component({
  selector: 'app-patient-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-edit-modal.component.html',
  styleUrl: './patient-edit-modal.component.scss'
})
export class PatientEditModalComponent {
  patient = input<any>(null);
  closed  = output<void>();
  saved   = output<any>();

  private modal = inject(ModalService);

  // Pre-fill values
  fullName      = signal('Johnathan Doe');
  nic           = signal('198976543210');
  phone         = signal('+94 77 123 4567');
  uhid          = signal('129938');
  address       = signal('78 Galle Rd, Colombo 03');
  emergencyName  = signal('Samantha Doe');
  emergencyPhone = signal('+94 71 987 6543');
  flag          = signal<'regular' | 'vip' | 'blacklisted'>('regular');

  setFlag(f: 'regular' | 'vip' | 'blacklisted'): void { this.flag.set(f); }

  save(): void {
    this.saved.emit({ fullName: this.fullName(), flag: this.flag() });
    this.closed.emit();
  }

  confirmDelete(): void {
    this.modal.confirm({
      title: 'Delete Patient',
      message: `Delete ${this.fullName()}'s record? This cannot be undone.`,
      confirmLabel: 'Delete Patient',
      danger: true
    }).subscribe(ok => { if (ok) this.closed.emit(); });
  }

  close(): void { this.closed.emit(); }
}