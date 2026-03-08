import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { Producto, VarianteProducto, CrearVariante } from '../models/product.model';
import { Categoria } from '../models/category.model';

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
        <a *ngIf="esAdmin" routerLink="/products/new" class="btn btn-primary">
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
                [(ngModel)]="terminoBusqueda"
                (input)="aplicarFiltros()"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Categoría</label>
              <select class="form-select" [(ngModel)]="categoriaSeleccionadaId" (change)="aplicarFiltros()">
                <option [ngValue]="null">Todas</option>
                <option *ngFor="let cat of categorias" [ngValue]="cat.id">
                  {{ cat.nombre }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Estado</label>
              <select class="form-select" [(ngModel)]="filtroEstado" (change)="aplicarFiltros()">
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Stock</label>
              <select class="form-select" [(ngModel)]="filtroStock" (change)="aplicarFiltros()">
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

          <div *ngIf="!loading && productosFiltrados.length === 0" class="text-center py-5 text-muted">
            <h5>No se encontraron productos</h5>
            <p>Prueba ajustando los filtros o agregando un nuevo producto</p>
          </div>

          <div *ngIf="!loading && productosFiltrados.length > 0" class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Talla</th>
                  <th class="text-end">Precio</th>
                  <th class="text-end">Stock</th>
                  <th>Estado</th>
                  <th *ngIf="esAdmin" class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let producto of productosPaginados">
                  <td>
                    <strong>{{ producto.nombre }}</strong>
                    <div class="text-muted small">{{ producto.marca }} · SKU {{ producto.id }}</div>
                  </td>
                  <td>{{ producto.nombreCategoria }}</td>
                  <td>
                    <!-- Si tiene variantes, mostrar badges por talla con su stock -->
                    <div *ngIf="producto.variantes && producto.variantes.length > 0" class="d-flex flex-wrap gap-1">
                      <span
                        *ngFor="let v of producto.variantes"
                        class="badge"
                        [class.bg-success]="v.stock > 5"
                        [class.bg-danger]="v.stock === 0"
                        [style.background]="(v.stock > 0 && v.stock <= 5) ? '#e67e22' : null"
                        [style.color]="(v.stock > 0 && v.stock <= 5) ? '#fff' : null"
                        [title]="'Stock: ' + v.stock">
                        {{ v.talla }} ({{ v.stock }})
                      </span>
                    </div>
                    <!-- Fallback legacy: talla única -->
                    <span *ngIf="!producto.variantes || producto.variantes.length === 0">
                      {{ producto.talla || '—' }}
                    </span>
                  </td>
                  <td class="text-end">
                    S/ {{ producto.precio | number:'1.2-2' }}
                  </td>
                  <td class="text-end">
                    <span [class.text-danger]="producto.stock === 0" [style.color]="(producto.stock > 0 && producto.stock < 10) ? '#e67e22' : null" [style.font-weight]="(producto.stock > 0 && producto.stock < 10) ? '600' : null">
                      {{ producto.stock }}
                    </span>
                    <span class="badge ms-2" [class.bg-danger]="producto.stock === 0" [class.bg-success]="producto.stock >= 10" [style.background]="(producto.stock > 0 && producto.stock < 10) ? '#e67e22' : null" [style.color]="(producto.stock > 0 && producto.stock < 10) ? '#fff' : null">
                      {{ producto.stock === 0 ? 'Agotado' : (producto.stock < 10 ? 'Bajo' : 'Ok') }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [class.bg-success]="producto.activo" [class.bg-secondary]="!producto.activo">
                      {{ producto.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td *ngIf="esAdmin" class="text-end">
                    <a [routerLink]="['/products/edit', producto.id]" class="btn btn-sm btn-outline-primary me-1">
                      Editar
                    </a>
                    <button (click)="abrirModalVariantes(producto)" class="btn btn-sm btn-outline-info me-1" title="Gestionar tallas">
                      📐 Tallas
                    </button>
                    <button (click)="eliminarProducto(producto.id)" class="btn btn-sm btn-outline-danger">
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          <!-- Paginación -->
          <div *ngIf="totalPaginas > 1" class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">
              {{ (paginaActual-1)*tamanoPagina+1 }}–{{ paginaActual*tamanoPagina > productosFiltrados.length ? productosFiltrados.length : paginaActual*tamanoPagina }} de {{ productosFiltrados.length }}
            </small>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" [class.disabled]="paginaActual===1">
                <button class="page-link" (click)="irAPagina(paginaActual-1)">‹</button>
              </li>
              <li *ngFor="let p of paginas" class="page-item" [class.active]="p===paginaActual">
                <button class="page-link" (click)="irAPagina(p)">{{ p }}</button>
              </li>
              <li class="page-item" [class.disabled]="paginaActual===totalPaginas">
                <button class="page-link" (click)="irAPagina(paginaActual+1)">›</button>
              </li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Gestión de Tallas/Variantes -->
    <div class="modal fade show d-block" *ngIf="mostrarModalVariantes" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">📐 Tallas — {{ productoSeleccionado?.nombre }}</h5>
            <button type="button" class="btn-close" (click)="cerrarModalVariantes()"></button>
          </div>
          <div class="modal-body">

            <!-- Tabla de variantes existentes -->
            <div class="mb-4">
              <h6 class="fw-bold mb-2">Variantes actuales</h6>
              <div *ngIf="!productoSeleccionado?.variantes?.length" class="text-muted text-center py-3">
                Sin variantes. Agrega tallas abajo.
              </div>
              <table *ngIf="productoSeleccionado?.variantes?.length" class="table table-sm table-bordered align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Talla</th>
                    <th class="text-center">Stock</th>
                    <th class="text-center">Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let v of productoSeleccionado?.variantes">
                    <td><span class="badge bg-secondary fs-6">{{ v.talla }}</span></td>
                    <td class="text-center">
                      <input type="number" min="0" class="form-control form-control-sm text-center"
                        style="width:80px;margin:auto"
                        [(ngModel)]="v.stock"
                        (change)="actualizarStockVariante(v)">
                    </td>
                    <td class="text-center">
                      <span class="badge" [class.bg-success]="v.activo" [class.bg-secondary]="!v.activo">
                        {{ v.activo ? 'Activa' : 'Inactiva' }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-danger" (click)="eliminarVariante(v)">🗑</button>
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
                  <select class="form-select" [(ngModel)]="nuevaVariante.talla">
                    <option value="">Selecciona...</option>
                    <option *ngFor="let s of tallasVariante" [value]="s">{{ s }}</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Stock inicial</label>
                  <input type="number" min="0" class="form-control" [(ngModel)]="nuevaVariante.stock">
                </div>
                <div class="col-md-3">
                  <button class="btn btn-primary w-100" (click)="agregarVariante()" [disabled]="!nuevaVariante.talla || cargandoVariante">
                    {{ cargandoVariante ? 'Guardando...' : '+ Agregar' }}
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
                  <select class="form-select form-select-sm" [(ngModel)]="masivoDesde">
                    <option *ngFor="let s of tallasVariante" [value]="s">{{ s }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Hasta</label>
                  <select class="form-select form-select-sm" [(ngModel)]="masivoHasta">
                    <option *ngFor="let s of tallasVariante" [value]="s">{{ s }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Stock c/u</label>
                  <input type="number" min="0" class="form-control form-control-sm" [(ngModel)]="masivoStock">
                </div>
                <div class="col-md-3">
                  <button class="btn btn-outline-primary btn-sm w-100" (click)="agregarVariantesMasivo()" [disabled]="cargandoVariante">
                    Agregar rango
                  </button>
                </div>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarModalVariantes()">Cerrar</button>
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

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosPaginados: Producto[] = [];
  categorias: Categoria[] = [];
  loading = true;
  esAdmin = this.authService.tieneRol('Administrador');

  // Modal de variantes
  mostrarModalVariantes = false;
  productoSeleccionado: Producto | null = null;
  cargandoVariante = false;
  nuevaVariante: CrearVariante = { talla: '', stock: 0 };
  tallasVariante = ['35','36','37','38','39','40','41','42','43','44','45','46'];
  masivoDesde = '38';
  masivoHasta = '44';
  masivoStock = 10;

  terminoBusqueda = '';
  categoriaSeleccionadaId: number | null = null;
  filtroEstado: 'all' | 'active' | 'inactive' = 'all';
  filtroStock: 'all' | 'low' | 'out' = 'all';

  // Paginación
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 1;
  paginas: number[] = [];

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias(): void {
    this.categoryService.obtenerCategorias().subscribe({
      next: (datos) => {
        this.categorias = datos;
      },
      error: (err: any) => console.error('Error cargando categorías:', err)
    });
  }

  cargarProductos(): void {
    this.loading = true;
    this.productService.obtenerProductos().subscribe({
      next: (datos) => {
        this.productos = datos;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando productos:', err);
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtrados = [...this.productos];
    if (this.terminoBusqueda) {
      const termino = this.terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.marca.toLowerCase().includes(termino) ||
        p.id.toString().includes(termino)
      );
    }
    if (this.categoriaSeleccionadaId) filtrados = filtrados.filter(p => p.categoriaId === this.categoriaSeleccionadaId);
    if (this.filtroEstado !== 'all') filtrados = filtrados.filter(p => this.filtroEstado === 'active' ? p.activo : !p.activo);
    if (this.filtroStock === 'low') filtrados = filtrados.filter(p => p.stock > 0 && p.stock < 10);
    else if (this.filtroStock === 'out') filtrados = filtrados.filter(p => p.stock === 0);
    this.productosFiltrados = filtrados;
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.productosFiltrados.length / this.tamanoPagina);
    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    this.productosPaginados = this.productosFiltrados.slice(inicio, inicio + this.tamanoPagina);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Está seguro que desea eliminar este producto?')) {
      this.productService.eliminarProducto(id).subscribe({
        next: () => {
          this.notificationService.success('Producto eliminado');
          this.cargarProductos();
        },
        error: () => this.notificationService.error('Error al eliminar producto')
      });
    }
  }

  // ── Variantes ────────────────────────────────────────────
  abrirModalVariantes(producto: Producto): void {
    this.productoSeleccionado = { ...producto, variantes: producto.variantes ? [...producto.variantes] : [] };
    this.nuevaVariante = { talla: '', stock: 0 };
    this.mostrarModalVariantes = true;
    // Cargar variantes frescas del servidor
    this.productService.obtenerVariantes(producto.id).subscribe({
      next: (variantes) => { if (this.productoSeleccionado) this.productoSeleccionado.variantes = variantes; }
    });
  }

  cerrarModalVariantes(): void {
    this.mostrarModalVariantes = false;
    this.productoSeleccionado = null;
    this.cargarProductos(); // refrescar stock totales
  }

  agregarVariante(): void {
    if (!this.productoSeleccionado || !this.nuevaVariante.talla) return;
    this.cargandoVariante = true;
    this.productService.agregarVariante(this.productoSeleccionado.id, this.nuevaVariante).subscribe({
      next: (v) => {
        this.productoSeleccionado!.variantes = [...(this.productoSeleccionado!.variantes || []), v];
        this.nuevaVariante = { talla: '', stock: 0 };
        this.cargandoVariante = false;
        this.notificationService.success(`Talla ${v.talla} agregada`);
      },
      error: (err: any) => {
        this.cargandoVariante = false;
        this.notificationService.error(err?.error?.message || 'Error al agregar talla');
      }
    });
  }

  agregarVariantesMasivo(): void {
    if (!this.productoSeleccionado) return;
    const desdeIdx = this.tallasVariante.indexOf(this.masivoDesde);
    const hastaIdx = this.tallasVariante.indexOf(this.masivoHasta);
    if (desdeIdx < 0 || hastaIdx < 0 || desdeIdx > hastaIdx) {
      this.notificationService.warning('Rango de tallas inválido');
      return;
    }
    const tallas = this.tallasVariante.slice(desdeIdx, hastaIdx + 1).map(talla => ({ talla, stock: this.masivoStock }));
    this.cargandoVariante = true;
    this.productService.agregarVariantesMasivo(this.productoSeleccionado.id, tallas).subscribe({
      next: (variantes) => {
        this.productoSeleccionado!.variantes = variantes;
        this.cargandoVariante = false;
        this.notificationService.success(`${variantes.length} tallas agregadas`);
      },
      error: () => {
        this.cargandoVariante = false;
        this.notificationService.error('Error al agregar tallas en bloque');
      }
    });
  }

  actualizarStockVariante(variante: VarianteProducto): void {
    if (!this.productoSeleccionado) return;
    this.productService.actualizarStockVariante(this.productoSeleccionado.id, variante.id, variante.stock).subscribe({
      next: () => this.notificationService.success(`Stock talla ${variante.talla} actualizado`),
      error: () => this.notificationService.error('Error al actualizar stock')
    });
  }

  eliminarVariante(variante: VarianteProducto): void {
    if (!this.productoSeleccionado) return;
    if (!confirm(`¿Eliminar talla ${variante.talla}?`)) return;
    this.productService.eliminarVariante(this.productoSeleccionado.id, variante.id).subscribe({
      next: () => {
        this.productoSeleccionado!.variantes = this.productoSeleccionado!.variantes!.filter(v => v.id !== variante.id);
        this.notificationService.success(`Talla ${variante.talla} eliminada`);
      },
      error: () => this.notificationService.error('Error al eliminar talla')
    });
  }
}
