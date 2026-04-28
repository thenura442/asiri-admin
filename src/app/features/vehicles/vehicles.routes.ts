import { Routes } from '@angular/router';

export const vehicleRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/vehicle-list/vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent)
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./pages/vehicle-add/vehicle-add/vehicle-add.component').then(m => m.VehicleAddComponent)
  }
];