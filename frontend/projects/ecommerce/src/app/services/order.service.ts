import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ItemPedido {
  productoId: number;
  varianteId?: number;
  cantidad: number;
}

export interface DatosCrearPedido {
  nombreCompletoCliente: string;
  correoCliente: string;
  telefonoCliente: string;
  direccionCliente: string;
  ciudadCliente: string;
  distritoCliente: string;
  referenciaCliente?: string;
  documentoCliente?: string;
  metodoPago: string;
  detallePago?: string;
  comprobantePagoBase64?: string;
  tipoComprobante: string;
  nombreEmpresa?: string;
  rucEmpresa?: string;
  direccionEmpresa?: string;
  items: ItemPedido[];
}

export interface DetallePedido {
  id: number;
  productoId: number;
  nombreProducto: string;
  codigoProducto: string;
  tallaProducto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  numeroPedido: string;
  nombreCompletoCliente: string;
  correoCliente: string;
  telefonoCliente: string;
  direccionCliente: string;
  ciudadCliente: string;
  distritoCliente: string;
  referenciaCliente?: string;
  subtotal: number;
  costoEnvio: number;
  total: number;
  metodoPago: string;
  estadoPago: string;
  estadoPedido: string;
  urlComprobantePago?: string;
  notasAdmin?: string;
  tipoComprobante: string;
  nombreEmpresa?: string;
  rucEmpresa?: string;
  fechaPedido: Date;
  fechaEntregado?: Date;
  items: DetallePedido[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/ecommerce/orders`;

  constructor(private http: HttpClient) { }

  crearPedido(datosPedido: DatosCrearPedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, datosPedido);
  }

  obtenerMisPedidos(): Observable<Pedido[]> {
    return this.http.get<{ datos: Pedido[]; pagina: number; tamanoPagina: number; total: number; totalPaginas: number }>(`${this.apiUrl}/my-orders`).pipe(
      map(res => res.datos)
    );
  }

  obtenerPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }
}
