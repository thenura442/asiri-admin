import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '@shared/services/modal/modal.service';

@Component({
  selector: 'app-driver-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-edit-modal.component.html',
  styleUrl: './driver-edit-modal.component.scss'
})
export class DriverEditModalComponent {
  driver  = input<any>(null);
  closed  = output<void>();
  saved   = output<any>();

  private modal = inject(ModalService);

  // Pre-fill with driver data — in production use ngOnInit / effect()
  fullName      = signal('Nimal Perera');
  nic           = signal('199812345678');
  dob           = signal('1998-05-14');
  phone         = signal('+94 77 123 4567');
  licenseNumber = signal('B-9823412-A');
  licenseExpiry = signal('2027-12-31');
  branchName    = signal('Asiri Central Lab');
  status        = signal<'active' | 'inactive' | 'suspended'>('active');
  statusReason  = signal('');

  branches = ['Asiri Central Lab', 'Asiri Surgical Lab', 'Asiri Matara', 'Asiri Kandy'];

  setStatus(s: 'active' | 'inactive' | 'suspended'): void { this.status.set(s); }

  save(): void {
    this.saved.emit({ fullName: this.fullName(), status: this.status() });
    this.closed.emit();
  }

  confirmDelete(): void {
    this.modal.confirm({
      title: 'Delete Driver',
      message: `Delete ${this.fullName()}? This cannot be undone.`,
      confirmLabel: 'Delete Driver',
      danger: true
    }).subscribe(ok => { if (ok) this.closed.emit(); });
  }

  close(): void { this.closed.emit(); }
}