import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MetricasPanel {
  totalVentas: number;
  cantidadTotalVentas: number;
  ventasHoy: number;
  cantidadVentasHoy: number;
  ventasMes: number;
  cantidadVentasMes: number;
  totalProductos: number;
  productosActivos: number;
  productosBajoStock: number;
  totalClientes: number;
  totalProveedores: number;
  totalCompras: number;
  cantidadTotalCompras: number;
  montoPromedioVenta: number;
}

export interface VentasDiarias {
  fecha: string;
  total: number;
  cantidad: number;
}

export interface VentasMensuales {
  anio: number;
  mes: number;
  nombreMes: string;
  total: number;
  cantidad: number;
}

export interface DatosGraficoVentas {
  ultimos7Dias: VentasDiarias[];
  ultimos6Meses: VentasMensuales[];
}

export interface ProductoTop {
  productoId: number;
  nombreProducto: string;
  marca: string;
  cantidadTotalVendida: number;
  ingresosTotales: number;
}

export interface ProductoBajoStock {
  id: number;
  nombre: string;
  marca: string;
  talla: string;
  stock: number;
  precio: number;
}

export interface VentaReciente {
  id: number;
  fechaVenta: string;
  nombreCliente: string;
  total: number;
  estado: string;
  cantidadItems: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  obtenerMetricas(): Observable<MetricasPanel> {
    return this.http.get<MetricasPanel>(`${this.apiUrl}/metrics`);
  }

  obtenerDatosGraficoVentas(): Observable<DatosGraficoVentas> {
    return this.http.get<DatosGraficoVentas>(`${this.apiUrl}/sales-chart`);
  }

  obtenerProductosTop(limite: number = 5): Observable<ProductoTop[]> {
    return this.http.get<ProductoTop[]>(`${this.apiUrl}/top-products?limit=${limite}`);
  }

  obtenerProductosBajoStock(umbral: number = 10): Observable<ProductoBajoStock[]> {
    return this.http.get<ProductoBajoStock[]>(`${this.apiUrl}/low-stock?threshold=${umbral}`);
  }

  obtenerVentasRecientes(limite: number = 10): Observable<VentaReciente[]> {
    return this.http.get<VentaReciente[]>(`${this.apiUrl}/recent-sales?limit=${limite}`);
  }
}
