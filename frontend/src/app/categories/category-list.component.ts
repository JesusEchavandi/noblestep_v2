import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../services/category.service';
import { AuthService } from '../services/auth.service';
import { Categoria, CrearCategoria } from '../models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Categorías</h2>
      </div>

      <!-- Formulario crear/editar (arriba, ancho completo) -->
      <div class="card mb-4" *ngIf="esAdmin">
        <div class="card-header">
          <h5 class="mb-0">{{ modoEdicion ? 'Editar Categoría' : 'Agregar Nueva Categoría' }}</h5>
        </div>
        <div class="card-body">
          <form (ngSubmit)="onSubmit()" #categoryForm="ngForm">
            <div class="row g-3 align-items-end">
              <div class="col-md-4">
                <label for="nombre" class="form-label">Nombre *</label>
                <input type="text" class="form-control" id="nombre" name="nombre"
                  [(ngModel)]="categoria.nombre" required />
              </div>
              <div class="col-md-5">
                <label for="descripcion" class="form-label">Descripción</label>
                <input type="text" class="form-control" id="descripcion" name="descripcion"
                  [(ngModel)]="categoria.descripcion" />
              </div>
              <div class="col-md-3 d-flex gap-2">
                <button *ngIf="modoEdicion" type="button" class="btn btn-secondary" (click)="cancelarEdicion()">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!categoryForm.form.valid || guardando">
                  {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Tabla full width -->
      <div class="card">
        <div class="card-body">
          <div *ngIf="loading" class="spinner-container">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>

          <table *ngIf="!loading" class="table table-hover">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th *ngIf="esAdmin" class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let categoria of categoriasPaginadas">
                <td>{{ categoria.nombre }}</td>
                <td>{{ categoria.descripcion }}</td>
                <td>
                  <span class="badge" [class.bg-success]="categoria.activo" [class.bg-secondary]="!categoria.activo">
                    {{ categoria.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td *ngIf="esAdmin" class="text-end">
                  <button (click)="editarCategoria(categoria)" class="btn btn-sm btn-outline-primary me-2">
                    Editar
                  </button>
                  <button (click)="eliminarCategoria(categoria.id)" class="btn btn-sm btn-outline-danger">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Paginación -->
          <div *ngIf="totalPaginas > 1" class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">
              {{ (paginaActual-1)*tamanoPagina+1 }}–{{ paginaActual*tamanoPagina > categorias.length ? categorias.length : paginaActual*tamanoPagina }} de {{ categorias.length }}
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
  `
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);

  categorias: Categoria[] = [];
  categoriasPaginadas: Categoria[] = [];
  categoria: CrearCategoria = { nombre: '', descripcion: '' };
  loading = true;
  guardando = false;
  modoEdicion = false;
  editandoId = 0;
  esAdmin = this.authService.tieneRol('Administrador');

  // Paginación
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 1;
  paginas: number[] = [];

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.loading = true;
    this.categoryService.obtenerCategorias().subscribe({
      next: (datos) => {
        this.categorias = datos;
        this.actualizarPaginacion();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando categorías:', err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.guardando = true;

    if (this.modoEdicion) {
      this.categoryService.actualizarCategoria(this.editandoId, this.categoria).subscribe({
        next: () => {
          this.cargarCategorias();
          this.resetFormulario();
        },
        error: (err: any) => {
          console.error('Error actualizando categoría:', err);
          this.guardando = false;
        }
      });
    } else {
      this.categoryService.crearCategoria(this.categoria).subscribe({
        next: () => {
          this.cargarCategorias();
          this.resetFormulario();
        },
        error: (err: any) => {
          console.error('Error creando categoría:', err);
          this.guardando = false;
        }
      });
    }
  }

  editarCategoria(cat: Categoria): void {
    this.modoEdicion = true;
    this.editandoId = cat.id;
    this.categoria = {
      nombre: cat.nombre,
      descripcion: cat.descripcion
    };
  }

  eliminarCategoria(id: number): void {
    if (confirm('¿Está seguro que desea eliminar esta categoría?')) {
      this.categoryService.eliminarCategoria(id).subscribe({
        next: () => {
          this.cargarCategorias();
        },
        error: (err: any) => console.error('Error al eliminar categoría:', err)
      });
    }
  }

  cancelarEdicion(): void {
    this.resetFormulario();
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.categorias.length / this.tamanoPagina));
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas;
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    this.categoriasPaginadas = this.categorias.slice(inicio, inicio + this.tamanoPagina);
    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  resetFormulario(): void {
    this.categoria = { nombre: '', descripcion: '' };
    this.modoEdicion = false;
    this.editandoId = 0;
    this.guardando = false;
  }
}
