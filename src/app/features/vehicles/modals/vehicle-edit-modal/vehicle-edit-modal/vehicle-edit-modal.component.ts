import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '@shared/services/modal/modal.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-vehicle-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-edit-modal.component.html',
  styleUrl: './vehicle-edit-modal.component.scss'
})
export class VehicleEditModalComponent {
  vehicle   = input<any>(null);
  closed    = output<void>();
  saved     = output<any>();

  private modal = inject(ModalService);

  plateNumber = signal('WP CAB-4521');
  chassis     = signal('JMFGH12E8BZ012345');
  type        = signal('van');
  branch      = signal('Colombo 03 Center');
  status      = signal('available');
  notes       = signal('Regular maintenance scheduled for April 2026');

  save(): void {
    this.saved.emit({ plateNumber: this.plateNumber(), status: this.status() });
    this.closed.emit();
  }

  confirmDelete(): void {
    this.modal.confirm({
      title: 'Delete Vehicle',
      message: 'This action cannot be undone. The vehicle record will be permanently removed.',
      confirmLabel: 'Delete Vehicle',
      danger: true
    }).subscribe(ok => {
      if (ok) { this.closed.emit(); }
    });
  }

  close(): void { this.closed.emit(); }
}