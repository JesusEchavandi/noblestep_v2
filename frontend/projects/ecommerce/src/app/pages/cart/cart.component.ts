import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ItemCarrito, Producto } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  itemsCarrito: ItemCarrito[] = [];

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarCarrito();
    this.cartService.carrito$.subscribe(() => {
      this.cargarCarrito();
    });
  }

  cargarCarrito() {
    this.itemsCarrito = this.cartService.obtenerItemsCarrito();
  }

  actualizarCantidad(productoId: number, cantidad: number, varianteId?: number) {
    if (cantidad > 0) {
      // Validar que no supere el stock disponible de la variante
      const item = this.itemsCarrito.find(i => i.producto.id === productoId && i.varianteId === varianteId);
      if (item) {
        const variante = item.varianteId
          ? item.producto.tallas?.find(s => s.varianteId === item.varianteId)
          : null;
        const maxStock = variante ? variante.stock : item.producto.stock;
        if (cantidad > maxStock) {
          cantidad = maxStock;
        }
      }
      this.cartService.actualizarCantidad(productoId, cantidad, varianteId);
    }
  }

  quitarItem(productoId: number, varianteId?: number) {
    if (confirm('¿Estás seguro de eliminar este producto del carrito?')) {
      this.cartService.quitarDelCarrito(productoId, varianteId);
    }
  }

  vaciarCarrito() {
    if (confirm('¿Estás seguro de vaciar todo el carrito?')) {
      this.cartService.vaciarCarrito();
    }
  }

  obtenerSubtotal(): number {
    return this.cartService.obtenerTotal();
  }

  obtenerTotal(): number {
    return this.obtenerSubtotal();
  }

  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }

  obtenerImagenProducto(producto: Producto): string {
    if (producto.urlImagen && producto.urlImagen.startsWith('http')) {
      return producto.urlImagen;
    }
    const nombre = (producto.nombre || '').toLowerCase();
    const cat  = (producto.nombreCategoria || '').toLowerCase();
    if (nombre.includes('sneaker') || nombre.includes('zapatilla') || nombre.includes('running'))
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&fit=crop';
    if (nombre.includes('formal') || nombre.includes('oxford') || nombre.includes('clásic'))
      return 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=80&fit=crop';
    if (nombre.includes('bota') || nombre.includes('boot'))
      return 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80&fit=crop';
    if (nombre.includes('sandalia') || nombre.includes('sandal'))
      return 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80&fit=crop';
    if (nombre.includes('casual') || nombre.includes('loafer'))
      return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80&fit=crop';
    if (nombre.includes('sport') || nombre.includes('gym'))
      return 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80&fit=crop';
    if (cat.includes('sneaker') || cat.includes('sport'))
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&fit=crop';
    if (cat.includes('formal'))
      return 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=80&fit=crop';
    if (cat.includes('casual'))
      return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80&fit=crop';
    const fallbacks = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80&fit=crop',
    ];
    return fallbacks[producto.id % fallbacks.length];
  }

  irAlCheckout() {
    // Redirigir a la página de checkout para completar el pago
    this.router.navigate(['/checkout']);
  }

  consultarStock() {
    // Generar mensaje de WhatsApp para consulta de stock
    const mensaje = this.generarMensajeConsultaStock();
    const telefono = '51999999999'; // Número de WhatsApp de la tienda (cambiar por el real)
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  generarMensajeConsultaStock(): string {
    let mensaje = '¡Hola! Me gustaría consultar la disponibilidad de los siguientes productos:\n\n';

    this.itemsCarrito.forEach((item, index) => {
      const talla = item.tallaSeleccionada ? ` — Talla ${item.tallaSeleccionada}` : '';
      mensaje += `${index + 1}. ${item.producto.nombre}${talla}\n`;
      mensaje += `   Cantidad deseada: ${item.cantidad}\n\n`;
    });

    mensaje += '¿Están disponibles para entrega inmediata?';
    return mensaje;
  }
}
