import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../../services/loading/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  const skipLoading = req.headers.has('X-Skip-Loading');
  if (skipLoading) return next(req);

  loading.show();

  return next(req).pipe(
    finalize(() => loading.hide())
  );
};