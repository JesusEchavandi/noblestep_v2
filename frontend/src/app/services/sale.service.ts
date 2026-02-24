import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Sale, CreateSale } from '../models/sale.model';
import { environment } from '../../environments/environment';
import { PagedResult } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private readonly API_URL = `${environment.apiUrl}/sales`;
  private http = inject(HttpClient);

  /** Devuelve todas las ventas (pageSize=100 para compatibilidad con componentes existentes) */
  getSales(): Observable<Sale[]> {
    return this.http.get<PagedResult<Sale>>(`${this.API_URL}?page=1&pageSize=100`)
      .pipe(map(res => res.data));
  }

  /** Versión paginada */
  getSalesPaged(page = 1, pageSize = 50): Observable<PagedResult<Sale>> {
    return this.http.get<PagedResult<Sale>>(`${this.API_URL}?page=${page}&pageSize=${pageSize}`);
  }

  getSale(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.API_URL}/${id}`);
  }

  createSale(sale: CreateSale): Observable<Sale> {
    return this.http.post<Sale>(this.API_URL, sale);
  }

  getSalesByDate(startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.API_URL}/reports/by-date`;
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get<any>(url);
  }

  getBestSellingProducts(limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/reports/best-selling?limit=${limit}`);
  }

  getTotalSales(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/reports/total`);
  }
}
