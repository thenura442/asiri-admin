import { JobStatus }     from '../enums/job-status.enum';
import { VehicleStatus } from '../enums/vehicle-status.enum';
import { DriverStatus }  from '../enums/driver-status.enum';

export const JOB_STATUS_BADGE: Record<JobStatus, string> = {
  [JobStatus.PENDING]:         'bd bd-pend',
  [JobStatus.QUEUED]:          'bd bd-inactive',
  [JobStatus.ACCEPTED]:        'bd bd-prog',
  [JobStatus.ALLOCATED]:       'bd bd-alloc',
  [JobStatus.DISPATCHED]:      'bd bd-prog',
  [JobStatus.EN_ROUTE]:        'bd bd-prog',
  [JobStatus.ARRIVED]:         'bd bd-prog',
  [JobStatus.COLLECTING]:      'bd bd-alloc',
  [JobStatus.COLLECTED]:       'bd bd-active',
  [JobStatus.RETURNING]:       'bd bd-busy',
  [JobStatus.AT_CENTER]:       'bd bd-prog',
  [JobStatus.SENT_TO_LAB]:     'bd bd-busy',
  [JobStatus.LAB_RECEIVED]:    'bd bd-received',
  [JobStatus.PROCESSING]:      'bd bd-processing',
  [JobStatus.REPORT_READY]:    'bd bd-busy',
  [JobStatus.REPORT_REVIEWED]: 'bd bd-active',
  [JobStatus.COMPLETED]:       'bd bd-complete',
  [JobStatus.FAILED]:          'bd bd-rej',
  [JobStatus.REJECTED]:        'bd bd-rej',
  [JobStatus.CANCELLED]:       'bd bd-rej',
};

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  [JobStatus.PENDING]:         'Pending',
  [JobStatus.QUEUED]:          'Queued',
  [JobStatus.ACCEPTED]:        'Accepted',
  [JobStatus.ALLOCATED]:       'Allocated',
  [JobStatus.DISPATCHED]:      'Dispatched',
  [JobStatus.EN_ROUTE]:        'En Route',
  [JobStatus.ARRIVED]:         'Arrived',
  [JobStatus.COLLECTING]:      'Collecting',
  [JobStatus.COLLECTED]:       'Collected',
  [JobStatus.RETURNING]:       'Returning',
  [JobStatus.AT_CENTER]:       'At Center',
  [JobStatus.SENT_TO_LAB]:     'Sent to Lab',
  [JobStatus.LAB_RECEIVED]:    'Lab Received',
  [JobStatus.PROCESSING]:      'Processing',
  [JobStatus.REPORT_READY]:    'Report Ready',
  [JobStatus.REPORT_REVIEWED]: 'Reviewed',
  [JobStatus.COMPLETED]:       'Completed',
  [JobStatus.FAILED]:          'Failed',
  [JobStatus.REJECTED]:        'Rejected',
  [JobStatus.CANCELLED]:       'Cancelled',
};

export const VEHICLE_STATUS_BADGE: Record<VehicleStatus, string> = {
  [VehicleStatus.AVAILABLE]: 'bd bd-avail',
  [VehicleStatus.BUSY]:      'bd bd-prog',
  [VehicleStatus.OFFLINE]:   'bd bd-offline',
};

export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  [VehicleStatus.AVAILABLE]: 'Available',
  [VehicleStatus.BUSY]:      'Busy',
  [VehicleStatus.OFFLINE]:   'Offline',
};

export const DRIVER_STATUS_BADGE: Record<DriverStatus, string> = {
  [DriverStatus.ACTIVE]:    'bd bd-active',
  [DriverStatus.INACTIVE]:  'bd bd-inactive',
  [DriverStatus.SUSPENDED]: 'bd bd-suspended',
};

export const DRIVER_STATUS_LABEL: Record<DriverStatus, string> = {
  [DriverStatus.ACTIVE]:    'Active',
  [DriverStatus.INACTIVE]:  'Inactive',
  [DriverStatus.SUSPENDED]: 'Suspended',
};