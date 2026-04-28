import { Routes } from '@angular/router';

export const testRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/test-list/test-list/test-list.component').then(m => m.TestListComponent)
  }
];