import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, SlicePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../../services/shop.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { MetaService } from '../../services/meta.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, SlicePipe],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  error = false;
  quantity = 1;
  selectedSize: string | null = null;
  selectedVariantId: number | null = null;
  relatedProducts: Product[] = [];

  // Galería
  galleryImages: string[] = [];
  activeImageIndex = 0;
  lightboxOpen = false;
  zoomActive = false;

  private readonly WSP_NUMBER = '51999999999'; // ← Reemplaza con tu número real

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private metaService: MetaService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.activeImageIndex = 0;
      this.lightboxOpen = false;
      this.quantity = 1;
      this.selectedSize = null;
      this.loadProduct(id);
    });
  }

  loadProduct(id: number) {
    this.loading = true;
    this.error = false;

    this.shopService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        // Si el producto tiene variantes del backend, usarlas
        // Si no (legacy), parsear el campo size como talla única
        const hasVariants = product.sizes && product.sizes.length > 0;
        if (!hasVariants && product.size) {
          // Compatibilidad legacy: convertir campo size a variante ficticia
          product.sizes = [{ variantId: 0, size: product.size, stock: product.stock, available: product.stock > 0 }];
        }
        // Auto-seleccionar si solo hay una talla disponible
        const available = (product.sizes || []).filter(s => s.available);
        if (available.length === 1) {
          this.selectedSize = available[0].size;
          this.selectedVariantId = available[0].variantId || null;
        }
        this.galleryImages = this.buildGallery(product);

        this.metaService.setProductMeta({
          name: product.name,
          description: product.description || product.categoryName,
          salePrice: product.salePrice,
          imageUrl: product.imageUrl
        });

        // Cargar productos relacionados
        this.shopService.getProducts(product.categoryId).subscribe({
          next: (res: any) => {
            const items = res.items || res;
            this.relatedProducts = items.filter((p: Product) => p.id !== product.id).slice(0, 4);
          },
          error: () => {}
        });
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  // Construye galería de 4 ángulos con imagen real del producto
  buildGallery(product: Product): string[] {
    const base = product.imageUrl || this.getProductImage(product);
    // Si tiene imagen real del admin usarla como principal
    // Generar variaciones con parámetros Unsplash para simular ángulos
    const name = (product.name || '').toLowerCase();
    const imgs = this.getGalleryByName(name, product.id);
    if (product.imageUrl) imgs[0] = product.imageUrl;
    return imgs;
  }

  getGalleryByName(name: string, id: number): string[] {
    const sneakerImgs = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
      'https://images.unsplash.com/photo-1556906781-9a412961d61f?w=700&q=80',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=700&q=80',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=700&q=80'
    ];
    const formalImgs = [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=700&q=80',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=700&q=80',
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=700&q=80',
      'https://images.unsplash.com/photo-1618898909019-010e4e234c55?w=700&q=80'
    ];
    const bootImgs = [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=700&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
      'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=700&q=80',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=700&q=80'
    ];
    const sandalImgs = [
      'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=700&q=80',
      'https://images.unsplash.com/photo-1572782252655-9c53bf0b7b04?w=700&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=700&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&q=80'
    ];
    const sportImgs = [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=700&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=700&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=700&q=80'
    ];
    if (name.includes('boot') || name.includes('bota')) return bootImgs;
    if (name.includes('sandal') || name.includes('sandalia')) return sandalImgs;
    if (name.includes('formal') || name.includes('oxford') || name.includes('vestir')) return formalImgs;
    if (name.includes('sport') || name.includes('gym') || name.includes('running')) return sportImgs;
    if (name.includes('sneaker') || name.includes('zapatilla') || name.includes('casual')) return sneakerImgs;
    const allSets = [sneakerImgs, formalImgs, bootImgs, sandalImgs, sportImgs];
    return allSets[id % allSets.length];
  }

  getProductImage(product: Product): string {
    if (product.imageUrl) return product.imageUrl;
    const name = (product.name || '').toLowerCase();
    const map: { [key: string]: string } = {
      'sneaker': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'zapatilla': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'running': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
      'formal': 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80',
      'oxford': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80',
      'bota': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80',
      'sandalia': 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80',
      'sport': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
      'casual': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',
    };
    for (const key of Object.keys(map)) {
      if (name.includes(key)) return map[key];
    }
    const fallbacks = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',
    ];
    return fallbacks[product.id % fallbacks.length];
  }

  setActiveImage(i: number) { this.activeImageIndex = i; }

  nextImage() {
    this.activeImageIndex = (this.activeImageIndex + 1) % this.galleryImages.length;
  }

  prevImage() {
    this.activeImageIndex = (this.activeImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
  }

  openLightbox() { this.lightboxOpen = true; }
  closeLightbox() { this.lightboxOpen = false; }

  onZoomMove(e: MouseEvent) { /* zoom futuro */ }

  getDiscountPercent(): number {
    if (!this.product || !this.product.salePrice || this.product.salePrice >= this.product.price) return 0;
    return Math.round((1 - this.product.salePrice / this.product.price) * 100);
  }

  selectSize(size: string, variantId: number) {
    this.selectedSize = size;
    this.selectedVariantId = variantId || null;
  }

  getSelectedVariant() {
    if (!this.product || !this.selectedSize) return null;
    return (this.product.sizes || []).find(s => s.size === this.selectedSize) ?? null;
  }

  getStockForSelected(): number {
    const variant = this.getSelectedVariant();
    return variant ? variant.stock : (this.product?.stock ?? 0);
  }

  increaseQuantity() {
    const maxStock = this.getStockForSelected();
    if (this.quantity < maxStock) {
      this.quantity++;
    } else {
      this.notificationService.warning(`Stock máximo disponible: ${maxStock}`);
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart() {
    if (!this.product) return;
    const hasVariants = this.product.sizes && this.product.sizes.filter(s => s.available).length > 0;
    if (hasVariants && !this.selectedSize) {
      this.notificationService.warning('Selecciona una talla para continuar');
      return;
    }
    const variant = this.getSelectedVariant();
    const result = this.cartService.addToCart(
      this.product,
      this.quantity,
      variant && variant.variantId ? variant : undefined
    );
    if (result.success) {
      const label = this.selectedSize ? ` — Talla ${this.selectedSize}` : '';
      this.notificationService.success(`✓ ${this.quantity}x ${this.product.name}${label} agregado al carrito`);
      this.quantity = 1;
    } else {
      this.notificationService.error(result.message);
    }
  }

  consultarPorWsp() {
    if (!this.product) return;
    const msg = `¡Hola! Estoy interesado en:\n\n👟 *${this.product.name}*\n💰 Precio: S/ ${(this.product.salePrice || this.product.price).toFixed(2)}${this.selectedSize ? `\n📏 Talla: ${this.selectedSize}` : ''}\n\n¿Tienen disponibilidad y cómo coordino el envío?`;
    window.open(`https://wa.me/${this.WSP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  isSizeSelected(size: string): boolean {
    return this.selectedSize === size;
  }
}
