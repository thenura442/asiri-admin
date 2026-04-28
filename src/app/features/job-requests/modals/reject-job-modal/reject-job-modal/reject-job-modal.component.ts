import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reject-job-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reject-job-modal.component.html',
  styleUrl: './reject-job-modal.component.scss'
})
export class RejectJobModalComponent {
  jobNumber = input('');
  closed    = output<void>();
  rejected  = output<{ reason: string; notes: string }>();

  reason = signal('');
  notes  = signal('');

  reasons = [
    'No drivers available', 'No sample bottles', 'Equipment unavailable',
    'Branch closing', 'Customer not prepared', 'Other'
  ];

  submit(): void {
    if (!this.reason()) return;
    this.rejected.emit({ reason: this.reason(), notes: this.notes() });
    this.closed.emit();
  }

  close(): void { this.closed.emit(); }
}