import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { JobRequestService } from '../../../services/job-request/job-request.service';
import { PatientService } from '@features/patients/services/patient/patient.service';
import { TestService } from '@features/tests/services/test/test.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { CustomDropdownComponent, DropdownOption } from '@shared/components/ui/custom-dropdown/custom-dropdown/custom-dropdown.component';
import { FileUploadComponent } from '@shared/components/ui/file-upload/file-upload/file-upload.component';
import { CreateJobRequestDto } from '@core/models/job-request.model';
import { Test } from '@core/models/test.model';

interface ChecklistItem { label: string; required: boolean; done: boolean; }
interface SelectedTest  { id: string; name: string; code: string; price: number; }

@Component({
  selector: 'app-job-request-new',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomDropdownComponent, FileUploadComponent],
  templateUrl: './job-request-new.component.html',
  styleUrl: './job-request-new.component.scss'
})
export class JobRequestNewComponent implements OnInit {
  private router       = inject(Router);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);
  private jobSvc       = inject(JobRequestService);
  private patientSvc   = inject(PatientService);
  private testSvc      = inject(TestService);

  isSubmitting  = signal(false);
  isLoadingData = signal(false);
  submitted     = signal(false);
  errors        = signal<Record<string, string>>({});

  // Form fields
  selectedPatientId   = signal<string | null>(null);
  address             = signal('');
  city                = signal('');
  landmark            = signal('');
  selectedTests       = signal<SelectedTest[]>([]);
  urgency             = signal<string>('normal');
  source              = signal<string | null>('phone');
  scheduledAt         = signal('');
  specialInstructions = signal('');
  prescriptionUrl     = signal<string | null>(null);

  // Dropdown options from API
  patientOptions = signal<DropdownOption[]>([]);
  testOptions    = signal<DropdownOption[]>([]);
  allTests       = signal<Test[]>([]);

  sourceOptions: DropdownOption[] = [
    { value: 'phone',    label: 'Phone Call',      dot: 'var(--sbl)'    },
    { value: 'walk_in',  label: 'Walk-in',         dot: 'var(--sg)'     },
    { value: 'whatsapp', label: 'WhatsApp',        dot: 'var(--sg)'     },
    { value: 'referral', label: 'Referral',        dot: 'var(--sa)'     },
    { value: 'repeat',   label: 'Repeat Booking',  dot: 'var(--accent)' },
  ];

  urgencyOptions: DropdownOption[] = [
    { value: 'normal', label: 'Normal',                     dot: 'var(--sg)' },
    { value: 'urgent', label: 'Urgent — priority dispatch', dot: 'var(--sr)' },
  ];

  checklist = signal<ChecklistItem[]>([
    { label: 'Patient selected',           required: true, done: false },
    { label: 'Collection address entered', required: true, done: false },
    { label: 'At least one test selected', required: true, done: false },
    { label: 'Urgency level set',          required: true, done: false },
  ]);

  ngOnInit(): void {
    this.loadPatients();
    this.loadTests();
    this.updateCheck(3, true); // urgency defaults to 'normal'
  }

  private loadPatients(): void {
    this.isLoadingData.set(true);
    this.patientSvc.getAll({ page: 1, limit: 100 })
      .pipe(finalize(() => this.isLoadingData.set(false)))
      .subscribe({
        next: (res) => {
          this.patientOptions.set(
            res.data.map(p => ({
              value: p.id,
              label: p.fullName,
              meta:  p.uhid ?? p.phone,
            }))
          );
        },
        error: () => this.notification.error('Error', 'Failed to load patients.')
      });
  }

  private loadTests(): void {
    this.testSvc.getAll({ page: 1, limit: 100, isActive: true }).subscribe({
      next: (res) => {
        this.allTests.set(res.data);
        this.testOptions.set(
          res.data.map(t => ({
            value: t.id,
            label: t.name,
            meta:  `Rs. ${t.price.toLocaleString('en-LK')} · ${t.sampleType}`,
          }))
        );
      },
      error: () => this.notification.error('Error', 'Failed to load tests.')
    });
  }

  private updateCheck(i: number, done: boolean): void {
    const list = [...this.checklist()];
    list[i] = { ...list[i], done };
    this.checklist.set(list);
  }

  private clearError(field: string): void {
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  onPatientSelect(id: string | null): void {
    this.selectedPatientId.set(id);
    this.updateCheck(0, !!id);
    this.clearError('patientId');
  }

  onAddressInput(val: string): void {
    this.address.set(val);
    this.updateCheck(1, val.trim().length > 0);
    this.clearError('address');
  }

  onTestSelect(id: string | null): void {
    if (!id) return;
    if (this.selectedTests().find(t => t.id === id)) return;
    const test = this.allTests().find(t => t.id === id);
    if (!test) return;
    this.selectedTests.update(list => [
      ...list,
      { id: test.id, name: test.name, code: test.code, price: test.price }
    ]);
    this.updateCheck(2, true);
    this.clearError('testIds');
  }

  removeTest(id: string): void {
    this.selectedTests.update(list => list.filter(t => t.id !== id));
    this.updateCheck(2, this.selectedTests().length > 0);
  }

  onUrgencySelect(val: string | null): void {
    this.urgency.set(val ?? 'normal');
    this.updateCheck(3, true);
  }

  onPrescriptionUpload(event: { url?: string; file: File }): void {
    this.prescriptionUrl.set(event.url ?? null);
  }

  estimatedTotal(): number {
    return this.selectedTests().reduce((sum, t) => sum + t.price, 0);
  }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.selectedPatientId())         e['patientId'] = 'Please select a patient';
    if (!this.address().trim())            e['address']   = 'Collection address is required';
    if (this.selectedTests().length === 0) e['testIds']   = 'Please select at least one test';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below.');
      return;
    }

    const scheduled = this.scheduledAt();

    const dto: CreateJobRequestDto = {
      patientId:       this.selectedPatientId()!,
      address:         this.address().trim(),
      testIds:         this.selectedTests().map(t => t.id),
      urgency:         this.urgency() as 'normal' | 'urgent',
      scheduledAt:     scheduled || null,
      isScheduled:     !!scheduled,
      prescriptionUrl: this.prescriptionUrl() || null,
      notes:           null,
      latitude:        null,
      longitude:       null,
    };

    this.isSubmitting.set(true);
    this.jobSvc.create(dto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (job) => {
          this.notification.success('Job Request Created', `Request #${job.requestNumber} has been submitted successfully.`);
          this.router.navigate(['/job-requests']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server. Check your internet.');
          else if (err.status === 400) this.notification.error('Validation Error', Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message ?? 'Invalid data.');
          else if (err.status === 409) this.notification.error('Conflict', err.error?.message ?? 'A conflict occurred.');
          else if (err.status === 422) this.notification.error('Business Rule Error', err.error?.message ?? 'This request cannot be processed.');
          else if (err.status === 500) this.notification.error('Server Error', 'Something went wrong. Please try again.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to create job request.');
        }
      });
  }

  cancel(): void { this.router.navigate(['/job-requests']); }
}