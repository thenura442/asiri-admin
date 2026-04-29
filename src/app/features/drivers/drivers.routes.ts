import { Routes } from '@angular/router';

export const driverRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/driver-list/driver-list/driver-list.component').then(m => m.DriverListComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/driver-register/driver-register/driver-register.component').then(m => m.DriverRegistrationComponent)
  }
];