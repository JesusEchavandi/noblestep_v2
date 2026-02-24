import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product, CartItem, ProductSize } from '../models/product.model';

export { CartItem };

/** Estructura mínima persistida en localStorage — no incluye datos de producto */
interface LeanCartItem {
  productId: number;
  variantId?: number;
  quantity: number;
  selectedSize?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  cart$ = this.cartSubject.asObservable();

  constructor() {
    // Cart starts empty; call rehydrateCart(products) after loading products from backend
    this.loadLeanCart();
  }

  /** Persiste solo IDs y cantidades — nunca precios ni datos de producto */
  private saveLeanCart(): void {
    const lean: LeanCartItem[] = this.cartItems.map(item => ({
      productId: item.product.id,
      variantId: item.variantId,
      quantity: item.quantity,
      selectedSize: item.selectedSize
    }));
    localStorage.setItem('cart', JSON.stringify(lean));
    this.cartSubject.next([...this.cartItems]);
  }

  /**
   * Carga el carrito lean desde localStorage.
   * Los CartItem sin producto completo NO se emiten hasta rehidratación.
   */
  private loadLeanCart(): void {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const lean: LeanCartItem[] = JSON.parse(saved);
        // Validar estructura básica
        if (Array.isArray(lean)) {
          this.cartItems = lean
            .filter(i => i && typeof i.productId === 'number' && typeof i.quantity === 'number')
            .map(i => ({
              product: { id: i.productId } as Product, // placeholder hasta rehidratación
              variantId: i.variantId,
              quantity: i.quantity,
              selectedSize: i.selectedSize
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
  rehydrateCart(availableProducts: Product[]): void {
    const productMap = new Map(availableProducts.map(p => [p.id, p]));
    this.cartItems = this.cartItems
      .map(item => {
        const product = productMap.get(item.product.id);
        if (!product) return null;
        return { ...item, product };
      })
      .filter((item): item is CartItem => item !== null);
    this.cartSubject.next([...this.cartItems]);
  }

  addToCart(
    product: Product,
    quantity: number = 1,
    variant?: ProductSize
  ): { success: boolean; message: string } {
    const hasVariants = product.sizes && product.sizes.length > 0;
    if (hasVariants && !variant) {
      return { success: false, message: 'Debes seleccionar una talla' };
    }
    const stockAvailable = variant ? variant.stock : product.stock;
    if (stockAvailable <= 0) {
      return { success: false, message: 'No hay stock disponible para esta talla' };
    }
    const existingItem = this.cartItems.find(item =>
      item.product.id === product.id &&
      (variant ? item.variantId === variant.variantId : !item.variantId)
    );
    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > stockAvailable) {
        return { success: false, message: `Solo hay ${stockAvailable} unidades disponibles en talla ${variant?.size ?? ''}` };
      }
      existingItem.quantity = newQty;
    } else {
      if (quantity > stockAvailable) {
        return { success: false, message: `Solo hay ${stockAvailable} unidades disponibles` };
      }
      this.cartItems.push({
        product,
        quantity,
        variantId: variant?.variantId,
        selectedSize: variant?.size ?? product.size
      });
    }
    this.saveLeanCart();
    return { success: true, message: 'Producto agregado al carrito' };
  }

  removeFromCart(productId: number, variantId?: number): void {
    this.cartItems = this.cartItems.filter(item =>
      !(item.product.id === productId &&
        (variantId ? item.variantId === variantId : !item.variantId))
    );
    this.saveLeanCart();
  }

  updateQuantity(productId: number, quantity: number, variantId?: number): void {
    const item = this.cartItems.find(item =>
      item.product.id === productId &&
      (variantId ? item.variantId === variantId : !item.variantId)
    );
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId, variantId);
      } else {
        item.quantity = quantity;
        this.saveLeanCart();
      }
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveLeanCart();
  }

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  getItemCount(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getLeanItemCount(): number {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const lean: LeanCartItem[] = JSON.parse(saved);
        if (Array.isArray(lean)) {
          return lean.reduce((sum, i) => sum + (i.quantity || 0), 0);
        }
      }
    } catch { /* ignore */ }
    return 0;
  }

  getTotal(): number {
    return this.cartItems.reduce(
      (total, item) => total + ((item.product.salePrice || item.product.price) * item.quantity),
      0
    );
  }
}
