export interface TallaProducto {
  varianteId: number;
  talla: string;
  stock: number;
  disponible: boolean;
}

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  talla?: string;       // legacy — talla única si no hay variantes
  precio: number;
  precioVenta: number;
  stock: number;       // stock total sumado de variantes activas
  marca?: string;
  categoriaId: number;
  nombreCategoria: string;
  urlImagen?: string;
  creadoEn?: string | Date;
  tallas: TallaProducto[]; // variantes de talla con stock individual
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  cantidadProductos: number;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  varianteId?: number;  // ID de la variante (talla) seleccionada
  tallaSeleccionada?: string; // talla legible para mostrar en UI
}
