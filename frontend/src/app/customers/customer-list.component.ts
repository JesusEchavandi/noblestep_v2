import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { Customer, CreateCustomer } from '../models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-fluid">
      <div class="page-header mb-4">
        <h2><i class="bi bi-people"></i> Gestión de Clientes</h2>
        <p class="text-muted">Administra los clientes del sistema</p>
      </div>

      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="bi bi-list-ul"></i> Lista de Clientes</h5>
                <span class="badge bg-info">{{ filteredCustomers.length }} registros</span>
              </div>
            </div>
            <div class="card-body">
              <!-- Filtros -->
              <div class="filters-section mb-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-search"></i></span>
                      <input 
                        type="text" 
                        class="form-control" 
                        placeholder="Buscar por nombre, documento, teléfono o email..."
                        [(ngModel)]="filters.searchText"
                        (ngModelChange)="applyFilters()"
                      />
                    </div>
                  </div>
                  <div class="col-md-3">
                    <select 
                      class="form-select" 
                      [(ngModel)]="filters.documentType"
                      (ngModelChange)="applyFilters()"
                    >
                      <option value="">Todos los documentos</option>
                      <option value="dni">DNI</option>
                      <option value="ruc">RUC</option>
                      <option value="ce">Carné de Extranjería</option>
                      <option value="passport">Pasaporte</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-secondary w-100" (click)="clearFilters()">
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

              <div *ngIf="!loading && filteredCustomers.length === 0" class="text-center py-5">
                <i class="bi bi-inbox" style="font-size: 3rem; color: var(--text-secondary);"></i>
                <p class="text-muted mt-3">No se encontraron clientes</p>
              </div>

              <div *ngIf="!loading && filteredCustomers.length > 0" class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th style="cursor: pointer;" (click)="sortBy('fullName')">
                        Nombre Completo 
                        <i class="bi" [ngClass]="getSortIcon('fullName')"></i>
                      </th>
                      <th style="cursor: pointer;" (click)="sortBy('documentNumber')">
                        Documento 
                        <i class="bi" [ngClass]="getSortIcon('documentNumber')"></i>
                      </th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th class="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let customer of filteredCustomers">
                      <td>
                        <strong><i class="bi bi-person-circle"></i> {{ customer.fullName }}</strong>
                      </td>
                      <td>
                        <code>{{ customer.documentNumber }}</code>
                        <span class="badge bg-light text-dark ms-2" *ngIf="getDocumentType(customer.documentNumber)">
                          {{ getDocumentType(customer.documentNumber) }}
                        </span>
                      </td>
                      <td>
                        <a [href]="'tel:' + customer.phone" class="text-decoration-none">
                          <i class="bi bi-telephone"></i> {{ customer.phone }}
                        </a>
                      </td>
                      <td>
                        <a [href]="'mailto:' + customer.email" class="text-decoration-none">
                          <i class="bi bi-envelope"></i> {{ customer.email }}
                        </a>
                      </td>
                      <td class="text-end">
                        <button (click)="editCustomer(customer)" class="btn btn-sm btn-outline-primary me-2" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button (click)="deleteCustomer(customer.id)" class="btn btn-sm btn-outline-danger" title="Eliminar">
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

        <!-- Panel de edición: solo visible en modo editar -->
        <div class="col-md-4" *ngIf="isEditMode">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0"><i class="fi fi-rr-pencil"></i> Editar Cliente</h5>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #customerForm="ngForm">
                <div class="mb-3">
                  <label class="form-label">Nombre Completo *</label>
                  <input type="text" class="form-control" name="fullName" [(ngModel)]="customer.fullName" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Número de Documento *</label>
                  <input type="text" class="form-control" name="documentNumber" [(ngModel)]="customer.documentNumber" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Teléfono *</label>
                  <input type="tel" class="form-control" name="phone" [(ngModel)]="customer.phone" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" name="email" [(ngModel)]="customer.email" />
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" (click)="cancelEdit()">Cancelar</button>
                  <button type="submit" class="btn btn-primary" [disabled]="!customerForm.form.valid || saving">
                    {{ saving ? 'Guardando...' : 'Actualizar' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Info: crear clientes desde Ventas -->
        <div class="col-md-4" *ngIf="!isEditMode">
          <div class="card border-0" style="background: var(--color-gray-50);">
            <div class="card-body text-center py-5">
              <i class="fi fi-rr-user-add" style="font-size: 3rem; color: var(--color-primary); opacity: 0.5;"></i>
              <h6 class="mt-3 fw-bold">¿Nuevo cliente?</h6>
              <p class="text-muted small">Los nuevos clientes se crean directamente al registrar una venta. Puedes buscar por DNI y el sistema completará los datos automáticamente.</p>
              <a routerLink="/sales/new" class="btn btn-primary btn-sm">
                <i class="fi fi-rr-add"></i> Nueva Venta
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);

  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  
  filters = {
    searchText: '',
    documentType: ''
  };

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  customer: CreateCustomer = {
    fullName: '',
    documentNumber: '',
    phone: '',
    email: ''
  };
  loading = true;
  saving = false;
  isEditMode = false;
  editingId = 0;

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.filteredCustomers = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredCustomers = this.customers.filter(customer => {
      // Search text filter
      const searchMatch = !this.filters.searchText || 
        customer.fullName.toLowerCase().includes(this.filters.searchText.toLowerCase()) ||
        customer.documentNumber.toLowerCase().includes(this.filters.searchText.toLowerCase()) ||
        customer.phone.toLowerCase().includes(this.filters.searchText.toLowerCase()) ||
        customer.email.toLowerCase().includes(this.filters.searchText.toLowerCase());

      // Document type filter
      const docTypeMatch = !this.filters.documentType || 
        this.getDocumentType(customer.documentNumber)?.toLowerCase() === this.filters.documentType;

      return searchMatch && docTypeMatch;
    });
  }

  clearFilters(): void {
    this.filters = {
      searchText: '',
      documentType: ''
    };
    this.filteredCustomers = this.customers;
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredCustomers.sort((a: any, b: any) => {
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

  getDocumentType(documentNumber: string): string | null {
    if (!documentNumber) return null;
    const length = documentNumber.length;
    
    if (length === 8 && /^\d+$/.test(documentNumber)) return 'DNI';
    if (length === 11 && /^\d+$/.test(documentNumber)) return 'RUC';
    if (length === 9 && /^\d+$/.test(documentNumber)) return 'CE';
    if (length >= 6 && length <= 12 && /^[A-Z0-9]+$/.test(documentNumber)) return 'Pasaporte';
    
    return null;
  }

  onSubmit(): void {
    this.saving = true;

    if (this.isEditMode) {
      this.customerService.updateCustomer(this.editingId, this.customer).subscribe({
        next: () => {
          this.loadCustomers();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating customer:', error);
          this.saving = false;
        }
      });
    } else {
      this.customerService.createCustomer(this.customer).subscribe({
        next: () => {
          this.loadCustomers();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating customer:', error);
          this.saving = false;
        }
      });
    }
  }

  editCustomer(customer: Customer): void {
    this.isEditMode = true;
    this.editingId = customer.id;
    this.customer = {
      fullName: customer.fullName,
      documentNumber: customer.documentNumber,
      phone: customer.phone,
      email: customer.email
    };
  }

  deleteCustomer(id: number): void {
    if (confirm('¿Está seguro que desea eliminar este cliente?')) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.loadCustomers();
        },
        error: (error) => console.error('Error al eliminar cliente:', error)
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.customer = {
      fullName: '',
      documentNumber: '',
      phone: '',
      email: ''
    };
    this.isEditMode = false;
    this.editingId = 0;
    this.saving = false;
  }
}
