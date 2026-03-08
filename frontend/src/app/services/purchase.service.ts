import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compra, CrearCompra } from '../models/purchase.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/purchases`;

  obtenerCompras(): Observable<Compra[]> {
    return this.http.get<Compra[]>(this.apiUrl);
  }

  obtenerCompra(id: number): Observable<Compra> {
    return this.http.get<Compra>(`${this.apiUrl}/${id}`);
  }

  crearCompra(compra: CrearCompra): Observable<Compra> {
    return this.http.post<Compra>(this.apiUrl, compra);
  }

  obtenerResumenCompras(): Observable<{ totalPurchases: number; totalCount: number }> {
    return this.http.get<{ totalPurchases: number; totalCount: number }>(`${this.apiUrl}/summary`);
  }

  obtenerComprasPorFecha(fechaInicio: string, fechaFin: string): Observable<{ purchases: Compra[]; totalPurchases: number }> {
    return this.http.get<{ purchases: Compra[]; totalPurchases: number }>(`${this.apiUrl}/bydaterange?startDate=${fechaInicio}&endDate=${fechaFin}`);
  }
}
