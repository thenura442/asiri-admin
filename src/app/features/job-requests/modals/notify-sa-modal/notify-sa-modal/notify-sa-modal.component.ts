import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notify-sa-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notify-sa-modal.component.html',
  styleUrl: './notify-sa-modal.component.scss'
})
export class NotifySaModalComponent {
  closed    = output<void>();
  submitted = output<{ category: string; details: string; urgency: string }>();

  jobId    = signal('');
  category = signal('');
  details  = signal('');
  urgency  = signal('normal');

  categories = [
    'Vehicle breakdown', 'Driver issue', 'Sample issue',
    'Equipment issue', 'Staff shortage', 'Customer complaint',
    'System error', 'Other'
  ];

  setUrgency(val: string): void { this.urgency.set(val); }

  submit(): void {
    if (!this.category() || !this.details()) return;
    this.submitted.emit({ category: this.category(), details: this.details(), urgency: this.urgency() });
    this.closed.emit();
  }

  close(): void { this.closed.emit(); }
}