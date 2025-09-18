import { ResolveFn } from '@angular/router';
import { inject, InjectionToken } from '@angular/core';
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

// In-memory cache
const cache: { [key: string]: { data: any; expiry: number } } = {};

export function clearCache(): void {
  for (const key in cache) {
    delete cache[key];
  }
}

export function LazyCache<T>(
  fetchFn: () => Observable<T>,
  options: LazyCacheOptions<T> = { key: 'default' }
): ResolveFn<T> {
  return (route, state) => {
    const globalTtl = inject(GLOBAL_TTL_TOKEN);
    const ttl = options.ttl ?? globalTtl;
    const key = typeof options.key === 'function' ? options.key(route) : options.key;

    const now = Date.now();
    const cached = cache[key];

    if (cached && now < cached.expiry) {
      return of(cached.data);
    }

    return fetchFn().pipe(
      tap((data: T) => {
        cache[key] = { data, expiry: now + ttl };
      }),
      catchError(error => {
        console.error(`Error fetching data for key ${key}:`, error);
        return of(null as T); // Fallback
      })
    );
  };
}