import { Routes } from '@angular/router';

export const branchRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/branch-list/branch-list/branch-list.component').then(m => m.BranchListComponent)
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./pages/branch-add/branch-add/branch-add.component').then(m => m.BranchAddComponent)
  }
];