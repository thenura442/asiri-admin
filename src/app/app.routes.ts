import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth/auth.guard';

export const routes: Routes = [
  // ── Auth pages (full screen, no layout) ──────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: '2fa-verify',
    loadComponent: () =>
      import('./features/auth/two-factor/two-factor/two-factor.component').then(m => m.TwoFactorComponent)
  },

  // ── Main app shell (sidebar + topbar) ─────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/main-layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
        data: { roles: ['super_admin', 'front_office', 'lab_manager', 'business_admin'] }
      },
      {
        path: 'job-requests',
        loadChildren: () =>
          import('./features/job-requests/job-requests.routes').then(m => m.jobRequestRoutes),
        data: { roles: ['super_admin', 'front_office', 'lab_manager', 'business_admin'] }
      },
      {
        path: 'vehicles',
        loadChildren: () =>
          import('./features/vehicles/vehicles.routes').then(m => m.vehicleRoutes),
        data: { roles: ['super_admin', 'front_office', 'lab_manager'] }
      },
      {
        path: 'drivers',
        loadChildren: () =>
          import('./features/drivers/drivers.routes').then(m => m.driverRoutes),
        data: { roles: ['super_admin', 'front_office', 'lab_manager'] }
      },
      {
        path: 'patients',
        loadChildren: () =>
          import('./features/patients/patients.routes').then(m => m.patientRoutes),
        data: { roles: ['super_admin', 'front_office', 'lab_manager'] }
      },
      {
        path: 'tests',
        loadChildren: () =>
          import('./features/tests/tests.routes').then(m => m.testRoutes),
        data: { roles: ['super_admin'] }
      },
      {
        path: 'branches',
        loadChildren: () =>
          import('./features/branches/branches.routes').then(m => m.branchRoutes),
        data: { roles: ['super_admin'] }
      },
      {
        path: 'lab-approvals',
        loadChildren: () =>
          import('./features/lab-approvals/lab-approvals.routes').then(m => m.labApprovalRoutes),
        data: { roles: ['super_admin', 'lab_manager', 'lab_technician'] }
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then(m => m.userRoutes),
        data: { roles: ['super_admin'] }
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.routes').then(m => m.reportRoutes),
        data: { roles: ['super_admin', 'front_office', 'lab_manager', 'business_admin'] }
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./features/notifications/notifications.routes').then(m => m.notificationRoutes)
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then(m => m.settingsRoutes),
        data: { roles: ['super_admin'] }
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes').then(m => m.profileRoutes)
      },
    ]
  },

  { path: '**', redirectTo: 'login' }
];