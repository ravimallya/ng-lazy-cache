import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LazyCacheOptions<T> {
  key?: string;
  ttl?: number; // ms, default session (until reload)
  invalidateOn?: string[]; // Future: event names for invalidation
}

const cache = new Map<string, { data: any; expiry: number }>();

export function LazyCache<T>(fetchFn: () => Observable<T>, options: LazyCacheOptions<T> = {}): ResolveFn<T> {
  const { key = 'default', ttl = 0 } = options; // 0 = session-only

  return (route, state): Observable<T> => {
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && (ttl === 0 || now < cached.expiry)) {
      return of(cached.data as T); // Explicit cast to T
    }

    return fetchFn().pipe(
      tap(data => {
        cache.set(key, { data, expiry: ttl > 0 ? now + ttl : now });
      })
    );
  };
}