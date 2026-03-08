import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, Categoria } from '../models/product.model';
import { environment } from '../../environments/environment';

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private apiUrl = `${environment.apiUrl}/shop`;

  constructor(private http: HttpClient) { }

  obtenerProductos(categoriaId?: number, busqueda?: string, precioMin?: number, precioMax?: number, page: number = 1, pageSize: number = 20): Observable<PaginatedResponse<Producto>> {
    let params = new HttpParams();
    
    if (categoriaId) params = params.set('categoryId', categoriaId.toString());
    if (busqueda) params = params.set('search', busqueda);
    if (precioMin) params = params.set('minPrice', precioMin.toString());
    if (precioMax) params = params.set('maxPrice', precioMax.toString());
    params = params.set('page', page.toString());
    params = params.set('pageSize', pageSize.toString());
    
    return this.http.get<PaginatedResponse<Producto>>(`${this.apiUrl}/products`, { params });
  }

  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/products/${id}`);
  }

  obtenerProductosDestacados(limite: number = 8): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/products/featured?limit=${limite}`);
  }

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categories`);
  }

  enviarContacto(contacto: { name: string; email: string; phone: string; message: string }): Observable<any> {
    const payload = {
      nombre: contacto.name,
      correo: contacto.email,
      telefono: contacto.phone,
      mensaje: contacto.message
    };
    return this.http.post(`${this.apiUrl}/contact`, payload);
  }
}
