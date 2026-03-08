import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto, ItemCarrito, TallaProducto } from '../models/product.model';

export { ItemCarrito };

/** Estructura mínima persistida en localStorage — no incluye datos de producto */
interface ItemCarritoLean {
  productoId: number;
  varianteId?: number;
  cantidad: number;
  tallaSeleccionada?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsCarrito: ItemCarrito[] = [];
  private sujetoCarrito = new BehaviorSubject<ItemCarrito[]>([]);

  carrito$ = this.sujetoCarrito.asObservable();

  constructor() {
    this.cargarCarritoLean();
  }

  /** Persiste solo IDs y cantidades — nunca precios ni datos de producto */
  private guardarCarritoLean(): void {
    const lean: ItemCarritoLean[] = this.itemsCarrito.map(item => ({
      productoId: item.producto.id,
      varianteId: item.varianteId,
      cantidad: item.cantidad,
      tallaSeleccionada: item.tallaSeleccionada
    }));
    localStorage.setItem('cart', JSON.stringify(lean));
    this.sujetoCarrito.next([...this.itemsCarrito]);
  }

  /**
   * Carga el carrito lean desde localStorage.
   * Los ItemCarrito sin producto completo NO se emiten hasta rehidratación.
   */
  private cargarCarritoLean(): void {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const lean: ItemCarritoLean[] = JSON.parse(saved);
        if (Array.isArray(lean)) {
          this.itemsCarrito = lean
            .filter(i => i && typeof i.productoId === 'number' && typeof i.cantidad === 'number')
            .map(i => ({
              producto: { id: i.productoId } as Producto, // placeholder hasta rehidratación
              varianteId: i.varianteId,
              cantidad: i.cantidad,
              tallaSeleccionada: i.tallaSeleccionada
            }));
        }
      }
    } catch {
      localStorage.removeItem('cart');
    }
  }

  /**
   * Rehidrata el carrito con datos completos de productos del backend.
   * Llamar desde app.component o catalog después de obtener los productos.
   * Elimina del carrito productos que ya no existen o están inactivos.
   */
  rehidratarCarrito(productosDisponibles: Producto[]): void {
    const mapaProductos = new Map(productosDisponibles.map(p => [p.id, p]));
    this.itemsCarrito = this.itemsCarrito
      .map(item => {
        const producto = mapaProductos.get(item.producto.id);
        if (!producto) return null;
        return { ...item, producto };
      })
      .filter((item): item is ItemCarrito => item !== null);
    this.sujetoCarrito.next([...this.itemsCarrito]);
  }

  agregarAlCarrito(
    producto: Producto,
    cantidad: number = 1,
    variante?: TallaProducto
  ): { success: boolean; message: string } {
    const tieneVariantes = producto.tallas && producto.tallas.length > 0;
    if (tieneVariantes && !variante) {
      return { success: false, message: 'Debes seleccionar una talla' };
    }
    const stockDisponible = variante ? variante.stock : producto.stock;
    if (stockDisponible <= 0) {
      return { success: false, message: 'No hay stock disponible para esta talla' };
    }
    const itemExistente = this.itemsCarrito.find(item =>
      item.producto.id === producto.id &&
      (variante ? item.varianteId === variante.varianteId : !item.varianteId)
    );
    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (nuevaCantidad > stockDisponible) {
        return { success: false, message: `Solo hay ${stockDisponible} unidades disponibles en talla ${variante?.talla ?? ''}` };
      }
      itemExistente.cantidad = nuevaCantidad;
    } else {
      if (cantidad > stockDisponible) {
        return { success: false, message: `Solo hay ${stockDisponible} unidades disponibles` };
      }
      this.itemsCarrito.push({
        producto,
        cantidad,
        varianteId: variante?.varianteId,
        tallaSeleccionada: variante?.talla ?? producto.talla
      });
    }
    this.guardarCarritoLean();
    return { success: true, message: 'Producto agregado al carrito' };
  }

  quitarDelCarrito(productoId: number, varianteId?: number): void {
    this.itemsCarrito = this.itemsCarrito.filter(item =>
      !(item.producto.id === productoId &&
        (varianteId ? item.varianteId === varianteId : !item.varianteId))
    );
    this.guardarCarritoLean();
  }

  actualizarCantidad(productoId: number, cantidad: number, varianteId?: number): void {
    const item = this.itemsCarrito.find(item =>
      item.producto.id === productoId &&
      (varianteId ? item.varianteId === varianteId : !item.varianteId)
    );
    if (item) {
      if (cantidad <= 0) {
        this.quitarDelCarrito(productoId, varianteId);
      } else {
        item.cantidad = cantidad;
        this.guardarCarritoLean();
      }
    }
  }

  vaciarCarrito(): void {
    this.itemsCarrito = [];
    this.guardarCarritoLean();
  }

  obtenerItemsCarrito(): ItemCarrito[] {
    return [...this.itemsCarrito];
  }

  obtenerCantidadItems(): number {
    return this.itemsCarrito.reduce((total, item) => total + item.cantidad, 0);
  }

  obtenerCantidadItemsLean(): number {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const lean: ItemCarritoLean[] = JSON.parse(saved);
        if (Array.isArray(lean)) {
          return lean.reduce((sum, i) => sum + (i.cantidad || 0), 0);
        }
      }
    } catch { /* ignore */ }
    return 0;
  }

  obtenerTotal(): number {
    return this.itemsCarrito.reduce(
      (total, item) => total + ((item.producto.precioVenta || item.producto.precio) * item.cantidad),
      0
    );
  }
}
