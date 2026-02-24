import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../../services/shop.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { MetaService } from '../../services/meta.service';
import { Product, Category } from '../../models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DecimalPipe],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  loading = true;
  filtersOpen = false;
  showQuickView = false;
  selectedProduct: Product | null = null;
  
  // Filtros
  selectedCategoryId: number | null = null;
  searchTerm = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' = 'relevance';
  hideOutOfStock = false;

  constructor(
    private shopService: ShopService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private metaService: MetaService
  ) {}

  ngOnInit() {
    this.metaService.updateMetaTags({
      title: 'Catálogo de Productos',
      description: 'Explora nuestra amplia colección de calzado. Encuentra el par perfecto para cada ocasión.',
      type: 'website'
    });
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.shopService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.notificationService.error('Error al cargar las categorías');
      }
    });
  }

  loadProducts() {
    this.loading = true;
    this.shopService.getProducts(
      this.selectedCategoryId || undefined,
      this.searchTerm || undefined,
      this.minPrice || undefined,
      this.maxPrice || undefined
    ).subscribe({
      next: (products: any) => {
        const list = Array.isArray(products) ? products : (products.items || products.data || []);
        this.products = list;
        this.applyClientFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.notificationService.error('Error al cargar los productos');
        this.loading = false;
      }
    });
  }

  onCategoryChange(categoryId: number | null) {
    this.selectedCategoryId = categoryId;
    this.loadProducts();
  }

  onSearch() {
    this.loadProducts();
  }

  onPriceFilter() {
    this.loadProducts();
  }

  toggleStockFilter() {
    this.hideOutOfStock = !this.hideOutOfStock;
    this.applyClientFilters();
  }

  clearFilters() {
    this.selectedCategoryId = null;
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'relevance';
    this.hideOutOfStock = false;
    this.loadProducts();
    this.closeFilters();
  }

  toggleFilters() {
    this.filtersOpen = !this.filtersOpen;
  }

  closeFilters() {
    this.filtersOpen = false;
  }

  applyFilters() {
    this.loadProducts();
    this.closeFilters();
  }

  applyClientFilters() {
    let filtered = [...this.products];

    if (this.hideOutOfStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    switch (this.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    this.filteredProducts = filtered;
  }

  onQuickView(product: Product) {
    this.selectedProduct = product;
    this.showQuickView = true;
  }

  closeQuickView() {
    this.showQuickView = false;
    this.selectedProduct = null;
  }

  addToCartFromQuickView() {
    if (this.selectedProduct) {
      this.addToCart(this.selectedProduct);
      this.closeQuickView();
    }
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedCategoryId || this.searchTerm || this.minPrice || this.maxPrice);
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.selectedCategoryId) count++;
    if (this.searchTerm) count++;
    if (this.minPrice || this.maxPrice) count++;
    return count;
  }

  addToCart(product: Product) {
    const result = this.cartService.addToCart(product);
    if (result.success) {
      this.notificationService.success(`✓ ${product.name} agregado al carrito`);
    } else {
      this.notificationService.error(result.message);
    }
  }

  onSortChange() {
    this.applyClientFilters();
  }

  formatPrice(price: number): string {
    return `S/ ${price.toFixed(2)}`;
  }

  getProductImage(product: Product): string {
    // Si el producto ya tiene imagen definida, usarla
    if (product.imageUrl && product.imageUrl.startsWith('http')) {
      return product.imageUrl;
    }

    const name = (product.name || '').toLowerCase();
    const cat  = (product.categoryName || '').toLowerCase();

    // Imágenes referenciales por nombre/categoría de producto (calzado)
    if (name.includes('sneaker') || name.includes('zapatilla') || name.includes('running'))
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop';
    if (name.includes('formal') || name.includes('oxford') || name.includes('clásic'))
      return 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80&fit=crop';
    if (name.includes('bota') || name.includes('boot'))
      return 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80&fit=crop';
    if (name.includes('sandalia') || name.includes('sandal'))
      return 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80&fit=crop';
    if (name.includes('casual') || name.includes('loafer'))
      return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80&fit=crop';
    if (name.includes('sport') || name.includes('gym') || name.includes('training'))
      return 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80&fit=crop';
    if (name.includes('mocasín') || name.includes('moccasin') || name.includes('slip'))
      return 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80&fit=crop';
    if (name.includes('dama') || name.includes('mujer') || name.includes('tac') || name.includes('heel'))
      return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80&fit=crop';
    if (name.includes('niño') || name.includes('kid') || name.includes('infant'))
      return 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=80&fit=crop';

    // Por categoría
    if (cat.includes('sneaker') || cat.includes('sport'))
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop';
    if (cat.includes('formal'))
      return 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80&fit=crop';
    if (cat.includes('casual'))
      return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80&fit=crop';
    if (cat.includes('bota') || cat.includes('boot'))
      return 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80&fit=crop';

    // Fallback general de calzado
    const fallbacks = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80&fit=crop',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80&fit=crop',
    ];
    return fallbacks[product.id % fallbacks.length];
  }
}
