import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem, Product } from '../../models/product.model';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  
  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
    this.cartService.cart$.subscribe(() => {
      this.loadCart();
    });
  }

  loadCart() {
    this.cartItems = this.cartService.getCartItems();
  }

  updateQuantity(productId: number, quantity: number, variantId?: number) {
    if (quantity > 0) {
      // Validar que no supere el stock disponible de la variante
      const item = this.cartItems.find(i => i.product.id === productId && i.variantId === variantId);
      if (item) {
        const variant = item.variantId
          ? item.product.sizes?.find(s => s.variantId === item.variantId)
          : null;
        const maxStock = variant ? variant.stock : item.product.stock;
        if (quantity > maxStock) {
          quantity = maxStock;
        }
      }
      this.cartService.updateQuantity(productId, quantity, variantId);
    }
  }

  removeItem(productId: number, variantId?: number) {
    if (confirm('¿Estás seguro de eliminar este producto del carrito?')) {
      this.cartService.removeFromCart(productId, variantId);
    }
  }

  clearCart() {
    if (confirm('¿Estás seguro de vaciar todo el carrito?')) {
      this.cartService.clearCart();
    }
  }

  getSubtotal(): number {
    return this.cartService.getTotal();
  }

  getTotal(): number {
    return this.getSubtotal();
  }

  formatPrice(price: number): string {
    return `S/ ${price.toFixed(2)}`;
  }

  getProductImage(product: Product): string {
    if (product.imageUrl && product.imageUrl.startsWith('http')) {
      return product.imageUrl;
    }
    const name = (product.name || '').toLowerCase();
    const cat  = (product.categoryName || '').toLowerCase();
    if (name.includes('sneaker') || name.includes('zapatilla') || name.includes('running'))
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&fit=crop';
    if (name.includes('formal') || name.includes('oxford') || name.includes('clásic'))
      return 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=80&fit=crop';
    if (name.includes('bota') || name.includes('boot'))
      return 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80&fit=crop';
    if (name.includes('sandalia') || name.includes('sandal'))
      return 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80&fit=crop';
    if (name.includes('casual') || name.includes('loafer'))
      return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80&fit=crop';
    if (name.includes('sport') || name.includes('gym'))
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
    return fallbacks[product.id % fallbacks.length];
  }

  checkout() {
    // Redirigir a la página de checkout para completar el pago
    this.router.navigate(['/checkout']);
  }

  consultStock() {
    // Generar mensaje de WhatsApp para consulta de stock
    const message = this.generateStockConsultMessage();
    const phone = '51999999999'; // Número de WhatsApp de la tienda (cambiar por el real)
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  generateStockConsultMessage(): string {
    let message = '¡Hola! Me gustaría consultar la disponibilidad de los siguientes productos:\n\n';

    this.cartItems.forEach((item, index) => {
      const size = item.selectedSize ? ` — Talla ${item.selectedSize}` : '';
      message += `${index + 1}. ${item.product.name}${size}\n`;
      message += `   Cantidad deseada: ${item.quantity}\n\n`;
    });

    message += '¿Están disponibles para entrega inmediata?';
    return message;
  }
}
