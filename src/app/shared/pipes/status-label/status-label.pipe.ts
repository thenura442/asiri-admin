import { Pipe, PipeTransform } from '@angular/core';

const STATUS_LABELS: Record<string, string> = {
  // Job statuses
  pending:         'Pending',
  queued:          'Queued',
  accepted:        'Accepted',
  allocated:       'Allocated',
  dispatched:      'Dispatched',
  en_route:        'En Route',
  arrived:         'Arrived',
  collecting:      'Collecting',
  collected:       'Collected',
  returning:       'Returning',
  at_center:       'At Center',
  sent_to_lab:     'Sent to Lab',
  lab_received:    'Lab Received',
  processing:      'Processing',
  report_ready:    'Report Ready',
  report_reviewed: 'Report Reviewed',
  completed:       'Completed',
  failed:          'Failed',
  rejected:        'Rejected',
  cancelled:       'Cancelled',
  // Driver statuses
  active:          'Active',
  inactive:        'Inactive',
  suspended:       'Suspended',
  // Vehicle statuses
  available:       'Available',
  busy:            'Busy',
  offline:         'Offline',
  // Patient flags
  new:             'New',
  regular:         'Regular',
  vip:             'VIP',
  blacklisted:     'Blacklisted',
  // User statuses
  locked:          'Locked',
  // Roles
  super_admin:     'Super Admin',
  front_office:    'Front Office',
  lab_manager:     'Lab Manager',
  lab_technician:  'Lab Technician',
  business_admin:  'Business Admin',
  // Branch types
  lab:                'Lab',
  collecting_center:  'Collecting Center',
};

@Pipe({ name: 'statusLabel', standalone: true })
export class StatusLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    return STATUS_LABELS[value] ?? value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}