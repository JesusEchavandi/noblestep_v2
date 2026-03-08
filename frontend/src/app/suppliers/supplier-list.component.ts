import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../services/supplier.service';
import { AuthService } from '../services/auth.service';
import { Proveedor, CrearProveedor } from '../models/supplier.model';

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
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="bi bi-list-ul"></i> Lista de Proveedores</h5>
                <span class="badge bg-info">{{ proveedoresFiltrados.length }} registros</span>
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
                        [(ngModel)]="filtros.textoBusqueda"
                        (ngModelChange)="aplicarFiltros()"
                      />
                    </div>
                  </div>
                  <div class="col-md-3">
                    <select 
                      class="form-select" 
                      [(ngModel)]="filtros.ciudad"
                      (ngModelChange)="aplicarFiltros()"
                    >
                      <option value="">Todas las ciudades</option>
                      <option *ngFor="let ciudad of ciudades" [value]="ciudad">{{ ciudad }}</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <select 
                      class="form-select" 
                      [(ngModel)]="filtros.pais"
                      (ngModelChange)="aplicarFiltros()"
                    >
                      <option value="">Todos los países</option>
                      <option *ngFor="let pais of paises" [value]="pais">{{ pais }}</option>
                    </select>
                  </div>
                  <div class="col-md-2">
                    <select 
                      class="form-select" 
                      [(ngModel)]="filtros.estado"
                      (ngModelChange)="aplicarFiltros()"
                    >
                      <option value="">Todos</option>
                      <option value="active">Activos</option>
                      <option value="inactive">Inactivos</option>
                    </select>
                  </div>
                </div>
                <div class="row mt-2">
                  <div class="col-12">
                    <button class="btn btn-sm btn-outline-secondary" (click)="limpiarFiltros()">
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

              <div *ngIf="!loading && proveedoresFiltrados.length === 0" class="text-center py-5">
                <i class="bi bi-inbox" style="font-size: 3rem; color: var(--text-secondary);"></i>
                <p class="text-muted mt-3">No se encontraron proveedores</p>
              </div>

              <div *ngIf="!loading && proveedoresFiltrados.length > 0" class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th style="cursor: pointer;" (click)="ordenarPor('nombreEmpresa')">
                        Empresa 
                        <i class="bi" [ngClass]="obtenerIconoOrden('nombreEmpresa')"></i>
                      </th>
                      <th style="cursor: pointer;" (click)="ordenarPor('nombreContacto')">
                        Contacto 
                        <i class="bi" [ngClass]="obtenerIconoOrden('nombreContacto')"></i>
                      </th>
                      <th>RUC/Documento</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th style="cursor: pointer;" (click)="ordenarPor('ciudad')">
                        Ciudad 
                        <i class="bi" [ngClass]="obtenerIconoOrden('ciudad')"></i>
                      </th>
                      <th>Estado</th>
                      <th *ngIf="esAdmin" class="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let prov of proveedoresPaginados">
                      <td>
                        <strong>{{ prov.nombreEmpresa }}</strong>
                      </td>
                      <td>{{ prov.nombreContacto }}</td>
                      <td>
                        <code>{{ prov.numeroDocumento }}</code>
                      </td>
                      <td>
                        <a [href]="'tel:' + prov.telefono" class="text-decoration-none">
                          <i class="bi bi-telephone"></i> {{ prov.telefono }}
                        </a>
                      </td>
                      <td>
                        <a [href]="'mailto:' + prov.correo" class="text-decoration-none">
                          <i class="bi bi-envelope"></i> {{ prov.correo }}
                        </a>
                      </td>
                      <td>
                        <i class="bi bi-geo-alt"></i> {{ prov.ciudad || 'N/A' }}
                      </td>
                      <td>
                        <span class="badge" [class.bg-success]="prov.activo" [class.bg-secondary]="!prov.activo">
                          {{ prov.activo ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td *ngIf="esAdmin" class="text-end">
                        <button (click)="editarProveedor(prov)" class="btn btn-sm btn-outline-primary me-2" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button (click)="eliminarProveedor(prov.id)" class="btn btn-sm btn-outline-danger" title="Eliminar">
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
                  {{ (paginaActual-1)*tamanoPagina+1 }}–{{ paginaActual*tamanoPagina > proveedoresFiltrados.length ? proveedoresFiltrados.length : paginaActual*tamanoPagina }} de {{ proveedoresFiltrados.length }}
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

      <!-- Formulario crear/editar (debajo, ancho completo) -->
      <div class="card mt-4" *ngIf="esAdmin">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">{{ modoEdicion ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor' }}</h5>
          <button *ngIf="modoEdicion" type="button" class="btn btn-sm btn-outline-secondary" (click)="cancelarEdicion()">
            <i class="bi bi-x-lg"></i> Cancelar
          </button>
        </div>
        <div class="card-body">
          <form (ngSubmit)="onSubmit()" #supplierForm="ngForm">
            <div class="row g-3">
              <div class="col-md-3">
                <label for="nombreEmpresa" class="form-label">Nombre de Empresa *</label>
                <input type="text" class="form-control" id="nombreEmpresa" name="nombreEmpresa"
                  [(ngModel)]="proveedor.nombreEmpresa" required />
              </div>
              <div class="col-md-3">
                <label for="nombreContacto" class="form-label">Nombre de Contacto *</label>
                <input type="text" class="form-control" id="nombreContacto" name="nombreContacto"
                  [(ngModel)]="proveedor.nombreContacto" required />
              </div>
              <div class="col-md-2">
                <label for="numeroDocumento" class="form-label">RUC/Documento *</label>
                <input type="text" class="form-control" id="numeroDocumento" name="numeroDocumento"
                  [(ngModel)]="proveedor.numeroDocumento" required />
              </div>
              <div class="col-md-2">
                <label for="telefono" class="form-label">Teléfono *</label>
                <input type="tel" class="form-control" id="telefono" name="telefono"
                  [(ngModel)]="proveedor.telefono" required />
              </div>
              <div class="col-md-2">
                <label for="correo" class="form-label">Email *</label>
                <input type="email" class="form-control" id="correo" name="correo"
                  [(ngModel)]="proveedor.correo" required />
              </div>
              <div class="col-md-3">
                <label for="direccion" class="form-label">Dirección</label>
                <input type="text" class="form-control" id="direccion" name="direccion"
                  [(ngModel)]="proveedor.direccion" />
              </div>
              <div class="col-md-2">
                <label for="ciudad" class="form-label">Ciudad</label>
                <input type="text" class="form-control" id="ciudad" name="ciudad"
                  [(ngModel)]="proveedor.ciudad" />
              </div>
              <div class="col-md-2">
                <label for="pais" class="form-label">País</label>
                <input type="text" class="form-control" id="pais" name="pais"
                  [(ngModel)]="proveedor.pais" />
              </div>
              <div class="col-md-2" *ngIf="modoEdicion">
                <label class="form-label">&nbsp;</label>
                <div class="form-check mt-2">
                  <input class="form-check-input" type="checkbox" id="activo" name="activo"
                    [(ngModel)]="proveedor.activo" />
                  <label class="form-check-label" for="activo">Activo</label>
                </div>
              </div>
              <div class="col-md-3 d-flex align-items-end gap-2">
                <button *ngIf="modoEdicion" type="button" class="btn btn-secondary" (click)="cancelarEdicion()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="!supplierForm.form.valid || guardando">
                  {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class SupplierListComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private authService = inject(AuthService);

  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  proveedoresPaginados: Proveedor[] = [];
  ciudades: string[] = [];
  paises: string[] = [];
  
  filtros = {
    textoBusqueda: '',
    ciudad: '',
    pais: '',
    estado: ''
  };

  columnaOrden: string = '';
  direccionOrden: 'asc' | 'desc' = 'asc';

  // Paginación
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 1;
  paginas: number[] = [];

  proveedor: any = {
    nombreEmpresa: '',
    nombreContacto: '',
    numeroDocumento: '',
    telefono: '',
    correo: '',
    direccion: '',
    ciudad: '',
    pais: '',
    activo: true
  };
  loading = true;
  guardando = false;
  modoEdicion = false;
  editandoId = 0;
  esAdmin = this.authService.tieneRol('Administrador');

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.loading = true;
    this.supplierService.obtenerProveedores().subscribe({
      next: (datos) => {
        this.proveedores = datos;
        this.aplicarFiltros();
        this.extraerOpcionesFiltro();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar proveedores:', err);
        this.loading = false;
      }
    });
  }

  extraerOpcionesFiltro(): void {
    const setCiudades = new Set(this.proveedores
      .map(s => s.ciudad)
      .filter(c => c && c.trim() !== ''));
    this.ciudades = Array.from(setCiudades).sort();

    const setPaises = new Set(this.proveedores
      .map(s => s.pais)
      .filter(p => p && p.trim() !== ''));
    this.paises = Array.from(setPaises).sort();
  }

  aplicarFiltros(): void {
    this.proveedoresFiltrados = this.proveedores.filter(prov => {
      const coincideBusqueda = !this.filtros.textoBusqueda || 
        prov.nombreEmpresa.toLowerCase().includes(this.filtros.textoBusqueda.toLowerCase()) ||
        prov.nombreContacto.toLowerCase().includes(this.filtros.textoBusqueda.toLowerCase()) ||
        prov.numeroDocumento.toLowerCase().includes(this.filtros.textoBusqueda.toLowerCase()) ||
        prov.correo.toLowerCase().includes(this.filtros.textoBusqueda.toLowerCase());

      const coincideCiudad = !this.filtros.ciudad || prov.ciudad === this.filtros.ciudad;
      const coincidePais = !this.filtros.pais || prov.pais === this.filtros.pais;
      const coincideEstado = !this.filtros.estado || 
        (this.filtros.estado === 'active' && prov.activo) ||
        (this.filtros.estado === 'inactive' && !prov.activo);

      return coincideBusqueda && coincideCiudad && coincidePais && coincideEstado;
    });
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  limpiarFiltros(): void {
    this.filtros = { textoBusqueda: '', ciudad: '', pais: '', estado: '' };
    this.proveedoresFiltrados = this.proveedores;
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
    this.proveedoresFiltrados.sort((a: any, b: any) => {
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
    this.totalPaginas = Math.max(1, Math.ceil(this.proveedoresFiltrados.length / this.tamanoPagina));
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas;
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    this.proveedoresPaginados = this.proveedoresFiltrados.slice(inicio, inicio + this.tamanoPagina);
    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  onSubmit(): void {
    if (this.guardando) return;
    this.guardando = true;

    if (this.modoEdicion) {
      this.supplierService.actualizarProveedor(this.editandoId, this.proveedor).subscribe({
        next: () => {
          alert('✅ Proveedor actualizado correctamente');
          this.cargarProveedores();
          this.resetFormulario();
        },
        error: (err: any) => {
          console.error('Error al actualizar proveedor:', err);
          alert('❌ Error: ' + (err?.error?.message || 'Error al actualizar el proveedor'));
          this.guardando = false;
        }
      });
    } else {
      this.supplierService.crearProveedor(this.proveedor).subscribe({
        next: () => {
          alert('✅ Proveedor creado correctamente');
          this.cargarProveedores();
          this.resetFormulario();
        },
        error: (err: any) => {
          console.error('Error al crear proveedor:', err);
          alert('❌ Error: ' + (err?.error?.message || 'Error al crear el proveedor'));
          this.guardando = false;
        }
      });
    }
  }

  editarProveedor(prov: Proveedor): void {
    this.modoEdicion = true;
    this.editandoId = prov.id;
    this.proveedor = {
      nombreEmpresa: prov.nombreEmpresa,
      nombreContacto: prov.nombreContacto,
      numeroDocumento: prov.numeroDocumento,
      telefono: prov.telefono,
      correo: prov.correo,
      direccion: prov.direccion,
      ciudad: prov.ciudad,
      pais: prov.pais,
      activo: prov.activo
    };
  }

  eliminarProveedor(id: number): void {
    if (confirm('¿Está seguro que desea eliminar este proveedor?')) {
      this.supplierService.eliminarProveedor(id).subscribe({
        next: () => {
          alert('✅ Proveedor eliminado correctamente');
          this.cargarProveedores();
        },
        error: (err: any) => {
          alert('❌ Error: ' + (err?.error?.message || 'Error al eliminar el proveedor'));
        }
      });
    }
  }

  cancelarEdicion(): void {
    this.resetFormulario();
  }

  resetFormulario(): void {
    this.proveedor = {
      nombreEmpresa: '', nombreContacto: '', numeroDocumento: '',
      telefono: '', correo: '', direccion: '', ciudad: '', pais: '', activo: true
    };
    this.modoEdicion = false;
    this.editandoId = 0;
    this.guardando = false;
  }
}
