import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { Product, ProductVariant, CreateVariant } from '../models/product.model';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 class="mb-1">Productos</h2>
          <small class="text-muted">Gestiona precios, stock y estado en tiempo real</small>
        </div>
        <a *ngIf="isAdmin" routerLink="/products/new" class="btn btn-primary">
          Agregar Nuevo Producto
        </a>
      </div>

      <div class="card mb-3">
        <div class="card-body">
          <div class="row g-2 align-items-end">
            <div class="col-md-4">
              <label class="form-label">Buscar</label>
              <input
                type="text"
                class="form-control"
                placeholder="Nombre, marca o SKU"
                [(ngModel)]="searchTerm"
                (input)="applyFilters()"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Categoría</label>
              <select class="form-select" [(ngModel)]="selectedCategoryId" (change)="applyFilters()">
                <option [ngValue]="null">Todas</option>
                <option *ngFor="let category of categories" [ngValue]="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Estado</label>
              <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Stock</label>
              <select class="form-select" [(ngModel)]="stockFilter" (change)="applyFilters()">
                <option value="all">Todos</option>
                <option value="low">Bajo stock</option>
                <option value="out">Agotados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div *ngIf="loading" class="spinner-container">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>

          <div *ngIf="!loading && filteredProducts.length === 0" class="text-center py-5 text-muted">
            <h5>No se encontraron productos</h5>
            <p>Prueba ajustando los filtros o agregando un nuevo producto</p>
          </div>

          <div *ngIf="!loading && filteredProducts.length > 0" class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Talla</th>
                  <th class="text-end">Precio</th>
                  <th class="text-end">Stock</th>
                  <th>Estado</th>
                  <th *ngIf="isAdmin" class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of pagedProducts">
                  <td>
                    <strong>{{ product.name }}</strong>
                    <div class="text-muted small">{{ product.brand }} · SKU {{ product.id }}</div>
                  </td>
                  <td>{{ product.categoryName }}</td>
                  <td>
                    <!-- Si tiene variantes, mostrar badges por talla con su stock -->
                    <div *ngIf="product.variants && product.variants.length > 0" class="d-flex flex-wrap gap-1">
                      <span
                        *ngFor="let v of product.variants"
                        class="badge"
                        [class.bg-success]="v.stock > 5"
                        [class.bg-warning]="v.stock > 0 && v.stock <= 5"
                        [class.bg-danger]="v.stock === 0"
                        [title]="'Stock: ' + v.stock">
                        {{ v.size }} ({{ v.stock }})
                      </span>
                    </div>
                    <!-- Fallback legacy: talla única -->
                    <span *ngIf="!product.variants || product.variants.length === 0">
                      {{ product.size || '—' }}
                    </span>
                  </td>
                  <td class="text-end">
                    S/ {{ product.price | number:'1.2-2' }}
                  </td>
                  <td class="text-end">
                    <span [class.text-danger]="product.stock === 0" [class.text-warning]="product.stock > 0 && product.stock < 10">
                      {{ product.stock }}
                    </span>
                    <span class="badge ms-2" [class.bg-danger]="product.stock === 0" [class.bg-warning]="product.stock > 0 && product.stock < 10" [class.bg-success]="product.stock >= 10">
                      {{ product.stock === 0 ? 'Agotado' : (product.stock < 10 ? 'Bajo' : 'Ok') }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [class.bg-success]="product.isActive" [class.bg-secondary]="!product.isActive">
                      {{ product.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td *ngIf="isAdmin" class="text-end">
                    <a [routerLink]="['/products/edit', product.id]" class="btn btn-sm btn-outline-primary me-1">
                      Editar
                    </a>
                    <button (click)="openVariantsModal(product)" class="btn btn-sm btn-outline-info me-1" title="Gestionar tallas">
                      📐 Tallas
                    </button>
                    <button (click)="deleteProduct(product.id)" class="btn btn-sm btn-outline-danger">
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          <!-- Paginación -->
          <div *ngIf="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">
              {{ (currentPage-1)*pageSize+1 }}–{{ currentPage*pageSize > filteredProducts.length ? filteredProducts.length : currentPage*pageSize }} de {{ filteredProducts.length }}
            </small>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" [class.disabled]="currentPage===1">
                <button class="page-link" (click)="goToPage(currentPage-1)">‹</button>
              </li>
              <li *ngFor="let p of pages" class="page-item" [class.active]="p===currentPage">
                <button class="page-link" (click)="goToPage(p)">{{ p }}</button>
              </li>
              <li class="page-item" [class.disabled]="currentPage===totalPages">
                <button class="page-link" (click)="goToPage(currentPage+1)">›</button>
              </li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Gestión de Tallas/Variantes -->
    <div class="modal fade show d-block" *ngIf="showVariantsModal" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">📐 Tallas — {{ selectedProduct?.name }}</h5>
            <button type="button" class="btn-close" (click)="closeVariantsModal()"></button>
          </div>
          <div class="modal-body">

            <!-- Tabla de variantes existentes -->
            <div class="mb-4">
              <h6 class="fw-bold mb-2">Variantes actuales</h6>
              <div *ngIf="!selectedProduct?.variants?.length" class="text-muted text-center py-3">
                Sin variantes. Agrega tallas abajo.
              </div>
              <table *ngIf="selectedProduct?.variants?.length" class="table table-sm table-bordered align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Talla</th>
                    <th class="text-center">Stock</th>
                    <th class="text-center">Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let v of selectedProduct?.variants">
                    <td><span class="badge bg-secondary fs-6">{{ v.size }}</span></td>
                    <td class="text-center">
                      <input type="number" min="0" class="form-control form-control-sm text-center"
                        style="width:80px;margin:auto"
                        [(ngModel)]="v.stock"
                        (change)="updateVariantStock(v)">
                    </td>
                    <td class="text-center">
                      <span class="badge" [class.bg-success]="v.isActive" [class.bg-secondary]="!v.isActive">
                        {{ v.isActive ? 'Activa' : 'Inactiva' }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteVariant(v)">🗑</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Agregar talla individual -->
            <div class="border rounded p-3 mb-3">
              <h6 class="fw-bold mb-3">Agregar talla</h6>
              <div class="row g-2 align-items-end">
                <div class="col-md-5">
                  <label class="form-label">Talla</label>
                  <select class="form-select" [(ngModel)]="newVariant.size">
                    <option value="">Selecciona...</option>
                    <option *ngFor="let s of variantSizes" [value]="s">{{ s }}</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Stock inicial</label>
                  <input type="number" min="0" class="form-control" [(ngModel)]="newVariant.stock">
                </div>
                <div class="col-md-3">
                  <button class="btn btn-primary w-100" (click)="addVariant()" [disabled]="!newVariant.size || variantLoading">
                    {{ variantLoading ? 'Guardando...' : '+ Agregar' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Agregar todas las tallas de golpe -->
            <div class="border rounded p-3 bg-light">
              <h6 class="fw-bold mb-2">⚡ Agregar rango completo</h6>
              <p class="text-muted small mb-2">Agrega todas las tallas de un rango con el mismo stock inicial.</p>
              <div class="row g-2 align-items-end">
                <div class="col-md-3">
                  <label class="form-label">Desde</label>
                  <select class="form-select form-select-sm" [(ngModel)]="bulkFrom">
                    <option *ngFor="let s of variantSizes" [value]="s">{{ s }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Hasta</label>
                  <select class="form-select form-select-sm" [(ngModel)]="bulkTo">
                    <option *ngFor="let s of variantSizes" [value]="s">{{ s }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Stock c/u</label>
                  <input type="number" min="0" class="form-control form-control-sm" [(ngModel)]="bulkStock">
                </div>
                <div class="col-md-3">
                  <button class="btn btn-outline-primary btn-sm w-100" (click)="addBulkVariants()" [disabled]="variantLoading">
                    Agregar rango
                  </button>
                </div>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeVariantsModal()">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  pagedProducts: Product[] = [];
  categories: Category[] = [];
  loading = true;
  isAdmin = this.authService.hasRole('Administrator');

  // Modal de variantes
  showVariantsModal = false;
  selectedProduct: Product | null = null;
  variantLoading = false;
  newVariant: CreateVariant = { size: '', stock: 0 };
  variantSizes = ['35','36','37','38','39','40','41','42','43','44','45','46'];
  bulkFrom = '38';
  bulkTo = '44';
  bulkStock = 10;

  searchTerm = '';
  selectedCategoryId: number | null = null;
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  stockFilter: 'all' | 'low' | 'out' = 'all';

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  pages: number[] = [];

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.products];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.id.toString().includes(term)
      );
    }
    if (this.selectedCategoryId) filtered = filtered.filter(p => p.categoryId === this.selectedCategoryId);
    if (this.statusFilter !== 'all') filtered = filtered.filter(p => this.statusFilter === 'active' ? p.isActive : !p.isActive);
    if (this.stockFilter === 'low') filtered = filtered.filter(p => p.stock > 0 && p.stock < 10);
    else if (this.stockFilter === 'out') filtered = filtered.filter(p => p.stock === 0);
    this.filteredProducts = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedProducts = this.filteredProducts.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  deleteProduct(id: number): void {
    if (confirm('¿Está seguro que desea eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.notificationService.success('Producto eliminado');
          this.loadProducts();
        },
        error: () => this.notificationService.error('Error al eliminar producto')
      });
    }
  }

  // ── Variantes ────────────────────────────────────────────
  openVariantsModal(product: Product): void {
    this.selectedProduct = { ...product, variants: product.variants ? [...product.variants] : [] };
    this.newVariant = { size: '', stock: 0 };
    this.showVariantsModal = true;
    // Cargar variantes frescas del servidor
    this.productService.getVariants(product.id).subscribe({
      next: (variants) => { if (this.selectedProduct) this.selectedProduct.variants = variants; }
    });
  }

  closeVariantsModal(): void {
    this.showVariantsModal = false;
    this.selectedProduct = null;
    this.loadProducts(); // refrescar stock totales
  }

  addVariant(): void {
    if (!this.selectedProduct || !this.newVariant.size) return;
    this.variantLoading = true;
    this.productService.addVariant(this.selectedProduct.id, this.newVariant).subscribe({
      next: (v) => {
        this.selectedProduct!.variants = [...(this.selectedProduct!.variants || []), v];
        this.newVariant = { size: '', stock: 0 };
        this.variantLoading = false;
        this.notificationService.success(`Talla ${v.size} agregada`);
      },
      error: (err) => {
        this.variantLoading = false;
        this.notificationService.error(err?.error?.message || 'Error al agregar talla');
      }
    });
  }

  addBulkVariants(): void {
    if (!this.selectedProduct) return;
    const fromIdx = this.variantSizes.indexOf(this.bulkFrom);
    const toIdx = this.variantSizes.indexOf(this.bulkTo);
    if (fromIdx < 0 || toIdx < 0 || fromIdx > toIdx) {
      this.notificationService.warning('Rango de tallas inválido');
      return;
    }
    const sizes = this.variantSizes.slice(fromIdx, toIdx + 1).map(size => ({ size, stock: this.bulkStock }));
    this.variantLoading = true;
    this.productService.addVariantsBulk(this.selectedProduct.id, sizes).subscribe({
      next: (variants) => {
        this.selectedProduct!.variants = variants;
        this.variantLoading = false;
        this.notificationService.success(`${variants.length} tallas agregadas`);
      },
      error: () => {
        this.variantLoading = false;
        this.notificationService.error('Error al agregar tallas en bloque');
      }
    });
  }

  updateVariantStock(variant: ProductVariant): void {
    if (!this.selectedProduct) return;
    this.productService.updateVariantStock(this.selectedProduct.id, variant.id, variant.stock).subscribe({
      next: () => this.notificationService.success(`Stock talla ${variant.size} actualizado`),
      error: () => this.notificationService.error('Error al actualizar stock')
    });
  }

  deleteVariant(variant: ProductVariant): void {
    if (!this.selectedProduct) return;
    if (!confirm(`¿Eliminar talla ${variant.size}?`)) return;
    this.productService.deleteVariant(this.selectedProduct.id, variant.id).subscribe({
      next: () => {
        this.selectedProduct!.variants = this.selectedProduct!.variants!.filter(v => v.id !== variant.id);
        this.notificationService.success(`Talla ${variant.size} eliminada`);
      },
      error: () => this.notificationService.error('Error al eliminar talla')
    });
  }
}
