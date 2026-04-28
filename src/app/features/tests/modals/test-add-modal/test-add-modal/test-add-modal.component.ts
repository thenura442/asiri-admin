import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-add-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-add-modal.component.html',
  styleUrl: './test-add-modal.component.scss'
})
export class TestAddModalComponent {
  closed = output<void>();
  saved  = output<any>();

  name        = signal('');
  code        = signal('');
  category    = signal('blood');
  basePrice   = signal('');
  turnaround  = signal('');
  sampleType  = signal('Blood');
  prescriptionRequired = signal(false);
  description = signal('');
  distanceRate = signal('');

  categories = [
    { value: 'blood',        label: 'Blood' },
    { value: 'biochemistry', label: 'Biochemistry' },
    { value: 'hormones',     label: 'Hormones' },
    { value: 'urine',        label: 'Urine' },
    { value: 'microbiology', label: 'Microbiology' },
    { value: 'imaging',      label: 'Imaging' },
  ];

  sampleTypes = ['Blood', 'Urine', 'Stool', 'Sputum', 'Swab', 'CSF', 'Other'];

  get canSubmit(): boolean {
    return !!this.name() && !!this.code() && !!this.basePrice();
  }

  submit(): void {
    if (!this.canSubmit) return;
    this.saved.emit({
      name: this.name(), code: this.code(), category: this.category(),
      basePrice: +this.basePrice(), turnaround: this.turnaround(),
      sampleType: this.sampleType(), prescriptionRequired: this.prescriptionRequired(),
      description: this.description()
    });
  }

  close(): void { this.closed.emit(); }
}