export const API = {

  // Auth
  AUTH: {
    LOGIN:           '/auth/login',
    LOGOUT:          '/auth/logout',
    REFRESH:         '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD:  '/auth/reset-password',
    VERIFY_2FA:      '/auth/verify-2fa',
    PROFILE:         '/auth/profile',
  },

  // Users
  USERS: {
    BASE:            '/users',
    BY_ID:           (id: string) => `/users/${id}`,
    SUSPEND:         (id: string) => `/users/${id}/suspend`,
    ACTIVATE:        (id: string) => `/users/${id}/activate`,
    RESET_PASSWORD:  (id: string) => `/users/${id}/reset-password`,
    CHANGE_ROLE:     (id: string) => `/users/${id}/role`,
  },

  // Vehicles
  VEHICLES: {
    BASE:            '/vehicles',
    BY_ID:           (id: string) => `/vehicles/${id}`,
    ASSIGN_DRIVER:   (id: string) => `/vehicles/${id}/assign-driver`,
    UNASSIGN_DRIVER: (id: string) => `/vehicles/${id}/unassign-driver`,
  },

  // Drivers
  DRIVERS: {
    BASE:            '/drivers',
    BY_ID:           (id: string) => `/drivers/${id}`,
    SUSPEND:         (id: string) => `/drivers/${id}/suspend`,
    ACTIVATE:        (id: string) => `/drivers/${id}/activate`,
  },

  // Patients
  PATIENTS: {
    BASE:            '/patients',
    BY_ID:           (id: string) => `/patients/${id}`,
    BOOKING_HISTORY: (id: string) => `/patients/${id}/bookings`,
  },

  // Tests
  TESTS: {
    BASE:            '/tests',
    BY_ID:           (id: string) => `/tests/${id}`,
    ACTIVATE:        (id: string) => `/tests/${id}/activate`,
    DEACTIVATE:      (id: string) => `/tests/${id}/deactivate`,
  },

  // Branches
  BRANCHES: {
    BASE:            '/branches',
    BY_ID:           (id: string) => `/branches/${id}`,
    ACTIVATE:        (id: string) => `/branches/${id}/activate`,
    DEACTIVATE:      (id: string) => `/branches/${id}/deactivate`,
  },

  JOBS: {
    BASE:            '/job-requests',
    BY_ID:           (id: string) => `/job-requests/${id}`,
    NEW_BOOKING:     '/job-requests',                              // POST — admin creates booking
    ALLOCATE:        (id: string) => `/job-requests/${id}/allocate`,
    REJECT:          (id: string) => `/job-requests/${id}/reject`,
    CANCEL:          (id: string) => `/job-requests/${id}/cancel`,
    REASSIGN:        (id: string) => `/job-requests/${id}/reassign`,
    TIMELINE:        (id: string) => `/job-requests/${id}/timeline`,
    UPDATE_STATUS:   (id: string) => `/job-requests/${id}/status`,
    UPDATE_ADDRESS:  (id: string) => `/job-requests/${id}/address`,
    FORCE_COMPLETE:  (id: string) => `/job-requests/${id}/force-complete`,
  },

  // Lab
  LAB: {
    BASE:             '/lab',
    APPROVALS:        '/lab/approvals',
    RECEIVE_SAMPLE:   (id: string) => `/lab/approvals/${id}/receive`,
    REPORT_ISSUE:     (id: string) => `/lab/approvals/${id}/issue`,
    UPLOAD_REPORT:    (id: string) => `/lab/approvals/${id}/report`,
  },

  // Notifications
  NOTIFICATIONS: {
    BASE:             '/notifications',
    BY_ID:            (id: string) => `/notifications/${id}`,
    MARK_READ:        (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ:    '/notifications/read-all',
    UNREAD_COUNT:     '/notifications/unread-count',
  },

  // Reports
  REPORTS: {
    SUMMARY:          '/reports/summary',
    BOOKING_TRENDS:   '/reports/booking-trends',
    COMPLETION_RATE:  '/reports/completion-rate',
    REVENUE:          '/reports/revenue',
    TURNAROUND:       '/reports/turnaround',
    BRANCH_PERF:      '/reports/branch-performance',
    EXPORT:           '/reports/export',
  },

  SETTINGS: {
  BASE:               '/settings',
  OPERATING_HOURS:    '/settings/operating-hours',
  MAINTENANCE:        '/settings/maintenance',
  MAINTENANCE_MOBILE: '/settings/maintenance/mobile',
  MAINTENANCE_ADMIN:  '/settings/maintenance/admin',
  SESSIONS:           '/settings/sessions',
  FORCE_LOGOUT:       (userId: string) => `/settings/sessions/${userId}/logout`,
},

  // Dashboard
  DASHBOARD: {
    STATS:            '/dashboard/stats',
    FLEET:            '/dashboard/fleet',
    RECENT_JOBS:      '/dashboard/recent-jobs',
  },

  // Notify Super Admin
  NOTIFY_SA:          '/notifications/notify-super-admin',

} as const;