import { Routes } from '@angular/router';

export const labApprovalRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/lab-approval-list/lab-approval-list/lab-approval-list.component')
        .then(m => m.LabApprovalListComponent)
  }
];