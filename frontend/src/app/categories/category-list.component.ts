import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../services/category.service';
import { AuthService } from '../services/auth.service';
import { Category, CreateCategory } from '../models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Categorías</h2>
      </div>

      <div class="row">
        <div class="col-md-8">
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
                    <th *ngIf="isAdmin" class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let category of categories">
                    <td>{{ category.name }}</td>
                    <td>{{ category.description }}</td>
                    <td>
                      <span class="badge" [class.bg-success]="category.isActive" [class.bg-secondary]="!category.isActive">
                        {{ category.isActive ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td *ngIf="isAdmin" class="text-end">
                      <button (click)="editCategory(category)" class="btn btn-sm btn-outline-primary me-2">
                        Editar
                      </button>
                      <button (click)="deleteCategory(category.id)" class="btn btn-sm btn-outline-danger">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col-md-4" *ngIf="isAdmin">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">{{ isEditMode ? 'Editar Categoría' : 'Agregar Nueva Categoría' }}</h5>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #categoryForm="ngForm">
                <div class="mb-3">
                  <label for="name" class="form-label">Nombre *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    name="name"
                    [(ngModel)]="category.name"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">Descripción</label>
                  <textarea
                    class="form-control"
                    id="description"
                    name="description"
                    [(ngModel)]="category.description"
                    rows="3"
                  ></textarea>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button
                    *ngIf="isEditMode"
                    type="button"
                    class="btn btn-secondary"
                    (click)="cancelEdit()"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="!categoryForm.form.valid || saving"
                  >
                    {{ saving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
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
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);

  categories: Category[] = [];
  category: CreateCategory = { name: '', description: '' };
  loading = true;
  saving = false;
  isEditMode = false;
  editingId = 0;
  isAdmin = this.authService.hasRole('Administrator');

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.saving = true;

    if (this.isEditMode) {
      this.categoryService.updateCategory(this.editingId, this.category).subscribe({
        next: () => {
          this.loadCategories();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating category:', error);
          this.saving = false;
        }
      });
    } else {
      this.categoryService.createCategory(this.category).subscribe({
        next: () => {
          this.loadCategories();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.saving = false;
        }
      });
    }
  }

  editCategory(category: Category): void {
    this.isEditMode = true;
    this.editingId = category.id;
    this.category = {
      name: category.name,
      description: category.description
    };
  }

  deleteCategory(id: number): void {
    if (confirm('¿Está seguro que desea eliminar esta categoría?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (error) => console.error('Error al eliminar categoría:', error)
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.category = { name: '', description: '' };
    this.isEditMode = false;
    this.editingId = 0;
    this.saving = false;
  }
}
