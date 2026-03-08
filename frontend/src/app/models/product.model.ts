export interface VarianteProducto {
  id: number;
  productoId: number;
  nombreProducto: string;
  marca: string;
  talla: string;
  stock: number;
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  marca: string;
  categoriaId: number;
  nombreCategoria: string;
  talla: string;
  precio: number;
  precioVenta: number;
  stock: number;
  urlImagen?: string;
  descripcion?: string;
  activo: boolean;
  variantes?: VarianteProducto[];
}

export interface CrearProducto {
  nombre: string;
  marca: string;
  categoriaId: number;
  talla: string;
  precio: number;
  precioVenta: number;
  stock: number;
  urlImagen?: string;
  descripcion?: string;
}

export interface ActualizarProducto extends CrearProducto {
  activo: boolean;
}

export interface CrearVariante {
  talla: string;
  stock: number;
}

export interface ActualizarStockVariante {
  stock: number;
}
