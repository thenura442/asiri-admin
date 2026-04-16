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
          notification.error('Connection Error', 'Unable to reach the server. Please check your connection.');
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
        case 404:
          notification.error('Not Found', 'The requested resource could not be found.');
          break;
        case 409:
          notification.error('Conflict', error.error?.message ?? 'This record already exists or the slot is already taken.');
          break;
        case 422:
          notification.error('Validation Error', error.error?.message ?? 'Please check your input and try again.');
          break;
        case 429:
          notification.error('Too Many Requests', 'Please wait a moment before trying again.');
          break;
        case 500:
        case 502:
        case 503:
          notification.error('Server Error', 'Something went wrong on our end. Please try again shortly.');
          break;
        default:
          if (error.status >= 400) {
            notification.error('Error', error.error?.message ?? 'An unexpected error occurred.');
          }
      }
      return throwError(() => error);
    })
  );
};