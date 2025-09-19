import { ActivatedRoute, ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';
import { Home } from './home/home';
import { LazyCache } from '@ravimallya/ng-lazy-cache';
import { inject } from '@angular/core';
import { ApiService } from './services/api';
import { Product } from './product/product';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    {
      path: 'home',
      component: Home,
      resolve: {
        products: LazyCache(() => {
          console.log('Fetching products...');
          return inject(ApiService).getProducts();
        }, { key: 'products', ttl: 60000 }) // 10s TTL
      }
    },
    {
        path: 'product/:id',
        component: Product,
        resolve: {
          product: LazyCache((route: ActivatedRouteSnapshot) => {
            const id = route.paramMap.get('id')!;
            console.log(`Fetching product ${id}...`);
            return inject(ApiService).getProductById(id);
          }, {
            key: (route: ActivatedRouteSnapshot) => `product-${route.paramMap.get('id')}`,
            ttl: 15000
          }) as ResolveFn<any>
        }
      }
];
