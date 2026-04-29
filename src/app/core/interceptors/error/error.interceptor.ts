import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../services/notification/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router       = inject(Router);
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 0:
          // Only show if component doesn't handle it — components override this
          break;
        case 401:
          localStorage.removeItem('asiri_access_token');
          localStorage.removeItem('asiri_user');
          router.navigate(['/login']);
          break;
        case 403:
          notification.error('Access Denied', 'You do not have permission to perform this action.');
          router.navigate(['/dashboard']);
          break;
        case 429:
          notification.error('Too Many Requests', 'Please wait a moment before trying again.');
          break;
        case 502:
        case 503:
          notification.error('Server Error', 'Something went wrong on our end. Please try again shortly.');
          break;
        // ❌ REMOVED: 400, 404, 409, 422, 500 — all handled by individual components
      }
      return throwError(() => error);
    })
  );
};