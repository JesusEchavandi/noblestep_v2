export interface Venta {
  id: number;
  clienteId: number;
  nombreCliente: string;
  fechaVenta: Date;
  total: number;
  estado: string;
  metodoPago: string;
  estadoPago?: string;
  idTransaccion?: string;
  detalles: DetalleVenta[];
}

export interface DetalleVenta {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CrearVenta {
  clienteId: number;
  metodoPago: string;
  idTransaccion?: string;
  detalles: CrearDetalleVenta[];
}

export interface CrearDetalleVenta {
  productoId: number;
  cantidad: number;
}
