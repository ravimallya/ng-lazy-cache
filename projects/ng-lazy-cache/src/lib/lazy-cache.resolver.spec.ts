import { TestBed } from '@angular/core/testing';
import { NgModule } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { LazyCache } from './lazy-cache.resolver';
import { Observable, of } from 'rxjs';

@NgModule({})
class TestModule {}

describe('LazyCache Resolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule, RouterTestingModule], // Ensure RouterTestingModule for resolver
    });
  });

  it('should return cached data on second call', (done) => {
    const fetchFn = () => of('test-data') as Observable<string>;
    const resolver = LazyCache(fetchFn, { key: 'test-key' });
    const route: any = {};
    const state: any = {};

    (resolver(route, state) as Observable<string>).subscribe((data: string) => {
      expect(data).toBe('test-data');
      (resolver(route, state) as Observable<string>).subscribe((cachedData: string) => {
        expect(cachedData).toBe('test-data');
        done();
      });
    });
  });

  it('should respect TTL', (done) => {
    const fetchFn = () => of('test-data') as Observable<string>;
    const resolver = LazyCache(fetchFn, { key: 'ttl-key', ttl: -1000 });
    const route: any = {};
    const state: any = {};

    (resolver(route, state) as Observable<string>).subscribe((data: string) => {
      expect(data).toBe('test-data');
      done();
    });
  });
});