import { Routes } from '@angular/router';

export const userRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-list/user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./pages/user-add/user-add/user-add.component').then(m => m.UserAddComponent)
  }
];