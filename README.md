# @ravimallya/ng-lazy-cache

A lightweight Angular route resolver for caching asynchronous data with a configurable time-to-live (TTL). This library helps optimize Angular applications by reducing redundant API calls and improving performance for route data loading.

## Overview

`@ravimallya/ng-lazy-cache` provides a `LazyCache` resolver that caches the result of an asynchronous data fetch (e.g., HTTP requests) based on a unique key. It supports both route-level and global TTL configurations, allowing flexible caching strategies tailored to your application's needs.

- **Route-Level TTL**: Set a specific TTL for individual routes.
- **Global TTL**: Define a default TTL at the application level, overridden by route-specific values.
- **In-Memory Caching**: Stores data in memory with automatic expiration.

## Installation

Install the package via npm:

```bash
npm install @ravimallya/ng-lazy-cache
```

Ensure your project has the following peer dependencies:

- `@angular/core` (^15.0.0 || ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^20.0.0)
- `@angular/common` (^15.0.0 || ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^20.0.0)
- `@angular/router` (^15.0.0 || ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^20.0.0)
- `rxjs` (~7.8.0 || ^8.0.0)

## Usage

### Basic Example

Configure the resolver in your route definition to cache data for a specific route.

```typescript
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LazyCache } from '@ravimallya/ng-lazy-cache';
import { of } from 'rxjs';

const fetchData = () => {
  console.log('Fetching data...');
  return of('Loaded data from server');
};

export const routes: Routes = [
  {
    path: 'cached-route',
    component: HomeComponent,
    resolve: {
      data: LazyCache(fetchData, { key: 'demo-key', ttl: 5000 }) // 5-second TTL
    }
  },
  { path: '', redirectTo: '/cached-route', pathMatch: 'full' }
];
```

In your component, access the resolved data:

```typescript
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `<p>Resolved Data: {{ data }}</p>`
})
export class HomeComponent {
  data: string;

  constructor(route: ActivatedRoute) {
    this.data = route.snapshot.data['data'];
  }
}
```

### Global TTL Configuration

Set a default TTL at the application level in `app.config.ts`, which is used unless overridden by a route-specific TTL.

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { GLOBAL_TTL_TOKEN } from '@ravimallya/ng-lazy-cache';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: GLOBAL_TTL_TOKEN, useValue: 30000 } // Global TTL of 30 seconds
  ]
};
```

### Route-Level TTL Override

Override the global TTL for specific routes by specifying a `ttl` in the resolver options.

```typescript
export const routes: Routes = [
  {
    path: 'cached-route',
    component: HomeComponent,
    resolve: {
      data: LazyCache(fetchData, { key: 'demo-key', ttl: 5000 }) // 5-second TTL overrides global
    }
  }
];
```

### Real-World Example with HTTP

Use with `HttpClient` to cache API responses:

```typescript
import { Routes } from '@angular/router';
import { ProductComponent } from './product/product.component';
import { LazyCache } from '@ravimallya/ng-lazy-cache';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { inject } from '@angular/core';

const fetchProduct = (http: HttpClient, id: string) => () =>
  http.get(`https://jsonplaceholder.typicode.com/posts/${id}`).pipe(
    map(response => response.title),
    catchError(() => of('Fallback Data'))
  );

export const routes: Routes = [
  {
    path: 'product/:id',
    component: ProductComponent,
    resolve: {
      product: LazyCache((route) => fetchProduct(inject(HttpClient), route.params['id']), {
        key: (route) => `product-${route.params['id']}`, // Dynamic key
        ttl: 60000 // 1-minute TTL
      })
    }
  }
];
```

In `ProductComponent`:

```typescript
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
  standalone: true,
  template: `<p>Product Title: {{ product }}</p>`
})
export class ProductComponent {
  product: string;

  constructor(route: ActivatedRoute) {
    this.product = route.snapshot.data['product'];
  }
}
```

### API Documentation

- **`LazyCache(fetchFn: () => Observable<any>, options: LazyCacheOptions): ResolveFn<any>`**
  - **Parameters**:
    - `fetchFn`: A function returning an `Observable` that fetches the data.
    - `options`: An object with:
      - `key`: A string or function `(route: any) => string` to generate a unique cache key.
      - `ttl?`: Optional number (in milliseconds) for route-specific TTL (overrides global TTL).
  - **Returns**: A `ResolveFn` compatible with Angular’s router.

- **`GLOBAL_TTL_TOKEN`**
  - An injection token to provide a global TTL (default: 30 seconds) via `app.config.ts`.

## Development

### Building the Library

```bash
ng build ng-lazy-cache --configuration production
```

### Running Tests

```bash
npx ng test ng-lazy-cache --browsers=ChromeHeadless
```

### Demo Application

A demo app is included in the `projects/demo-app` directory. Serve it to test the library:

```bash
ng serve demo-app
```

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Built with ❤️ using Angular and RxJS.
- Inspired by the need for efficient route data caching in large-scale applications.