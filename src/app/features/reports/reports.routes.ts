import { Routes } from '@angular/router';

export const reportRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reports/reports/reports.component').then(m => m.ReportsComponent)
  }
];