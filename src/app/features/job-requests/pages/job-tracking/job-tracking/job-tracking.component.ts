import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalService } from '@shared/services/modal/modal.service';
import { TimeAgoPipe } from '@shared/pipes/time-ago/time-ago.pipe';
import { CurrencyLkrPipe } from '@shared/pipes/currency-lkr/currency-lkr.pipe';
import { StatusLabelPipe } from '@shared/pipes/status-label/status-label.pipe';

interface TimelineStep {
  number: number; title: string; description: string;
  status: 'done' | 'active' | 'pending' | 'failed';
  timestamp: string | null; phase: 'collection' | 'transport' | 'processing' | 'delivery';
}

@Component({
  selector: 'app-job-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TimeAgoPipe, CurrencyLkrPipe, StatusLabelPipe],
  templateUrl: './job-tracking.component.html',
  styleUrl: './job-tracking.component.scss'
})
export class JobTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private modal  = inject(ModalService);

  jobId = signal('');
  noteText = signal('');

  job = signal({
    id: '1', requestNumber: 'REQ-2026-0847', status: 'en_route', urgency: 'normal',
    patient: { fullName: 'Johnathan Doe', initials: 'JD', age: 45, gender: 'M', uhid: '129938', phone: '+94 77 123 4567', address: '78 Galle Rd, Colombo 03', emergencyName: 'Samantha', emergencyPhone: '+94 71 987 6543', flag: 'regular', pendingCharges: 0, allergies: null, specialInstructions: null },
    tests: [
      { id: 't1', name: 'Full Blood Count', code: 'FBC-001', sampleType: 'blood', prescriptionRequired: false, status: 'pending', isCriticalValue: false },
      { id: 't2', name: 'Lipid Panel', code: 'LIP-003', sampleType: 'blood', prescriptionRequired: true, status: 'pending', isCriticalValue: false },
    ],
    driver: { fullName: 'Nimal Perera', initials: 'NP', phone: '+94 77 123 4567', status: 'active' },
    vehicle: { plateNumber: 'WP CAB-4521', vehicleType: 'Van', vehicleIdCode: 'AS-MOB-45', distanceKm: 2.1, etaMinutes: 12 },
    branch: { name: 'Colombo 03 Center', phone: '011 234 5678' },
    pricing: { basePrice: 5700, distanceKm: 2.1, perKmRate: 150, transportFee: 0, totalPrice: 6015, pendingCharges: 0 },
    notes: [
      { author: 'Arjuna Silva', time: '08:22 AM', text: 'Dispatched job. Patient confirmed fasting status via phone call.' },
      { author: 'System', time: '08:18 AM', text: 'Branch accepted within 2 minutes. No escalation needed.' },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  });

  timeline = signal<TimelineStep[]>([
    { number: 1,  title: 'Patient booked mobile laboratory service',   description: 'Johnathan Doe requested FBC + Lipid Panel via mobile app', status: 'done',    timestamp: '08:15 AM', phase: 'collection' },
    { number: 2,  title: 'Alert sent to nearest branch',              description: 'Colombo 03 Center notified (closest within 5km)',           status: 'done',    timestamp: '08:16 AM', phase: 'collection' },
    { number: 3,  title: 'Branch accepted — driver alerted',          description: 'Colombo 03 Center accepted. Nimal Perera assigned.',        status: 'done',    timestamp: '08:18 AM', phase: 'collection' },
    { number: 4,  title: 'Technician preparing for sample collection', description: 'Equipment checklist verified. Blood collection kit ready.', status: 'done',    timestamp: '08:20 AM', phase: 'collection' },
    { number: 5,  title: 'Admin approved job allocation',             description: 'Dispatched by Arjuna Silva (Super Admin)',                  status: 'done',    timestamp: '08:22 AM', phase: 'collection' },
    { number: 6,  title: 'Driver departed to branch',                 description: 'En route to Colombo 03 Center for technician pickup',       status: 'done',    timestamp: '08:25 AM', phase: 'collection' },
    { number: 7,  title: 'Driver at branch — technician picked up',   description: 'Technician boarded. Departing to patient location.',        status: 'done',    timestamp: '08:32 AM', phase: 'collection' },
    { number: 8,  title: 'En route to patient',                       description: 'Live GPS active. ETA: 12 min to 78 Galle Rd, Colombo 03',  status: 'active',  timestamp: '08:35 AM', phase: 'collection' },
    { number: 9,  title: 'Arrived at patient location',               description: 'GPS confirmed arrival',                                     status: 'pending', timestamp: null,        phase: 'collection' },
    { number: 10, title: 'Sample collection in progress',             description: 'Blood and/or urine collection by technician',               status: 'pending', timestamp: null,        phase: 'collection' },
    { number: 11, title: 'Sample collected successfully',             description: 'Collection confirmed or partial failure recorded',           status: 'pending', timestamp: null,        phase: 'collection' },
    { number: 12, title: 'Departed from customer location',           description: 'Vehicle heading back to collecting center',                 status: 'pending', timestamp: null,        phase: 'transport' },
    { number: 13, title: 'Arrived at collecting center',              description: 'Vehicle returned to Colombo 03 Center',                    status: 'pending', timestamp: null,        phase: 'transport' },
    { number: 14, title: 'Samples verified at center',                description: 'Sample integrity and labeling confirmed',                   status: 'pending', timestamp: null,        phase: 'transport' },
    { number: 15, title: 'Lab assigned for processing',               description: 'Default: Asiri Central Lab — Biochemistry',                status: 'pending', timestamp: null,        phase: 'transport' },
    { number: 16, title: 'Samples sent to assigned lab',              description: 'Samples dispatched for laboratory processing',              status: 'pending', timestamp: null,        phase: 'transport' },
    { number: 17, title: 'Lab received samples',                      description: 'Per-test receipt confirmation (Received / Not Received)',   status: 'pending', timestamp: null,        phase: 'processing' },
    { number: 18, title: 'Lab processing samples',                    description: 'Tests being run by assigned lab technician',                status: 'pending', timestamp: null,        phase: 'processing' },
    { number: 19, title: 'Reports uploaded',                          description: 'Lab technician uploaded report files for all tests',        status: 'pending', timestamp: null,        phase: 'processing' },
    { number: 20, title: 'Report reviewed',                           description: 'Branch or super admin reviewed before customer release',    status: 'pending', timestamp: null,        phase: 'delivery' },
    { number: 21, title: 'Customer notified — job complete',          description: 'Digital report available. Hard copy at center if requested.', status: 'pending', timestamp: null,      phase: 'delivery' },
  ]);

  collectionSteps  = this.timeline().filter(s => s.phase === 'collection');
  transportSteps   = this.timeline().filter(s => s.phase === 'transport');
  processingSteps  = this.timeline().filter(s => s.phase === 'processing');
  deliverySteps    = this.timeline().filter(s => s.phase === 'delivery');

  ngOnInit(): void {
    this.jobId.set(this.route.snapshot.paramMap.get('id') ?? '');
  }

  flagBadgeClass(flag: string): string {
    const m: Record<string, string> = { regular: 'flag-regular', vip: 'flag-vip', new: 'flag-new', blacklisted: 'flag-blacklisted' };
    return m[flag] ?? 'flag-regular';
  }

  testStatusClass(status: string): string {
    const m: Record<string, string> = { pending: 'ts-pending', collected: 'ts-collected', failed: 'ts-failed', complete: 'ts-done' };
    return m[status] ?? 'ts-pending';
  }

  addNote(): void {
    if (!this.noteText().trim()) return;
    this.modal.success('Note added successfully');
    this.noteText.set('');
  }

  openNotifySA(): void  { this.modal.info('Notify Super Admin modal'); }
  openReassign(): void  { this.modal.info('Reassign vehicle modal'); }
  forceComplete(): void { this.modal.confirm({ title: 'Force Complete', message: 'Force complete this job? This action is permanent.', confirmLabel: 'Force Complete', danger: true }).subscribe(); }
  cancelJob(): void     { this.modal.confirm({ title: 'Cancel Job', message: 'Cancel this job request?', confirmLabel: 'Cancel Job', danger: true }).subscribe(); }
}