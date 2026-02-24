import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../services/supplier.service';
import { AuthService } from '../services/auth.service';
import { Supplier, CreateSupplier } from '../models/supplier.model';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="page-header mb-4">
        <h2><i class="bi bi-truck"></i> Gestión de Proveedores</h2>
        <p class="text-muted">Administra los proveedores del sistema</p>
      </div>

      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="bi bi-list-ul"></i> Lista de Proveedores</h5>
                <span class="badge bg-info">{{ filteredSuppliers.length }} registros</span>
              </div>
            </div>
            <div class="card-body">
              <!-- Filtros -->
              <div class="filters-section mb-4">
                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-search"></i></span>
                      <input 
                        type="text" 
                        class="form-control" 
                        placeholder="Buscar por empresa o contacto..."
                        [(ngModel)]="filters.searchText"
                        (ngModelChange)="applyFilters()"
                      />
                    </div>
                  </div>
                  <div class="col-md-3">
                    <select 
                      class="form-select" 
                      [(ngModel)]="filters.city"
                      (ngModelChange)="applyFilters()"
                    >
                      <option value="">Todas las ciudades</option>
                      <option *ngFor="let city of cities" [value]="city">{{ city }}</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <select 
                      class="form-select" 
                      [(ngModel)]="filters.country"
                      (ngModelChange)="applyFilters()"
                    >
                      <option value="">Todos los países</option>
                      <option *ngFor="let country of countries" [value]="country">{{ country }}</option>
                    </select>
                  </div>
                  <div class="col-md-2">
                    <select 
                      class="form-select" 
                      [(ngModel)]="filters.status"
                      (ngModelChange)="applyFilters()"
                    >
                      <option value="">Todos</option>
                      <option value="active">Activos</option>
                      <option value="inactive">Inactivos</option>
                    </select>
                  </div>
                </div>
                <div class="row mt-2">
                  <div class="col-12">
                    <button class="btn btn-sm btn-outline-secondary" (click)="clearFilters()">
                      <i class="bi bi-x-circle"></i> Limpiar filtros
                    </button>
                  </div>
                </div>
              </div>

              <div *ngIf="loading" class="spinner-container">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
              </div>

              <div *ngIf="!loading && filteredSuppliers.length === 0" class="text-center py-5">
                <i class="bi bi-inbox" style="font-size: 3rem; color: var(--text-secondary);"></i>
                <p class="text-muted mt-3">No se encontraron proveedores</p>
              </div>

              <div *ngIf="!loading && filteredSuppliers.length > 0" class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th style="cursor: pointer;" (click)="sortBy('companyName')">
                        Empresa 
                        <i class="bi" [ngClass]="getSortIcon('companyName')"></i>
                      </th>
                      <th style="cursor: pointer;" (click)="sortBy('contactName')">
                        Contacto 
                        <i class="bi" [ngClass]="getSortIcon('contactName')"></i>
                      </th>
                      <th>RUC/Documento</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th style="cursor: pointer;" (click)="sortBy('city')">
                        Ciudad 
                        <i class="bi" [ngClass]="getSortIcon('city')"></i>
                      </th>
                      <th>Estado</th>
                      <th *ngIf="isAdmin" class="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let supplier of filteredSuppliers">
                      <td>
                        <strong>{{ supplier.companyName }}</strong>
                      </td>
                      <td>{{ supplier.contactName }}</td>
                      <td>
                        <code>{{ supplier.documentNumber }}</code>
                      </td>
                      <td>
                        <a [href]="'tel:' + supplier.phone" class="text-decoration-none">
                          <i class="bi bi-telephone"></i> {{ supplier.phone }}
                        </a>
                      </td>
                      <td>
                        <a [href]="'mailto:' + supplier.email" class="text-decoration-none">
                          <i class="bi bi-envelope"></i> {{ supplier.email }}
                        </a>
                      </td>
                      <td>
                        <i class="bi bi-geo-alt"></i> {{ supplier.city || 'N/A' }}
                      </td>
                      <td>
                        <span class="badge" [class.bg-success]="supplier.isActive" [class.bg-secondary]="!supplier.isActive">
                          {{ supplier.isActive ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td *ngIf="isAdmin" class="text-end">
                        <button (click)="editSupplier(supplier)" class="btn btn-sm btn-outline-primary me-2" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button (click)="deleteSupplier(supplier.id)" class="btn btn-sm btn-outline-danger" title="Eliminar">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4" *ngIf="isAdmin">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">{{ isEditMode ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor' }}</h5>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #supplierForm="ngForm">
                <div class="mb-3">
                  <label for="companyName" class="form-label">Nombre de Empresa *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="companyName"
                    name="companyName"
                    [(ngModel)]="supplier.companyName"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label for="contactName" class="form-label">Nombre de Contacto *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="contactName"
                    name="contactName"
                    [(ngModel)]="supplier.contactName"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label for="documentNumber" class="form-label">RUC/Documento *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="documentNumber"
                    name="documentNumber"
                    [(ngModel)]="supplier.documentNumber"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label for="phone" class="form-label">Teléfono *</label>
                  <input
                    type="tel"
                    class="form-control"
                    id="phone"
                    name="phone"
                    [(ngModel)]="supplier.phone"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email *</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    name="email"
                    [(ngModel)]="supplier.email"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label for="address" class="form-label">Dirección</label>
                  <input
                    type="text"
                    class="form-control"
                    id="address"
                    name="address"
                    [(ngModel)]="supplier.address"
                  />
                </div>

                <div class="mb-3">
                  <label for="city" class="form-label">Ciudad</label>
                  <input
                    type="text"
                    class="form-control"
                    id="city"
                    name="city"
                    [(ngModel)]="supplier.city"
                  />
                </div>

                <div class="mb-3">
                  <label for="country" class="form-label">País</label>
                  <input
                    type="text"
                    class="form-control"
                    id="country"
                    name="country"
                    [(ngModel)]="supplier.country"
                  />
                </div>

                <div class="mb-3" *ngIf="isEditMode">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      [(ngModel)]="supplier.isActive"
                    />
                    <label class="form-check-label" for="isActive">
                      Activo
                    </label>
                  </div>
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
                    [disabled]="!supplierForm.form.valid || saving"
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
export class SupplierListComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private authService = inject(AuthService);

  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  cities: string[] = [];
  countries: string[] = [];
  
  filters = {
    searchText: '',
    city: '',
    country: '',
    status: ''
  };

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  supplier: any = {
    companyName: '',
    contactName: '',
    documentNumber: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    isActive: true
  };
  loading = true;
  saving = false;
  isEditMode = false;
  editingId = 0;
  isAdmin = this.authService.hasRole('Administrator');

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.filteredSuppliers = data;
        this.extractFilterOptions();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        this.loading = false;
      }
    });
  }

  extractFilterOptions(): void {
    // Extract unique cities
    const citySet = new Set(this.suppliers
      .map(s => s.city)
      .filter(city => city && city.trim() !== ''));
    this.cities = Array.from(citySet).sort();

    // Extract unique countries
    const countrySet = new Set(this.suppliers
      .map(s => s.country)
      .filter(country => country && country.trim() !== ''));
    this.countries = Array.from(countrySet).sort();
  }

  applyFilters(): void {
    this.filteredSuppliers = this.suppliers.filter(supplier => {
      // Search text filter
      const searchMatch = !this.filters.searchText || 
        supplier.companyName.toLowerCase().includes(this.filters.searchText.toLowerCase()) ||
        supplier.contactName.toLowerCase().includes(this.filters.searchText.toLowerCase()) ||
        supplier.documentNumber.toLowerCase().includes(this.filters.searchText.toLowerCase()) ||
        supplier.email.toLowerCase().includes(this.filters.searchText.toLowerCase());

      // City filter
      const cityMatch = !this.filters.city || supplier.city === this.filters.city;

      // Country filter
      const countryMatch = !this.filters.country || supplier.country === this.filters.country;

      // Status filter
      const statusMatch = !this.filters.status || 
        (this.filters.status === 'active' && supplier.isActive) ||
        (this.filters.status === 'inactive' && !supplier.isActive);

      return searchMatch && cityMatch && countryMatch && statusMatch;
    });
  }

  clearFilters(): void {
    this.filters = {
      searchText: '',
      city: '',
      country: '',
      status: ''
    };
    this.filteredSuppliers = this.suppliers;
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredSuppliers.sort((a: any, b: any) => {
      const aVal = a[column] || '';
      const bVal = b[column] || '';
      
      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'bi-arrow-down-up';
    return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  onSubmit(): void {
    if (this.saving) return;
    
    this.saving = true;

    if (this.isEditMode) {
      this.supplierService.updateSupplier(this.editingId, this.supplier).subscribe({
        next: () => {
          alert('✅ Proveedor actualizado correctamente');
          this.loadSuppliers();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error al actualizar proveedor:', error);
          const errorMsg = error?.error?.message || error?.message || 'Error al actualizar el proveedor';
          alert('❌ Error: ' + errorMsg);
          this.saving = false;
        }
      });
    } else {
      this.supplierService.createSupplier(this.supplier).subscribe({
        next: () => {
          alert('✅ Proveedor creado correctamente');
          this.loadSuppliers();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error al crear proveedor:', error);
          const errorMsg = error?.error?.message || error?.message || 'Error al crear el proveedor';
          alert('❌ Error: ' + errorMsg);
          this.saving = false;
        }
      });
    }
  }

  editSupplier(supplier: Supplier): void {
    this.isEditMode = true;
    this.editingId = supplier.id;
    this.supplier = {
      companyName: supplier.companyName,
      contactName: supplier.contactName,
      documentNumber: supplier.documentNumber,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      city: supplier.city,
      country: supplier.country,
      isActive: supplier.isActive
    };
  }

  deleteSupplier(id: number): void {
    if (confirm('¿Está seguro que desea eliminar este proveedor?')) {
      this.supplierService.deleteSupplier(id).subscribe({
        next: () => {
          alert('✅ Proveedor eliminado correctamente');
          this.loadSuppliers();
        },
        error: (error) => {
          console.error('Error al eliminar proveedor:', error);
          const errorMsg = error?.error?.message || error?.message || 'Error al eliminar el proveedor';
          alert('❌ Error: ' + errorMsg);
        }
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.supplier = {
      companyName: '',
      contactName: '',
      documentNumber: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: '',
      isActive: true
    };
    this.isEditMode = false;
    this.editingId = 0;
    this.saving = false;
  }
}
