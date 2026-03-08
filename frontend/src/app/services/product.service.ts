import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto, CrearProducto, ActualizarProducto, VarianteProducto, CrearVariante, ActualizarStockVariante } from '../models/product.model';
import { environment } from '../../environments/environment';

export interface ResultadoPaginado<T> {
  datos: T[];
  pagina: number;
  tamanoPagina: number;
  total: number;
  totalPaginas: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/products`;
  private http = inject(HttpClient);

  // ── Productos ─────────────────────────────────────────────────────────
  /** Devuelve todos los productos (pageSize=200 para compatibilidad con componentes existentes) */
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<ResultadoPaginado<Producto>>(`${this.API_URL}?page=1&pageSize=200`)
      .pipe(map(res => res.datos));
  }

  /** Versión paginada — usar cuando se necesite paginación real en la UI */
  obtenerProductosPaginados(pagina = 1, tamanoPagina = 50): Observable<ResultadoPaginado<Producto>> {
    return this.http.get<ResultadoPaginado<Producto>>(`${this.API_URL}?page=${pagina}&pageSize=${tamanoPagina}`);
  }

  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.API_URL}/${id}`);
  }

  crearProducto(producto: CrearProducto): Observable<Producto> {
    return this.http.post<Producto>(this.API_URL, producto);
  }

  actualizarProducto(id: number, producto: ActualizarProducto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // ── Variantes (tallas) ────────────────────────────────────────────────
  obtenerVariantes(productoId: number): Observable<VarianteProducto[]> {
    return this.http.get<VarianteProducto[]>(`${this.API_URL}/${productoId}/variants`);
  }

  /** Alias usado por ProductListComponent */
  agregarVariante(productoId: number, variante: CrearVariante): Observable<VarianteProducto> {
    return this.http.post<VarianteProducto>(`${this.API_URL}/${productoId}/variants`, variante);
  }

  /** Alias usado por ProductListComponent — agrega rango de tallas en un solo request */
  agregarVariantesMasivo(productoId: number, variantes: CrearVariante[]): Observable<VarianteProducto[]> {
    return this.http.post<VarianteProducto[]>(`${this.API_URL}/${productoId}/variants/bulk`, variantes);
  }

  /** Actualiza solo el stock de una variante. stock es un número directo */
  actualizarStockVariante(productoId: number, varianteId: number, stock: number): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${productoId}/variants/${varianteId}/stock`, { stock });
  }

  eliminarVariante(productoId: number, varianteId: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/${productoId}/variants/${varianteId}`);
  }
}
