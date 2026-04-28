import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalService } from '@shared/services/modal/modal.service';
import { CustomDropdownComponent, DropdownOption } from '@shared/components/ui/custom-dropdown/custom-dropdown/custom-dropdown.component';
import { FileUploadComponent } from '@shared/components/ui/file-upload/file-upload/file-upload.component';

interface ChecklistItem { label: string; required: boolean; done: boolean; }

@Component({
  selector: 'app-job-request-new',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FileUploadComponent, CustomDropdownComponent],
  templateUrl: './job-request-new.component.html',
  styleUrl: './job-request-new.component.scss'
})
export class JobRequestNewComponent {
  private router = inject(Router);
  private modal  = inject(ModalService);

  isSubmitting = signal(false);

  // Form fields
  selectedPatientId = signal<string | null>(null);
  address           = signal('');
  city              = signal('');
  landmark          = signal('');
  selectedTestIds   = signal<string[]>([]);
  requestType       = signal('immediate');
  urgency           = signal('normal');
  fasting           = signal('no');
  scheduledAt       = signal('');
  specialInstructions = signal('');
  prescriptionUrl   = signal<string | null>(null);

  // Queue stats
  queueStats = signal({ pending: 42, inProgress: 18, completed: 145, onlineDrivers: 8 });

  // Dropdown options
  patientOptions: DropdownOption[] = [
    { value: 'p1', label: 'Kamala Perera', meta: 'UHID-2026-0412' },
    { value: 'p2', label: 'Johnathan Doe', meta: 'UHID-2026-0389' },
    { value: 'p3', label: 'Sarah Jenkins', meta: 'UHID-2026-0401' },
    { value: 'p4', label: 'Robert Brown',  meta: 'UHID-2026-0356' },
  ];

  sourceOptions: DropdownOption[] = [
    { value: 'phone', label: 'Phone Call', dot: 'var(--sbl)' },
    { value: 'walk_in', label: 'Walk-in', dot: 'var(--sg)' },
    { value: 'whatsapp', label: 'WhatsApp', dot: 'var(--sg)' },
    { value: 'referral', label: 'Referral', dot: 'var(--sa)' },
    { value: 'repeat', label: 'Repeat Booking', dot: 'var(--accent)' },
  ];

  testOptions: DropdownOption[] = [
    { value: 'fbc',     label: 'Full Blood Count (FBC)',    meta: 'Rs. 1,500', group: 'Blood Tests' },
    { value: 'lipid',   label: 'Lipid Profile',            meta: 'Rs. 2,800', group: 'Blood Tests' },
    { value: 'fbs',     label: 'Fasting Blood Sugar',      meta: 'Rs. 800',   group: 'Blood Tests' },
    { value: 'hba1c',   label: 'HBA1C',                    meta: 'Rs. 3,200', group: 'Blood Tests' },
    { value: 'thyroid', label: 'Thyroid Panel (TSH/T3/T4)',meta: 'Rs. 4,500', group: 'Blood Tests' },
    { value: 'urine',   label: 'Urine Full Report',        meta: 'Rs. 600',   group: 'Urine Tests' },
  ];

  typeOptions: DropdownOption[] = [
    { value: 'immediate', label: 'Immediate (ASAP)', dot: 'var(--sg)' },
    { value: 'scheduled', label: 'Scheduled',        dot: 'var(--sbl)' },
  ];

  urgencyOptions: DropdownOption[] = [
    { value: 'normal', label: 'Normal',                    dot: 'var(--sg)' },
    { value: 'urgent', label: 'Urgent (priority dispatch)',dot: 'var(--sr)' },
  ];

  fastingOptions: DropdownOption[] = [
    { value: 'no',        label: 'No',                                dot: 'var(--t5)' },
    { value: 'yes_done',  label: 'Yes — Patient has been informed',   dot: 'var(--sg)' },
    { value: 'yes_todo',  label: 'Yes — Patient needs to be informed',dot: 'var(--sa)' },
  ];

  selectedSource = signal<string | null>('phone');

  checklist = signal<ChecklistItem[]>([
    { label: 'Patient selected or registered', required: false, done: false },
    { label: 'Collection address entered',     required: true,  done: false },
    { label: 'At least one test selected',     required: true,  done: false },
    { label: 'Schedule type confirmed',        required: true,  done: false },
    { label: 'Priority level set',             required: false, done: false },
    { label: 'Patient notified',               required: false, done: false },
  ]);

  recentBookings = [
    { initials: 'KP', name: 'Kamala Perera',  date: 'Today, 08:30', status: 'In Progress', statusClass: 'status-prog' },
    { initials: 'JD', name: 'Johnathan Doe',  date: 'Today, 07:45', status: 'Completed',   statusClass: 'status-done' },
    { initials: 'SJ', name: 'Sarah Jenkins',  date: 'Yesterday',    status: 'Completed',   statusClass: 'status-done' },
  ];

  onPatientSelect(id: string | null): void {
    this.selectedPatientId.set(id);
    this.updateChecklist(0, !!id);
  }

  onAddressInput(val: string): void {
    this.address.set(val);
    this.updateChecklist(1, val.trim().length > 0);
  }

  onTestSelect(id: string | null): void {
    if (!id) return;
    const cur = this.selectedTestIds();
    if (!cur.includes(id)) this.selectedTestIds.set([...cur, id]);
    this.updateChecklist(2, true);
  }

  removeTest(id: string): void {
    this.selectedTestIds.set(this.selectedTestIds().filter(t => t !== id));
    this.updateChecklist(2, this.selectedTestIds().length > 0);
  }

  onTypeSelect(val: string | null): void {
    this.requestType.set(val ?? 'immediate');
    this.updateChecklist(3, true);
  }

  onUrgencySelect(val: string | null): void {
    this.urgency.set(val ?? 'normal');
    this.updateChecklist(4, true);
  }

  private updateChecklist(index: number, done: boolean): void {
    const list = [...this.checklist()];
    list[index] = { ...list[index], done };
    this.checklist.set(list);
  }

  getTestLabel(id: string): string {
    return this.testOptions.find(o => o.value === id)?.label ?? id;
  }

  estimatedTotal(): number {
    const prices: Record<string, number> = { fbc: 1500, lipid: 2800, fbs: 800, hba1c: 3200, thyroid: 4500, urine: 600 };
    return this.selectedTestIds().reduce((sum, id) => sum + (prices[id] ?? 0), 0);
  }

  get canSubmit(): boolean {
    return !!this.selectedPatientId() && this.address().trim().length > 0 && this.selectedTestIds().length > 0;
  }

  submit(): void {
    if (!this.canSubmit) { this.modal.error('Please fill in all required fields'); return; }
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.modal.success('Job request created successfully');
      this.router.navigate(['/job-requests']);
    }, 800);
  }

  cancel(): void { this.router.navigate(['/job-requests']); }
}