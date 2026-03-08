import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Reportes de Ventas
export interface ReporteVentas {
  fechaInicio: string;
  fechaFin: string;
  items: ItemReporteVentas[];
  totalVentas: number;
  totalTransacciones: number;
  ticketPromedio: number;
}

export interface ItemReporteVentas {
  ventaId: number;
  fechaVenta: string;
  nombreCliente: string;
  documentoCliente: string;
  total: number;
  cantidadItems: number;
  estado: string;
  nombreUsuario: string;
}

export interface VentasPorProducto {
  productoId: number;
  nombreProducto: string;
  marca: string;
  nombreCategoria: string;
  cantidadTotalVendida: number;
  ingresosTotales: number;
  precioPromedio: number;
}

export interface VentasPorCliente {
  clienteId: number;
  nombreCliente: string;
  numeroDocumento: string;
  totalCompras: number;
  totalGastado: number;
  ticketPromedio: number;
  ultimaFechaCompra: string;
}

// Reportes de Compras
export interface ReporteCompras {
  fechaInicio: string;
  fechaFin: string;
  items: ItemReporteCompras[];
  totalCompras: number;
  totalTransacciones: number;
}

export interface ItemReporteCompras {
  compraId: number;
  fechaCompra: string;
  nombreProveedor: string;
  documentoProveedor: string;
  total: number;
  cantidadItems: number;
  estado: string;
}

export interface ComprasPorProveedor {
  proveedorId: number;
  nombreProveedor: string;
  numeroDocumento: string;
  totalCompras: number;
  totalGastado: number;
  ultimaFechaCompra: string;
}

// Reportes de Inventario
export interface ReporteInventario {
  productoId: number;
  nombreProducto: string;
  marca: string;
  talla: string;
  nombreCategoria: string;
  stockActual: number;
  precioUnitario: number;
  valorTotal: number;
  totalVendido: number;
  tasaRotacion: number;
}

export interface ValuacionInventario {
  valorTotal: number;
  totalUnidades: number;
  totalProductos: number;
  porCategoria: ValuacionCategoria[];
}

export interface ValuacionCategoria {
  categoria: string;
  valorTotal: number;
  totalUnidades: number;
  productos: number;
}

// Reporte de Ganancia/Pérdida
export interface ReporteGananciaPerdida {
  fechaInicio: string;
  fechaFin: string;
  totalVentas: number;
  totalCompras: number;
  gananciaBruta: number;
  margenGanancia: number;
  productosVendidos: number;
  productosComprados: number;
}

// Reporte de Productos Top
export interface ReporteProductosTop {
  fechaInicio: string;
  fechaFin: string;
  topPorIngresos: ProductoTop[];
  topPorCantidad: ProductoTop[];
}

export interface ProductoTop {
  productoId: number;
  nombreProducto: string;
  marca: string;
  nombreCategoria: string;
  cantidadVendida: number;
  ingresos: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  // Reportes de Ventas
  obtenerReporteVentas(fechaInicio?: string, fechaFin?: string): Observable<ReporteVentas> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('startDate', fechaInicio);
    if (fechaFin) params = params.set('endDate', fechaFin);
    return this.http.get<ReporteVentas>(`${this.apiUrl}/sales`, { params });
  }

  obtenerVentasPorProducto(fechaInicio?: string, fechaFin?: string, categoriaId?: number): Observable<VentasPorProducto[]> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('startDate', fechaInicio);
    if (fechaFin) params = params.set('endDate', fechaFin);
    if (categoriaId !== null && categoriaId !== undefined && !isNaN(categoriaId)) {
      params = params.set('categoryId', categoriaId.toString());
    }
    return this.http.get<VentasPorProducto[]>(`${this.apiUrl}/sales-by-product`, { params });
  }

  obtenerVentasPorCliente(fechaInicio?: string, fechaFin?: string): Observable<VentasPorCliente[]> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('startDate', fechaInicio);
    if (fechaFin) params = params.set('endDate', fechaFin);
    return this.http.get<VentasPorCliente[]>(`${this.apiUrl}/sales-by-customer`, { params });
  }

  // Reportes de Compras
  obtenerReporteCompras(fechaInicio?: string, fechaFin?: string): Observable<ReporteCompras> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('startDate', fechaInicio);
    if (fechaFin) params = params.set('endDate', fechaFin);
    return this.http.get<ReporteCompras>(`${this.apiUrl}/purchases`, { params });
  }

  obtenerComprasPorProveedor(fechaInicio?: string, fechaFin?: string): Observable<ComprasPorProveedor[]> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('startDate', fechaInicio);
    if (fechaFin) params = params.set('endDate', fechaFin);
    return this.http.get<ComprasPorProveedor[]>(`${this.apiUrl}/purchases-by-supplier`, { params });
  }

  // Reportes de Inventario
  obtenerReporteInventario(categoriaId?: number): Observable<ReporteInventario[]> {
    let params = new HttpParams();
    if (categoriaId !== null && categoriaId !== undefined && !isNaN(categoriaId)) {
      params = params.set('categoryId', categoriaId.toString());
    }
    return this.http.get<ReporteInventario[]>(`${this.apiUrl}/inventory`, { params });
  }

  obtenerValuacionInventario(): Observable<ValuacionInventario> {
    return this.http.get<ValuacionInventario>(`${this.apiUrl}/inventory-valuation`);
  }

  // Reporte de Ganancia/Pérdida
  obtenerReporteGananciaPerdida(fechaInicio?: string, fechaFin?: string): Observable<ReporteGananciaPerdida> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('startDate', fechaInicio);
    if (fechaFin) params = params.set('endDate', fechaFin);
    return this.http.get<ReporteGananciaPerdida>(`${this.apiUrl}/profit-loss`, { params });
  }

  // Reporte de Productos Top
  obtenerReporteProductosTop(fechaInicio?: string, fechaFin?: string, limite: number = 10): Observable<ReporteProductosTop> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('startDate', fechaInicio);
    if (fechaFin) params = params.set('endDate', fechaFin);
    params = params.set('limit', limite.toString());
    return this.http.get<ReporteProductosTop>(`${this.apiUrl}/top-products`, { params });
  }

  // Exportar a CSV
  exportarACSV(datos: any[], nombreArchivo: string): void {
    if (datos.length === 0) return;

    const headers = Object.keys(datos[0]);
    const csv = [
      headers.join(','),
      ...datos.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${nombreArchivo}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
