import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';

const cache = new Map<string, { response: HttpResponse<unknown>; timestamp: number }>();
const CACHE_TTL_MS   = 5 * 60 * 1000;
const CACHEABLE_URLS = ['/tests', '/branches'];

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') return next(req);

  const isCacheable = CACHEABLE_URLS.some(url => req.url.includes(url));
  if (!isCacheable) return next(req);

  const cached = cache.get(req.url);
  const now    = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
    return of(cached.response.clone());
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(req.url, { response: event.clone(), timestamp: now });
      }
    })
  );
};