import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/product.model';

@Component({
  selector: 'app-sticky-add-to-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (mostrarFijo) {
      <div class="sticky-cart" [@slideDown]>
        <div class="sticky-content">
          <div class="product-summary">
            <div class="product-image-mini">
              <span class="placeholder-icon">📦</span>
            </div>
            <div class="product-info">
              <h4 class="product-name">{{ producto?.nombre }}</h4>
              <p class="product-price">{{ formatearPrecio(producto?.precioVenta || 0) }}</p>
            </div>
          </div>
          
          <div class="actions">
            <div class="quantity-selector">
              <button class="qty-btn" (click)="disminuirCantidad()" [disabled]="cantidad <= 1">
                −
              </button>
              <span class="qty-display">{{ cantidad }}</span>
              <button class="qty-btn" (click)="aumentarCantidad()" [disabled]="cantidad >= (producto?.stock || 0)">
                +
              </button>
            </div>
            
            <button class="add-to-cart-btn" (click)="agregarAlCarrito()" [disabled]="!producto || producto.stock === 0">
              <span class="icon">🛒</span>
              <span>Agregar al Carrito</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .sticky-cart {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      background: var(--color-white);
      box-shadow: var(--shadow-xl);
      z-index: 998;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .sticky-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--spacing-md) var(--spacing-xl);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-lg);
    }

    .product-summary {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex: 1;
    }

    .product-image-mini {
      width: 50px;
      height: 50px;
      background: var(--color-background);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-xl);
      flex-shrink: 0;
    }

    .product-info {
      flex: 1;
      min-width: 0;
    }

    .product-name {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--color-dark);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .product-price {
      font-size: var(--font-size-lg);
      font-weight: bold;
      color: var(--color-success);
      margin: 0;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      background: var(--color-background);
      padding: var(--spacing-xs);
      border-radius: var(--radius-full);
    }

    .qty-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: var(--color-white);
      border-radius: var(--radius-full);
      cursor: pointer;
      font-size: var(--font-size-lg);
      font-weight: bold;
      transition: var(--transition-base);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qty-btn:hover:not(:disabled) {
      background: var(--color-primary);
      color: var(--color-white);
      transform: scale(1.1);
    }

    .qty-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .qty-display {
      min-width: 40px;
      text-align: center;
      font-weight: 600;
      font-size: var(--font-size-base);
    }

    .add-to-cart-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-xl);
      background: var(--color-primary);
      color: var(--color-white);
      border: none;
      border-radius: var(--radius-full);
      font-weight: 600;
      font-size: var(--font-size-base);
      cursor: pointer;
      transition: var(--transition-base);
      box-shadow: var(--shadow-md);
      white-space: nowrap;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      background: var(--color-secondary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .add-to-cart-btn:disabled {
      background: var(--color-gray-300);
      cursor: not-allowed;
    }

    .add-to-cart-btn .icon {
      font-size: var(--font-size-lg);
    }

    /* Laptop 1366px */
    @media (max-width: 1399px) {
      .sticky-content { padding: var(--spacing-sm) 1.25rem; }
      .product-name { font-size: var(--font-size-sm); }
      .product-price { font-size: var(--font-size-base); }
      .add-to-cart-btn { padding: var(--spacing-sm) var(--spacing-lg); font-size: var(--font-size-sm); }
    }

    /* QHD 2560x1440 */
    @media (min-width: 1920px) {
      .sticky-content { max-width: 1440px; margin: 0 auto; }
      .product-name { font-size: var(--font-size-lg); }
      .product-price { font-size: var(--font-size-xl); }
      .add-to-cart-btn { padding: var(--spacing-md) var(--spacing-2xl); font-size: var(--font-size-base); }
    }

    @media (max-width: 768px) {
      .sticky-cart {
        top: 60px;
      }

      .sticky-content {
        padding: var(--spacing-sm) var(--spacing-md);
        gap: var(--spacing-sm);
      }

      .product-name {
        font-size: var(--font-size-sm);
      }

      .product-price {
        font-size: var(--font-size-base);
      }

      .add-to-cart-btn span:not(.icon) {
        display: none;
      }

      .add-to-cart-btn {
        padding: var(--spacing-sm) var(--spacing-md);
      }
    }
  `]
})
export class StickyAddToCartComponent {
  @Input() producto: Producto | null = null;
  @Input() cantidad: number = 1;
  @Output() cambioCantidad = new EventEmitter<number>();
  @Output() clicAgregarAlCarrito = new EventEmitter<void>();

  mostrarFijo = false;
  private posicionBotonOriginal = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.posicionBotonOriginal) {
      const botonAgregar = document.querySelector('.product-actions');
      if (botonAgregar) {
        this.posicionBotonOriginal = botonAgregar.getBoundingClientRect().top + window.pageYOffset;
      }
    }

    this.mostrarFijo = window.pageYOffset > this.posicionBotonOriginal + 100;
  }

  aumentarCantidad() {
    if (this.producto && this.cantidad < this.producto.stock) {
      this.cantidad++;
      this.cambioCantidad.emit(this.cantidad);
    }
  }

  disminuirCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
      this.cambioCantidad.emit(this.cantidad);
    }
  }

  agregarAlCarrito() {
    this.clicAgregarAlCarrito.emit();
  }

  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }
}
