import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LazyCache, GLOBAL_TTL_TOKEN } from './lazy-cache.resolver';
import { of, throwError } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

// Helper to clear the cache between tests to ensure isolation
const clearCache = () => {
  // This is a bit of a hack for testing, assuming you can't export the cache directly.
  // A better approach might be to have a 'clear' function exported from your library for testing.
  // For now, we can re-create a resolver with a short TTL and let it expire.
};


describe('LazyCache Resolver with GLOBAL_TTL_TOKEN', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: GLOBAL_TTL_TOKEN, useValue: 5000 } // default global TTL = 5s
      ]
    });
    // A simple way to reset state without exporting the cache
    const resetter = LazyCache(() => of(null), { key: 'reset', ttl: 0 });
    TestBed.runInInjectionContext(() => (resetter as any)({}, {}).subscribe());
  });

  it('should return cached data on second call (using global TTL)', (done) => {
    const fetchFn = jasmine.createSpy('fetchFn').and.returnValue(of('test-data'));
    const resolver = LazyCache<string>(fetchFn, { key: 'test-key' });
    const route: any = {};
    const state: any = {};

    TestBed.runInInjectionContext(() => {
      (resolver(route, state) as any).subscribe((data: string) => {
        expect(data).toBe('test-data');
        expect(fetchFn).toHaveBeenCalledTimes(1);

        // Second call
        (resolver(route, state) as any).subscribe((cachedData: string) => {
          expect(cachedData).toBe('test-data');
          expect(fetchFn).toHaveBeenCalledTimes(1); // Should not be called again
          done();
        });
      });
    });
  });

  it('should respect route-level TTL over global TTL', fakeAsync(() => {
    const fetchFn = jasmine.createSpy('fetchFn').and.returnValue(of('ttl-data'));
    const resolver = LazyCache<string>(fetchFn, { key: 'ttl-key', ttl: 1000 }); // 1s TTL
    const route: any = {};
    const state: any = {};

    TestBed.runInInjectionContext(() => {
      (resolver(route, state) as any).subscribe();
      expect(fetchFn).toHaveBeenCalledTimes(1);

      tick(500); // Advance time by 0.5s

      (resolver(route, state) as any).subscribe((cachedData: string) => {
        expect(cachedData).toBe('ttl-data');
      });
      expect(fetchFn).toHaveBeenCalledTimes(1); // Still cached
    });
  }));

  it('should invalidate cache after TTL expires', fakeAsync(() => {
    let fetchCount = 0;
    const fetchFn = () => {
      fetchCount++;
      return of(`data-${fetchCount}`);
    };
    const resolver = LazyCache<string>(fetchFn, { key: 'expire-key', ttl: 200 }); // 0.2s TTL
    const route: any = {};
    const state: any = {};

    TestBed.runInInjectionContext(() => {
      (resolver(route, state) as any).subscribe((data1: string) => {
        expect(data1).toBe('data-1');
      });
      expect(fetchCount).toBe(1);

      tick(300); // Advance time by 0.3s, past the TTL

      (resolver(route, state) as any).subscribe((data2: string) => {
        expect(data2).toBe('data-2'); // new fetch after expiry
      });
      expect(fetchCount).toBe(2);
    });
  }));

  it('should handle fetch errors with fallback', (done) => {
    const fetchFn = () => throwError(() => new Error('network error'));
    const resolver = LazyCache<string>(fetchFn, { key: 'error-key' });
    const route: any = {};
    const state: any = {};

    TestBed.runInInjectionContext(() => {
      (resolver(route, state) as any).subscribe((data: string | null) => {
        expect(data).toBeNull(); // fallback to null on error
        done();
      });
    });
  });

  it('should support dynamic key based on route', (done) => {
    const fetchFn1 = jasmine.createSpy('fetchFn1').and.returnValue(of('dynamic-data-42'));
    const fetchFn2 = jasmine.createSpy('fetchFn2').and.returnValue(of('dynamic-data-99'));

    const resolver = LazyCache<string>(
      // In a real scenario, the fetch function would use the route, but for this test we'll use two.
      () => (route.params.id === 42 ? fetchFn1() : fetchFn2()),
      { key: (route) => `user-${route.params.id}` }
    );

    let route: any = { params: { id: 42 } };
    const state: any = {};

    TestBed.runInInjectionContext(() => {
      // First call with id 42
      (resolver(route, state) as any).subscribe((data: string) => {
        expect(data).toBe('dynamic-data-42');
        expect(fetchFn1).toHaveBeenCalledTimes(1);

        // Second call with id 99
        route = { params: { id: 99 } };
        (resolver(route, state) as any).subscribe((data2: string) => {
            expect(data2).toBe('dynamic-data-99');
            expect(fetchFn2).toHaveBeenCalledTimes(1);

            // Third call, back to id 42 (should be cached)
            route = { params: { id: 42 } };
            (resolver(route, state) as any).subscribe((data3: string) => {
                expect(data3).toBe('dynamic-data-42');
                expect(fetchFn1).toHaveBeenCalledTimes(1); // Should not be called again
                done();
            });
        });
      });
    });
  });
});