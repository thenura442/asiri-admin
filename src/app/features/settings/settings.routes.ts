import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/settings/settings/settings.component').then(m => m.SettingsComponent)
  }
];