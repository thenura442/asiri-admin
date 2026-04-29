import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TestService } from '../../../services/test/test.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { CustomDropdownComponent, DropdownOption } from '@shared/components/ui/custom-dropdown/custom-dropdown/custom-dropdown.component';
import { Test, UpdateTestDto } from '@core/models/test.model';
import { SampleType } from '@core/enums/sample-type.enum';

@Component({
  selector: 'app-test-edit-modal',
  standalone: true,
  imports: [CommonModule, CustomDropdownComponent],
  templateUrl: './test-edit-modal.component.html',
  styleUrl: './test-edit-modal.component.scss'
})
export class TestEditModalComponent implements OnInit {
  test   = input<Test | null>(null);
  closed = output<void>();
  saved  = output<Test>();

  private testSvc      = inject(TestService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);

  isSaving   = signal(false);
  isDeleting = signal(false);
  errors     = signal<Record<string, string>>({});

  name               = signal('');
  code               = signal('');
  price              = signal('');
  sampleType         = signal<string | null>(null);
  turnaroundTime     = signal('');
  prescriptionReq    = signal(false);
  timeSensitivityHrs = signal('');
  notes              = signal('');
  isActive           = signal(true);

  sampleTypeOptions: DropdownOption[] = [
    { value: SampleType.BLOOD, label: 'Blood', dot: 'var(--sr)' },
    { value: SampleType.URINE, label: 'Urine', dot: 'var(--sa)' },
  ];

  ngOnInit(): void {
    const t = this.test();
    if (t) {
      this.name.set(t.name);
      this.code.set(t.code);
      this.price.set(String(t.price));
      this.sampleType.set(t.sampleType);
      this.turnaroundTime.set(t.turnaroundTime ?? '');
      this.prescriptionReq.set(t.prescriptionReq);
      this.timeSensitivityHrs.set(t.timeSensitivityHrs ? String(t.timeSensitivityHrs) : '');
      this.notes.set(t.notes ?? '');
      this.isActive.set(t.isActive);
    }
  }

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  onName(v: string):  void { this.name.set(v);  this.clearError('name'); }
  onCode(v: string):  void { this.code.set(v);  this.clearError('code'); }
  onPrice(v: string): void { this.price.set(v); this.clearError('price'); }
  onSampleType(v: string | null): void { this.sampleType.set(v); this.clearError('sampleType'); }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.name().trim())   e['name']      = 'Test name is required';
    if (!this.code().trim())   e['code']      = 'Test code is required';
    if (!this.price() || isNaN(Number(this.price())) || Number(this.price()) <= 0)
                               e['price']     = 'A valid price greater than 0 is required';
    if (!this.sampleType())    e['sampleType']= 'Sample type is required';
    if (this.timeSensitivityHrs() && isNaN(Number(this.timeSensitivityHrs())))
                               e['timeSensitivityHrs'] = 'Must be a valid number of hours';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  save(): void {
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below.');
      return;
    }
    const t = this.test();
    if (!t) return;

    const dto: UpdateTestDto = {
      name:               this.name().trim(),
      code:               this.code().trim().toUpperCase(),
      price:              Number(this.price()),
      sampleType:         this.sampleType() as SampleType,
      turnaroundTime:     this.turnaroundTime().trim()    || undefined,
      prescriptionReq:    this.prescriptionReq(),
      timeSensitivityHrs: this.timeSensitivityHrs() ? Number(this.timeSensitivityHrs()) : undefined,
      notes:              this.notes().trim()             || undefined,
      isActive:           this.isActive(),
    };

    this.isSaving.set(true);
    this.testSvc.update(t.id, dto)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updated) => {
          this.saved.emit(updated);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409)      this.notification.error('Conflict', err.error?.message ?? 'A test with this code already exists.');
          else if (err.status === 400) this.notification.error('Validation Error', Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message ?? 'Invalid data.');
          else if (err.status === 0)   this.notification.error('Connection Error', 'Cannot reach the server.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to update test.');
        }
      });
  }

  confirmDelete(): void {
    const t = this.test();
    if (!t) return;
    this.modal.confirm({
      title:        'Delete Test',
      message:      `Delete "${t.name}"? This cannot be undone.`,
      confirmLabel: 'Delete Test',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.isDeleting.set(true);
      this.testSvc.delete(t.id)
        .pipe(finalize(() => this.isDeleting.set(false)))
        .subscribe({
          next: () => {
            this.notification.success('Test Deleted', `${t.name} has been removed.`);
            this.closed.emit();
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 400) this.notification.error('Cannot Delete', err.error?.message ?? 'Test may be used in active job requests.');
            else                    this.notification.error('Error', err.error?.message ?? 'Failed to delete test.');
          }
        });
    });
  }

  close(): void {
    if (this.isSaving() || this.isDeleting()) return;
    this.closed.emit();
  }
}