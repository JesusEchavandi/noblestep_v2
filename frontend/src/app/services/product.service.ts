import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, CreateProduct, UpdateProduct, ProductVariant, CreateVariant, UpdateVariantStock } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/products`;
  private http = inject(HttpClient);

  // ── Productos ─────────────────────────────────────────────────────────
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API_URL);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }

  createProduct(product: CreateProduct): Observable<Product> {
    return this.http.post<Product>(this.API_URL, product);
  }

  updateProduct(id: number, product: UpdateProduct): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // ── Variantes (tallas) ────────────────────────────────────────────────
  getVariants(productId: number): Observable<ProductVariant[]> {
    return this.http.get<ProductVariant[]>(`${this.API_URL}/${productId}/variants`);
  }

  /** Alias usado por ProductListComponent */
  addVariant(productId: number, variant: CreateVariant): Observable<ProductVariant> {
    return this.http.post<ProductVariant>(`${this.API_URL}/${productId}/variants`, variant);
  }

  /** Alias usado por ProductListComponent — agrega rango de tallas en un solo request */
  addVariantsBulk(productId: number, variants: CreateVariant[]): Observable<ProductVariant[]> {
    return this.http.post<ProductVariant[]>(`${this.API_URL}/${productId}/variants/bulk`, variants);
  }

  /** Actualiza solo el stock de una variante. stock es un número directo */
  updateVariantStock(productId: number, variantId: number, stock: number): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${productId}/variants/${variantId}/stock`, { stock });
  }

  deleteVariant(productId: number, variantId: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/${productId}/variants/${variantId}`);
  }
}
