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
      data: LazyCache(fetchData, { key: 'demo-key', ttl: 5000 }) // 5-second TTL overrides global
    }
  },
  { path: '', redirectTo: '/cached-route', pathMatch: 'full' }
];