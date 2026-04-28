import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '@shared/services/modal/modal.service';

@Component({
  selector: 'app-test-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-edit-modal.component.html',
  styleUrl: './test-edit-modal.component.scss'
})
export class TestEditModalComponent implements OnInit {
  test   = input<any>(null);
  closed = output<void>();
  saved  = output<any>();

  private modal = inject(ModalService);

  name        = signal('');
  code        = signal('');
  category    = signal('blood');
  basePrice   = signal('');
  turnaround  = signal('');
  sampleType  = signal('Blood');
  prescriptionRequired = signal(false);
  description = signal('');
  isActive    = signal(true);
  distanceRate = signal('');

  categories = [
    { value: 'blood', label: 'Blood' }, { value: 'biochemistry', label: 'Biochemistry' },
    { value: 'hormones', label: 'Hormones' }, { value: 'urine', label: 'Urine' },
    { value: 'microbiology', label: 'Microbiology' }, { value: 'imaging', label: 'Imaging' },
  ];

  sampleTypes = ['Blood', 'Urine', 'Stool', 'Sputum', 'Swab', 'CSF', 'Other'];

  ngOnInit(): void {
    const t = this.test();
    if (t) {
      this.name.set(t.name ?? '');
      this.code.set(t.code ?? '');
      this.category.set(t.category ?? 'blood');
      this.basePrice.set(String(t.basePrice ?? ''));
      this.turnaround.set(t.turnaround ?? '');
      this.sampleType.set(t.sampleType ?? 'Blood');
      this.prescriptionRequired.set(t.prescriptionRequired ?? false);
      this.description.set(t.description ?? '');
      this.isActive.set(t.isActive ?? true);
    }
  }

  save(): void {
    this.saved.emit({
      name: this.name(), code: this.code(), category: this.category(),
      basePrice: +this.basePrice(), turnaround: this.turnaround(),
      sampleType: this.sampleType(), prescriptionRequired: this.prescriptionRequired(),
      description: this.description(), isActive: this.isActive()
    });
  }

  confirmDelete(): void {
    this.modal.confirm({
      title: 'Delete Test',
      message: `Delete "${this.name()}"? This cannot be undone.`,
      confirmLabel: 'Delete Test',
      danger: true
    }).subscribe(ok => { if (ok) this.closed.emit(); });
  }

  close(): void { this.closed.emit(); }
}