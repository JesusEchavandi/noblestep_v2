import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Venta, CrearVenta } from '../models/sale.model';
import { environment } from '../../environments/environment';
import { ResultadoPaginado } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private readonly API_URL = `${environment.apiUrl}/sales`;
  private http = inject(HttpClient);

  /** Devuelve todas las ventas (pageSize=100 para compatibilidad con componentes existentes) */
  obtenerVentas(): Observable<Venta[]> {
    return this.http.get<ResultadoPaginado<Venta>>(`${this.API_URL}?page=1&pageSize=100`)
      .pipe(map(res => res.datos));
  }

  /** Versión paginada */
  obtenerVentasPaginadas(pagina = 1, tamanoPagina = 50): Observable<ResultadoPaginado<Venta>> {
    return this.http.get<ResultadoPaginado<Venta>>(`${this.API_URL}?page=${pagina}&pageSize=${tamanoPagina}`);
  }

  obtenerVenta(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.API_URL}/${id}`);
  }

  crearVenta(venta: CrearVenta): Observable<Venta> {
    return this.http.post<Venta>(this.API_URL, venta);
  }

  obtenerBoletaVenta(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/receipt`, { responseType: 'blob' });
  }

  descargarBoletaVenta(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/receipt?download=true`, { responseType: 'blob' });
  }

  obtenerVentasPorFecha(fechaInicio?: string, fechaFin?: string): Observable<any> {
    let url = `${this.API_URL}/reports/by-date`;
    const params = [];
    if (fechaInicio) params.push(`startDate=${fechaInicio}`);
    if (fechaFin) params.push(`endDate=${fechaFin}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get<any>(url);
  }

  obtenerProductosMasVendidos(limite: number = 10): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/reports/best-selling?limit=${limite}`);
  }

  obtenerTotalVentas(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/reports/total`);
  }
}
