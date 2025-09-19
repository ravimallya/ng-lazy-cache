import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'https://fakestoreapi.com';
  private http = inject(HttpClient);

  getProducts(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/products`).pipe(
      map((response: string[]) => response), 
      catchError(() => of(['Fallback Product']))
    );
  }

  getProductById(id: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/products/${id}`).pipe(
      map((response: any) => response),
      catchError(() => of('Fallback Single Product'))
    );
  }
}