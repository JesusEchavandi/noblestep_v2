import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { CrearProducto, ActualizarProducto, Producto } from '../models/product.model';
import { Categoria } from '../models/category.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-md-10">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">{{ modoEdicion ? 'Editar Producto' : 'Agregar Nuevo Producto' }}</h4>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #productForm="ngForm">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="nombre" class="form-label">Nombre del Producto *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="nombre"
                      name="nombre"
                      [(ngModel)]="producto.nombre"
                      required
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="marca" class="form-label">Marca *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="marca"
                      name="marca"
                      [(ngModel)]="producto.marca"
                      required
                    />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="categoriaId" class="form-label">Categoría *</label>
                    <select
                      class="form-select"
                      id="categoriaId"
                      name="categoriaId"
                      [(ngModel)]="producto.categoriaId"
                      required
                    >
                      <option [ngValue]="0" disabled>Seleccione una categoría</option>
                      <option *ngFor="let cat of categorias" [ngValue]="cat.id">
                        {{ cat.nombre }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="talla" class="form-label">Talla *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="talla"
                      name="talla"
                      [(ngModel)]="producto.talla"
                      required
                      placeholder="ej., 8, 9, 10"
                    />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="precio" class="form-label">Precio *</label>
                    <input
                      type="number"
                      class="form-control"
                      id="precio"
                      name="precio"
                      [(ngModel)]="producto.precio"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="stock" class="form-label">Stock *</label>
                    <input
                      type="number"
                      class="form-control"
                      id="stock"
                      name="stock"
                      [(ngModel)]="producto.stock"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div class="mb-3" *ngIf="modoEdicion">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="activo"
                      name="activo"
                      [(ngModel)]="producto.activo"
                    />
                    <label class="form-check-label" for="activo">
                      Activo
                    </label>
                  </div>
                </div>

                <!-- Imagen URL + Preview -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">
                    <i class="fi fi-rr-picture me-1"></i> Imagen del Producto
                  </label>
                  <div class="input-group mb-2">
                    <span class="input-group-text"><i class="fi fi-rr-link"></i></span>
                    <input type="url" class="form-control" name="urlImagen"
                      [(ngModel)]="producto.urlImagen"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      (input)="onCambioUrlImagen()" />
                    <button type="button" class="btn btn-outline-secondary"
                      *ngIf="producto.urlImagen"
                      (click)="producto.urlImagen=''; previsualizacionImagen=''">
                      <i class="fi fi-rr-cross-small"></i>
                    </button>
                  </div>
                  <div *ngIf="previsualizacionImagen" class="d-flex align-items-start gap-3 p-2 border rounded bg-light">
                    <img [src]="previsualizacionImagen" alt="Preview"
                      style="width:80px;height:80px;object-fit:cover;border-radius:8px;"
                      (error)="errorImagen=true; previsualizacionImagen=''" />
                    <div>
                      <small class="text-success fw-semibold"><i class="fi fi-rr-check me-1"></i>Imagen válida</small>
                      <br><small class="text-muted">{{ producto.urlImagen | slice:0:60 }}...</small>
                    </div>
                  </div>
                  <small class="text-muted">URL pública de la imagen del producto</small>
                </div>

                <!-- Descripción -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Descripción</label>
                  <textarea class="form-control" name="descripcion" rows="2"
                    [(ngModel)]="producto.descripcion"
                    placeholder="Descripción breve del producto (opcional)"></textarea>
                </div>

                <!-- Precio Oferta -->
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Precio Oferta <span class="text-muted fw-normal">(opcional)</span></label>
                    <div class="input-group">
                      <span class="input-group-text">S/</span>
                      <input type="number" class="form-control" name="precioVenta"
                        [(ngModel)]="producto.precioVenta" min="0" step="0.01" />
                    </div>
                    <small class="text-muted">Dejar en 0 si no hay precio de oferta</small>
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" (click)="cancelar()">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="!productForm.form.valid || guardando"
                  >
                    <span *ngIf="guardando" class="spinner-border spinner-border-sm me-2"></span>
                    {{ guardando ? 'Guardando...' : 'Guardar Producto' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  producto: any = {
    nombre: '',
    marca: '',
    categoriaId: 0,
    talla: '',
    precio: 0,
    precioVenta: 0,
    stock: 0,
    urlImagen: '',
    descripcion: '',
    activo: true
  };
  previsualizacionImagen = '';
  errorImagen = false;

  categorias: Categoria[] = [];
  modoEdicion = false;
  productoId: number = 0;
  guardando = false;

  ngOnInit(): void {
    this.cargarCategorias();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modoEdicion = true;
      this.productoId = +id;
      this.cargarProducto(this.productoId);
    }
  }

  cargarCategorias(): void {
    this.categoryService.obtenerCategorias().subscribe({
      next: (datos) => {
        this.categorias = datos;
      },
      error: (err: any) => console.error('Error cargando categorías:', err)
    });
  }

  cargarProducto(id: number): void {
    this.productService.obtenerProducto(id).subscribe({
      next: (datos) => {
        this.producto = datos;
      },
      error: (err: any) => console.error('Error cargando producto:', err)
    });
  }

  onSubmit(): void {
    this.guardando = true;

    if (this.modoEdicion) {
      this.productService.actualizarProducto(this.productoId, this.producto as ActualizarProducto).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err: any) => {
          console.error('Error actualizando producto:', err);
          this.guardando = false;
        }
      });
    } else {
      this.productService.crearProducto(this.producto as CrearProducto).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err: any) => {
          console.error('Error creando producto:', err);
          this.guardando = false;
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/products']);
  }

  onCambioUrlImagen(): void {
    this.errorImagen = false;
    const url = this.producto.urlImagen?.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      this.previsualizacionImagen = url;
    } else {
      this.previsualizacionImagen = '';
    }
  }
}
