export const APP = {

  // Pagination
  DEFAULT_PAGE_SIZE:   10,
  PAGE_SIZE_OPTIONS:   [10, 25, 50, 100],

  // Session
  SESSION_TIMEOUT_MS:  24 * 60 * 60 * 1000,
  MAX_LOGIN_ATTEMPTS:  5,
  LOCKOUT_DURATION_MS: 30 * 60 * 1000,

  // File uploads
  MAX_FILE_SIZE_MB:    10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  SUPPORTED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/jpg'],
  SUPPORTED_DOC_TYPES:   ['application/pdf', 'image/png', 'image/jpeg'],

  // Search
  SEARCH_DEBOUNCE_MS:  300,

  // Realtime
  REALTIME_ENABLED:    true,

  // Operating hours defaults
  DEFAULT_OPENING_TIME: '06:30',
  DEFAULT_CLOSING_TIME: '16:00',

  // Branch assignment algorithm
  INITIAL_RADIUS_KM:          5,
  EXPANDED_RADIUS_KM:         10,
  RESERVATION_TTL_MS:         5 * 60 * 1000,
  ASSIGNMENT_TIMEOUT_SECONDS: 120,
  AUTO_DISPATCH_BUFFER_MIN:   15,
  CUSTOMER_WAIT_TIMEOUT_MIN:  10,

  // Pricing defaults
  DEFAULT_PER_KM_RATE:      150,
  PICKME_SURCHARGE:         200,
  LATE_CANCELLATION_FEE:    500,

  // App info
  APP_NAME:    'Asiri Laboratories',
  APP_VERSION: '2.4.1',
  APP_TAGLINE: 'Mobile Service Platform',

} as const;