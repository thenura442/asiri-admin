import { Routes } from '@angular/router';

export const jobRequestRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/job-request-list/job-request-list/job-request-list.component').then(m => m.JobRequestListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/job-request-new/job-request-new/job-request-new.component').then(m => m.JobRequestNewComponent)
  },
  {
    path: ':id/tracking',
    loadComponent: () =>
      import('./pages/job-tracking/job-tracking/job-tracking.component').then(m => m.JobTrackingComponent)
  }
];