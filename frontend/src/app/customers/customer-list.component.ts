import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { Cliente, CrearCliente } from '../models/customer.model';

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

      <!-- Panel de edición: solo visible en modo editar -->
      <div class="card mb-4" *ngIf="modoEdicion">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="fi fi-rr-pencil"></i> Editar Cliente</h5>
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="cancelarEdicion()">
            <i class="bi bi-x-lg"></i> Cerrar
          </button>
        </div>
        <div class="card-body">
          <form (ngSubmit)="onSubmit()" #customerForm="ngForm">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label">Nombre Completo *</label>
                <input type="text" class="form-control" name="nombreCompleto" [(ngModel)]="cliente.nombreCompleto" required />
              </div>
              <div class="col-md-3">
                <label class="form-label">Número de Documento *</label>
                <input type="text" class="form-control" name="numeroDocumento" [(ngModel)]="cliente.numeroDocumento" required />
              </div>
              <div class="col-md-2">
                <label class="form-label">Teléfono *</label>
                <input type="tel" class="form-control" name="telefono" [(ngModel)]="cliente.telefono" required />
              </div>
              <div class="col-md-2">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" name="correo" [(ngModel)]="cliente.correo" />
              </div>
              <div class="col-md-2 d-flex align-items-end gap-2">
                <button type="submit" class="btn btn-primary" [disabled]="!customerForm.form.valid || guardando">
                  {{ guardando ? 'Guardando...' : 'Actualizar' }}
                </button>
                <button type="button" class="btn btn-secondary" (click)="cancelarEdicion()">Cancelar</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="bi bi-list-ul"></i> Lista de Clientes</h5>
                <span class="badge bg-info">{{ clientesFiltrados.length }} registros</span>
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
                        [(ngModel)]="filtros.textoBusqueda"
                        (ngModelChange)="aplicarFiltros()"
                      />
                    </div>
                  </div>
                  <div class="col-md-3">
                    <select 
                      class="form-select" 
                      [(ngModel)]="filtros.tipoDocumento"
                      (ngModelChange)="aplicarFiltros()"
                    >
                      <option value="">Todos los documentos</option>
                      <option value="dni">DNI</option>
                      <option value="ruc">RUC</option>
                      <option value="ce">Carné de Extranjería</option>
                      <option value="passport">Pasaporte</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-secondary w-100" (click)="limpiarFiltros()">
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

              <div *ngIf="!loading && clientesFiltrados.length === 0" class="text-center py-5">
                <i class="bi bi-inbox" style="font-size: 3rem; color: var(--text-secondary);"></i>
                <p class="text-muted mt-3">No se encontraron clientes</p>
              </div>

              <div *ngIf="!loading && clientesFiltrados.length > 0" class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th style="cursor: pointer;" (click)="ordenarPor('nombreCompleto')">
                        Nombre Completo 
                        <i class="bi" [ngClass]="obtenerIconoOrden('nombreCompleto')"></i>
                      </th>
                      <th style="cursor: pointer;" (click)="ordenarPor('numeroDocumento')">
                        Documento 
                        <i class="bi" [ngClass]="obtenerIconoOrden('numeroDocumento')"></i>
                      </th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th class="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let cliente of clientesPaginados">
                      <td>
                        <strong><i class="bi bi-person-circle"></i> {{ cliente.nombreCompleto }}</strong>
                      </td>
                      <td>
                        <code>{{ cliente.numeroDocumento }}</code>
                        <span class="badge bg-light text-dark ms-2" *ngIf="obtenerTipoDocumento(cliente.numeroDocumento)">
                          {{ obtenerTipoDocumento(cliente.numeroDocumento) }}
                        </span>
                      </td>
                      <td>
                        <a [href]="'tel:' + cliente.telefono" class="text-decoration-none">
                          <i class="bi bi-telephone"></i> {{ cliente.telefono }}
                        </a>
                      </td>
                      <td>
                        <a [href]="'mailto:' + cliente.correo" class="text-decoration-none">
                          <i class="bi bi-envelope"></i> {{ cliente.correo }}
                        </a>
                      </td>
                      <td class="text-end">
                        <button (click)="editarCliente(cliente)" class="btn btn-sm btn-outline-primary me-2" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button (click)="eliminarCliente(cliente.id)" class="btn btn-sm btn-outline-danger" title="Eliminar">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Paginación -->
              <div *ngIf="totalPaginas > 1" class="d-flex justify-content-between align-items-center mt-3">
                <small class="text-muted">
                  {{ (paginaActual-1)*tamanoPagina+1 }}–{{ paginaActual*tamanoPagina > clientesFiltrados.length ? clientesFiltrados.length : paginaActual*tamanoPagina }} de {{ clientesFiltrados.length }}
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
    </div>
  `
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  clientesPaginados: Cliente[] = [];
  
  filtros = {
    textoBusqueda: '',
    tipoDocumento: ''
  };

  columnaOrden: string = '';
  direccionOrden: 'asc' | 'desc' = 'asc';

  // Paginación
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 1;
  paginas: number[] = [];

  cliente: CrearCliente = {
    nombreCompleto: '',
    numeroDocumento: '',
    telefono: '',
    correo: ''
  };
  loading = true;
  guardando = false;
  modoEdicion = false;
  editandoId = 0;

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;
    this.customerService.obtenerClientes().subscribe({
      next: (datos) => {
        this.clientes = datos;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando clientes:', err);
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.clientesFiltrados = this.clientes.filter(cliente => {
      const coincideBusqueda = !this.filtros.textoBusqueda || 
        cliente.nombreCompleto.toLowerCase().includes(this.filtros.textoBusqueda.toLowerCase()) ||
        cliente.numeroDocumento.toLowerCase().includes(this.filtros.textoBusqueda.toLowerCase()) ||
        cliente.telefono.toLowerCase().includes(this.filtros.textoBusqueda.toLowerCase()) ||
        cliente.correo.toLowerCase().includes(this.filtros.textoBusqueda.toLowerCase());

      const coincideTipoDoc = !this.filtros.tipoDocumento || 
        this.obtenerTipoDocumento(cliente.numeroDocumento)?.toLowerCase() === this.filtros.tipoDocumento;

      return coincideBusqueda && coincideTipoDoc;
    });
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  limpiarFiltros(): void {
    this.filtros = {
      textoBusqueda: '',
      tipoDocumento: ''
    };
    this.clientesFiltrados = this.clientes;
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  ordenarPor(columna: string): void {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
    }

    this.clientesFiltrados.sort((a: any, b: any) => {
      const aVal = a[columna] || '';
      const bVal = b[columna] || '';
      
      if (aVal < bVal) return this.direccionOrden === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.direccionOrden === 'asc' ? 1 : -1;
      return 0;
    });
    this.actualizarPaginacion();
  }

  obtenerIconoOrden(columna: string): string {
    if (this.columnaOrden !== columna) return 'bi-arrow-down-up';
    return this.direccionOrden === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.clientesFiltrados.length / this.tamanoPagina));
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas;
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    this.clientesPaginados = this.clientesFiltrados.slice(inicio, inicio + this.tamanoPagina);
    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  obtenerTipoDocumento(numeroDocumento: string): string | null {
    if (!numeroDocumento) return null;
    const longitud = numeroDocumento.length;
    
    if (longitud === 8 && /^\d+$/.test(numeroDocumento)) return 'DNI';
    if (longitud === 11 && /^\d+$/.test(numeroDocumento)) return 'RUC';
    if (longitud === 9 && /^\d+$/.test(numeroDocumento)) return 'CE';
    if (longitud >= 6 && longitud <= 12 && /^[A-Z0-9]+$/.test(numeroDocumento)) return 'Pasaporte';
    
    return null;
  }

  onSubmit(): void {
    this.guardando = true;

    if (this.modoEdicion) {
      this.customerService.actualizarCliente(this.editandoId, this.cliente).subscribe({
        next: () => {
          this.cargarClientes();
          this.resetFormulario();
        },
        error: (err: any) => {
          console.error('Error actualizando cliente:', err);
          this.guardando = false;
        }
      });
    } else {
      this.customerService.crearCliente(this.cliente).subscribe({
        next: () => {
          this.cargarClientes();
          this.resetFormulario();
        },
        error: (err: any) => {
          console.error('Error creando cliente:', err);
          this.guardando = false;
        }
      });
    }
  }

  editarCliente(cli: Cliente): void {
    this.modoEdicion = true;
    this.editandoId = cli.id;
    this.cliente = {
      nombreCompleto: cli.nombreCompleto,
      numeroDocumento: cli.numeroDocumento,
      telefono: cli.telefono,
      correo: cli.correo
    };
  }

  eliminarCliente(id: number): void {
    if (confirm('¿Está seguro que desea eliminar este cliente?')) {
      this.customerService.eliminarCliente(id).subscribe({
        next: () => {
          this.cargarClientes();
        },
        error: (err: any) => console.error('Error al eliminar cliente:', err)
      });
    }
  }

  cancelarEdicion(): void {
    this.resetFormulario();
  }

  resetFormulario(): void {
    this.cliente = {
      nombreCompleto: '',
      numeroDocumento: '',
      telefono: '',
      correo: ''
    };
    this.modoEdicion = false;
    this.editandoId = 0;
    this.guardando = false;
  }
}
