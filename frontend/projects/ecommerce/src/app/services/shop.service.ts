import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private apiUrl = `${environment.apiUrl}/shop`;

  constructor(private http: HttpClient) { }

  getProducts(categoryId?: number, search?: string, minPrice?: number, maxPrice?: number): Observable<Product[]> {
    let params = new HttpParams();
    
    if (categoryId) params = params.set('categoryId', categoryId.toString());
    if (search) params = params.set('search', search);
    if (minPrice) params = params.set('minPrice', minPrice.toString());
    if (maxPrice) params = params.set('maxPrice', maxPrice.toString());
    
    return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  getFeaturedProducts(limit: number = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/featured?limit=${limit}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  submitContact(contact: { name: string; email: string; phone: string; message: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact`, contact);
  }
}
