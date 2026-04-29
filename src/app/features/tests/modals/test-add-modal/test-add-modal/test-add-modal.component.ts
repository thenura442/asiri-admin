import { Component, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TestService } from '../../../services/test/test.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { CustomDropdownComponent, DropdownOption } from '@shared/components/ui/custom-dropdown/custom-dropdown/custom-dropdown.component';
import { Test, CreateTestDto } from '@core/models/test.model';
import { SampleType } from '@core/enums/sample-type.enum';

@Component({
  selector: 'app-test-add-modal',
  standalone: true,
  imports: [CommonModule, CustomDropdownComponent],
  templateUrl: './test-add-modal.component.html',
  styleUrl: './test-add-modal.component.scss'
})
export class TestAddModalComponent {
  closed = output<void>();
  saved  = output<Test>();

  private testSvc      = inject(TestService);
  private notification = inject(NotificationService);
  private modal        = inject(ModalService);

  isSubmitting = signal(false);
  errors       = signal<Record<string, string>>({});

  // Form fields
  name               = signal('');
  code               = signal('');
  price              = signal('');
  sampleType         = signal<string | null>(null);
  turnaroundTime     = signal('');
  prescriptionReq    = signal(false);
  timeSensitivityHrs = signal('');
  notes              = signal('');

  sampleTypeOptions: DropdownOption[] = [
    { value: SampleType.BLOOD, label: 'Blood', dot: 'var(--sr)' },
    { value: SampleType.URINE, label: 'Urine', dot: 'var(--sa)' },
  ];

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  onName(v: string):  void { this.name.set(v);  this.clearError('name'); }
  onCode(v: string):  void { this.code.set(v);  this.clearError('code'); }
  onPrice(v: string): void { this.price.set(v); this.clearError('price'); }
  onSampleType(v: string | null): void { this.sampleType.set(v); this.clearError('sampleType'); }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.name().trim())   e['name']       = 'Test name is required';
    if (!this.code().trim())   e['code']        = 'Test code is required';
    if (!this.price() || isNaN(Number(this.price())) || Number(this.price()) <= 0)
                               e['price']       = 'A valid price greater than 0 is required';
    if (!this.sampleType())    e['sampleType']  = 'Sample type is required';
    if (this.timeSensitivityHrs() && isNaN(Number(this.timeSensitivityHrs())))
                               e['timeSensitivityHrs'] = 'Must be a valid number of hours';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  submit(): void {
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below.');
      return;
    }

    const dto: CreateTestDto = {
      name:               this.name().trim(),
      code:               this.code().trim().toUpperCase(),
      price:              Number(this.price()),
      sampleType:         this.sampleType() as SampleType,
      turnaroundTime:     this.turnaroundTime().trim() || undefined,
      prescriptionReq:    this.prescriptionReq(),
      timeSensitivityHrs: this.timeSensitivityHrs() ? Number(this.timeSensitivityHrs()) : undefined,
      notes:              this.notes().trim() || undefined,
    };

    this.isSubmitting.set(true);
    this.testSvc.create(dto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (test) => {
          this.saved.emit(test);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server. Check your internet.');
          else if (err.status === 409) this.notification.error('Conflict', err.error?.message ?? 'A test with this code already exists.');
          else if (err.status === 400) this.notification.error('Validation Error', Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message ?? 'Invalid data.');
          else if (err.status === 500) this.notification.error('Server Error', 'Something went wrong. Please try again.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to add test.');
        }
      });
  }

  close(): void { this.closed.emit(); }
}