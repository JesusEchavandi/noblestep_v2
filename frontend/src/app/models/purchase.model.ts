export interface Compra {
  id: number;
  proveedorId: number;
  nombreProveedor: string;
  fechaCompra: Date;
  numeroFactura: string;
  total: number;
  estado: string;
  notas: string;
  detalles: DetalleCompra[];
}

export interface DetalleCompra {
  id: number;
  productoId: number;
  nombreProducto: string;
  varianteId?: number;
  talla?: string;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
}

export interface CrearCompra {
  proveedorId: number;
  fechaCompra: Date;
  numeroFactura: string;
  notas: string;
  detalles: CrearDetalleCompra[];
}

export interface CrearDetalleCompra {
  productoId: number;
  varianteId?: number;
  cantidad: number;
  costoUnitario: number;
}
