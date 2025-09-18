import { ResolveFn } from '@angular/router';
import { inject, InjectionToken } from '@angular/core'; // Import inject and InjectionToken
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Injection token for global TTL configuration
export const GLOBAL_TTL_TOKEN = new InjectionToken<number>('Global TTL', {
  providedIn: 'root',
  factory: () => 30000 // Default to 30 seconds
});

export interface LazyCacheOptions<T> {
  key: string | ((route: any) => string); // Key can be static or dynamic
  ttl?: number; // Optional TTL per resolver instance
}

const cache = new Map<string, { data: any; expiry: number }>();

export function LazyCache<T>(
  fetchFn: () => Observable<T>,
  options: LazyCacheOptions<T> = { key: 'default' }
): ResolveFn<T> {
  // Create a factory to defer injection until resolver execution
  return (route, state) => {
    const getGlobalTtl = () => inject(GLOBAL_TTL_TOKEN); // Deferred injection
    const ttl = options.ttl ?? getGlobalTtl();
    const key = typeof options.key === 'function' ? options.key(route) : options.key;

    const cached = cache.get(key);
    const now = Date.now();

    if (cached && now < cached.expiry) {
      return of(cached.data);
    }

    return fetchFn().pipe(
      tap((data: T) => {
        cache.set(key, { data, expiry: now + ttl });
      }),
      catchError(error => {
        console.error(`Error fetching data for key ${key}:`, error);
        return of(null as T); // Type-safe fallback
      })
    );
  };
}