import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LazyLoadImageDirective } from '../../directives/lazy-load-image.directive';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card-enhanced',
  standalone: true,
  imports: [CommonModule, RouterModule, LazyLoadImageDirective],
  template: `
    <div class="product-card-enhanced">
      <!-- Imagen del producto -->
      <div class="product-image-wrapper">
        <div class="product-image">
          <img 
            *ngIf="product.imageUrl" 
            [src]="product.imageUrl" 
            [alt]="product.name"
            class="product-img"
            appLazyLoad
            loading="lazy">
          <div *ngIf="!product.imageUrl" class="image-placeholder">
            <span class="placeholder-icon">📦</span>
          </div>
          
          <!-- Overlay gradient -->
          <div class="image-overlay"></div>
          
          <!-- Badge de categoría -->
          <span class="category-badge glass">{{ product.categoryName }}</span>
          
          <!-- Badges de estado -->
          <div class="status-badges">
            <span *ngIf="isNew()" class="badge badge-new shine">✨ NUEVO</span>
            <span *ngIf="isLowStock()" class="badge badge-low-stock">
              ⚠️ ¡Solo {{ product.stock }}!
            </span>
            <span *ngIf="product.stock === 0" class="badge badge-out-of-stock">
              Sin Stock
            </span>
          </div>
          
          <!-- Botones de acción rápida -->
          <div class="quick-actions">
            <button 
              class="quick-action-btn glass" 
              (click)="onQuickView()"
              title="Vista rápida">
              <span class="icon">👁️</span>
            </button>
            <button 
              class="quick-action-btn glass wishlist-btn" 
              [class.active]="isWishlisted"
              (click)="toggleWishlist()"
              title="Agregar a favoritos">
              <span class="icon">{{ isWishlisted ? '❤️' : '🤍' }}</span>
            </button>
            <button 
              *ngIf="product.stock > 0"
              class="quick-action-btn glass" 
              (click)="onAddToCart()"
              title="Agregar al carrito">
              <span class="icon">🛒</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Información del producto -->
      <div class="product-info">
        <a [routerLink]="['/product', product.id]" class="product-link">
          <h3 class="product-name">{{ product.name }}</h3>
        </a>
        
        <p class="product-code">SKU: {{ product.code }}</p>
        <p class="product-description">{{ product.description }}</p>
        
        <!-- Rating (placeholder) -->
        <div class="product-rating">
          <span class="stars">⭐⭐⭐⭐⭐</span>
          <span class="rating-count">(42)</span>
        </div>
        
        <!-- Precio y acciones -->
        <div class="product-footer">
          <div class="price-section">
            <div class="price-wrapper">
              <span class="price-label">Precio:</span>
              <span class="price">{{ formatPrice(product.salePrice) }}</span>
            </div>
            <div class="stock-wrapper" [ngClass]="getStockClass()">
              <span class="stock-icon">📦</span>
              <span class="stock-text">{{ getStockText() }}</span>
            </div>
          </div>
          
          <div class="product-actions">
            <a 
              [routerLink]="['/product', product.id]" 
              class="btn btn-secondary btn-sm">
              Ver Detalles
            </a>
            <button 
              (click)="onAddToCart()" 
              class="btn btn-primary btn-sm"
              [disabled]="product.stock === 0">
              <span *ngIf="product.stock > 0">🛒 Agregar</span>
              <span *ngIf="product.stock === 0">Agotado</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Indicador de agregado al carrito -->
      <div *ngIf="showAddedToCart" class="added-indicator">
        ✓ Agregado al carrito
      </div>
    </div>
  `,
  styles: [`
    .product-card-enhanced {
      background: var(--color-white);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      transition: all var(--transition-base);
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      animation: fadeInUp 0.6s ease-out;
    }

    .product-card-enhanced:hover {
      transform: translateY(-10px);
      box-shadow: 
        0 20px 40px rgba(232, 74, 95, 0.15),
        0 10px 20px rgba(42, 54, 59, 0.1),
        0 0 0 3px var(--color-cream);
    }

    .product-image-wrapper {
      position: relative;
      overflow: hidden;
    }

    .product-image {
      position: relative;
      height: 280px;
      background: linear-gradient(135deg, var(--color-cream) 0%, var(--color-success) 100%);
      overflow: hidden;
    }

    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .product-card-enhanced:hover .product-img {
      transform: scale(1.1) rotate(2deg);
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        180deg,
        transparent 0%,
        rgba(42, 54, 59, 0.3) 100%
      );
      opacity: 0;
      transition: opacity var(--transition-base);
    }

    .product-card-enhanced:hover .image-overlay {
      opacity: 1;
    }

    .status-badges {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 10;
    }

    .badge {
      padding: 0.4rem 0.8rem;
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: var(--shadow-md);
      backdrop-filter: blur(10px);
    }

    .badge-new {
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: var(--color-dark);
    }

    .badge-low-stock {
      background: rgba(255, 132, 124, 0.95);
      color: var(--color-white);
      animation: pulse 2s infinite;
    }

    .badge-out-of-stock {
      background: rgba(42, 54, 59, 0.95);
      color: var(--color-white);
    }

    .product-info {
      padding: 1.5rem;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .product-link {
      text-decoration: none;
      color: inherit;
    }

    .product-name {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--color-dark);
      margin-bottom: 0.5rem;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color var(--transition-fast);
    }

    .product-link:hover .product-name {
      color: var(--color-primary);
    }

    .product-code {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-bottom: 0.5rem;
      font-family: 'Courier New', monospace;
    }

    .product-description {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .stars {
      font-size: 0.875rem;
      letter-spacing: 2px;
    }

    .rating-count {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .product-footer {
      margin-top: auto;
    }

    .price-section {
      margin-bottom: 1rem;
      padding-top: 1rem;
      border-top: 2px solid var(--color-gray-50);
    }

    .price-wrapper {
      margin-bottom: 0.5rem;
    }

    .price-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      display: block;
      margin-bottom: 0.25rem;
    }

    .price {
      font-size: var(--font-size-3xl);
      font-weight: 800;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: block;
    }

    .stock-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.8rem;
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 600;
    }

    .stock-wrapper.in-stock {
      background: var(--color-success-bg);
      color: var(--color-success);
      border: 1px solid var(--color-success-border);
    }

    .stock-wrapper.low-stock {
      background: var(--color-warning-bg);
      color: var(--color-secondary);
      border: 1px solid var(--color-warning-border);
    }

    .stock-wrapper.out-of-stock {
      background: var(--color-error-bg);
      color: var(--color-primary);
      border: 1px solid var(--color-error-border);
    }

    .quick-action-btn.wishlist-btn.active {
      background: var(--color-primary);
      color: var(--color-white);
      transform: scale(1.1);
    }

    .added-indicator {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-success);
      color: var(--color-white);
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-full);
      font-weight: 600;
      box-shadow: var(--shadow-lg);
      animation: slideUp 0.5s ease-out;
      z-index: 100;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
  `]
})
export class ProductCardEnhancedComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();
  
  isWishlisted = false;
  showAddedToCart = false;

  formatPrice(price: number): string {
    return `S/ ${price.toFixed(2)}`;
  }

  isNew(): boolean {
    if (!this.product.createdAt) return false;
    const createdAt = new Date(this.product.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }

  isLowStock(): boolean {
    return this.product.stock > 0 && this.product.stock < 5;
  }

  getStockClass(): string {
    if (this.product.stock === 0) return 'out-of-stock';
    if (this.product.stock < 5) return 'low-stock';
    return 'in-stock';
  }

  getStockText(): string {
    if (this.product.stock === 0) return 'Sin stock';
    if (this.product.stock < 5) return `Solo ${this.product.stock} disponibles`;
    return `${this.product.stock} disponibles`;
  }

  toggleWishlist() {
    this.isWishlisted = !this.isWishlisted;
    // Aquí conectarías con un servicio de wishlist
  }

  onAddToCart() {
    if (this.product.stock > 0) {
      this.addToCart.emit(this.product);
      this.showAddedIndicator();
    }
  }

  onQuickView() {
    this.quickView.emit(this.product);
  }

  private showAddedIndicator() {
    this.showAddedToCart = true;
    setTimeout(() => {
      this.showAddedToCart = false;
    }, 2000);
  }
}
