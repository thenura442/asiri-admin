import { Routes } from '@angular/router';

export const patientRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/patient-list/patient-list/patient-list.component').then(m => m.PatientListComponent)
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./pages/patient-add/patient-add/patient-add.component').then(m => m.PatientAddComponent)
  }
];