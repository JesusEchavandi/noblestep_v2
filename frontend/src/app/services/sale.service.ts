import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale, CreateSale } from '../models/sale.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private readonly API_URL = `${environment.apiUrl}/sales`;
  private http = inject(HttpClient);

  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.API_URL);
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
