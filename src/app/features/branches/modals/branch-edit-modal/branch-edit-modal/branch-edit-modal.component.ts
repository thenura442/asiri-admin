import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '@shared/services/modal/modal.service';

@Component({
  selector: 'app-branch-edit-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-edit-modal.component.html',
  styleUrl: './branch-edit-modal.component.scss'
})
export class BranchEditModalComponent implements OnInit {
  branch = input<any>(null);
  closed = output<void>();
  saved  = output<any>();

  private modal = inject(ModalService);

  name        = signal('Colombo 03 Center');
  address     = signal('78 Galle Road, Colombo 03');
  latitude    = signal('6.9147');
  longitude   = signal('79.8571');
  phone       = signal('+94 11 234 5678');
  branchType  = signal('lab');
  defaultLab  = signal('Biochemistry');
  hoursStart  = signal('06:30');
  hoursEnd    = signal('16:00');
  notes       = signal('Main collecting center for Western Province operations');

  branchTypes = [
    { value: 'lab',               label: 'Lab (Full)' },
    { value: 'collecting_center', label: 'Collecting Center' },
  ];

  defaultLabs = [
    'Biochemistry', 'Haematology', 'Microbiology', 'Immunology',
    'Histopathology', 'Clinical Pathology', 'Serology'
  ];

  ngOnInit(): void {
    const b = this.branch();
    if (b) {
      this.name.set(b.name ?? '');
      this.address.set(b.address ?? '');
      this.phone.set(b.phone ?? '');
      this.branchType.set(b.type ?? 'lab');
      this.defaultLab.set(b.defaultLab ?? '');
      this.hoursStart.set(b.hoursStart ?? '06:30');
      this.hoursEnd.set(b.hoursEnd ?? '16:00');
    }
  }

  save(): void {
    this.saved.emit({ name: this.name(), address: this.address() });
  }

  confirmDelete(): void {
    this.modal.confirm({
      title: 'Delete Branch',
      message: `Delete "${this.name()}"? Branches with active jobs cannot be deleted.`,
      confirmLabel: 'Delete Branch',
      danger: true
    }).subscribe(ok => { if (ok) this.closed.emit(); });
  }

  close(): void { this.closed.emit(); }
}