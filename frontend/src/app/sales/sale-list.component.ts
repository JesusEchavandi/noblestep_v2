import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SaleService } from '../services/sale.service';
import { Venta } from '../models/sale.model';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Ventas</h2>
        <a routerLink="/sales/new" class="btn btn-primary">
          Nueva Venta
        </a>
      </div>

      <div class="card">
        <div class="card-body">
          <div *ngIf="loading" class="spinner-container">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>

          <div *ngIf="!loading && ventas.length === 0" class="text-center py-5 text-muted">
            <h5>No se encontraron ventas</h5>
            <p>Cree su primera venta para comenzar</p>
          </div>

          <div *ngIf="!loading && ventas.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Venta #</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th class="text-end">Total</th>
                  <th>Método de Pago</th>
                  <th>Estado</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let venta of ventasPaginadas">
                  <td>{{ venta.id }}</td>
                  <td>{{ venta.fechaVenta | date:'short' }}</td>
                  <td>{{ venta.nombreCliente }}</td>
                  <td class="text-end">{{ venta.total | currency }}</td>
                  <td>
                    <span class="payment-badge" [ngClass]="obtenerClaseBadgePago(venta.metodoPago)">
                      <i [ngClass]="obtenerIconoPago(venta.metodoPago)" class="me-1"></i>
                      {{ venta.metodoPago }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-success">{{ venta.estado }}</span>
                  </td>
                  <td class="text-end">
                    <button (click)="verDetalles(venta)" class="btn btn-sm btn-outline-primary">
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div *ngIf="totalPaginas > 1" class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">
              {{ (paginaActual-1)*tamanoPagina+1 }}–{{ paginaActual*tamanoPagina > ventas.length ? ventas.length : paginaActual*tamanoPagina }} de {{ ventas.length }}
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

      <!-- Modal Detalles de Venta -->
      <div *ngIf="ventaSeleccionada" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalles de Venta #{{ ventaSeleccionada.id }}</h5>
              <button type="button" class="btn-close" (click)="cerrarDetalles()"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>Cliente:</strong> {{ ventaSeleccionada.nombreCliente }}
                </div>
                <div class="col-md-6">
                  <strong>Fecha:</strong> {{ ventaSeleccionada.fechaVenta | date:'medium' }}
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>Método de Pago:</strong>
                  <span class="payment-badge ms-2" [ngClass]="obtenerClaseBadgePago(ventaSeleccionada.metodoPago)">
                    <i [ngClass]="obtenerIconoPago(ventaSeleccionada.metodoPago)" class="me-1"></i>
                    {{ ventaSeleccionada.metodoPago }}
                  </span>
                </div>
                <div class="col-md-6" *ngIf="ventaSeleccionada.idTransaccion">
                  <strong>ID de Transacción:</strong>
                  <code class="ms-2">{{ ventaSeleccionada.idTransaccion }}</code>
                </div>
              </div>

              <h6 class="mb-3">Artículos:</h6>
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th class="text-end">Cantidad</th>
                    <th class="text-end">Precio Unitario</th>
                    <th class="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let detalle of ventaSeleccionada.detalles">
                    <td>{{ detalle.nombreProducto }}</td>
                    <td class="text-end">{{ detalle.cantidad }}</td>
                    <td class="text-end">{{ detalle.precioUnitario | currency }}</td>
                    <td class="text-end">{{ detalle.subtotal | currency }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th colspan="3" class="text-end">Total:</th>
                    <th class="text-end">{{ ventaSeleccionada.total | currency }}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cerrarDetalles()">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      border: 1px solid;
    }

    .payment-badge.efectivo {
      background-color: rgba(153, 184, 152, 0.1);
      color: var(--color-success);
      border-color: var(--color-success);
    }

    .payment-badge.tarjeta {
      background-color: rgba(232, 74, 95, 0.1);
      color: var(--color-primary);
      border-color: var(--color-primary);
    }

    .payment-badge.yape {
      background-color: rgba(255, 132, 124, 0.1);
      color: var(--color-secondary);
      border-color: var(--color-secondary);
    }

    .payment-badge.transferencia {
      background-color: rgba(42, 54, 59, 0.1);
      color: var(--color-dark);
      border-color: var(--color-dark);
    }

    code {
      background-color: var(--color-gray-50);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      color: var(--color-dark);
    }
  `]
})
export class SaleListComponent implements OnInit {
  private saleService = inject(SaleService);

  ventas: Venta[] = [];
  ventasPaginadas: Venta[] = [];
  ventaSeleccionada: Venta | null = null;
  loading = true;

  // Paginación
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 1;
  paginas: number[] = [];

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.loading = true;
    this.saleService.obtenerVentas().subscribe({
      next: (datos) => {
        this.ventas = datos;
        this.actualizarPaginacion();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando ventas:', err);
        this.loading = false;
      }
    });
  }

  obtenerIconoPago(metodoPago: string): string {
    const iconos: { [key: string]: string } = {
      'Efectivo': 'bi bi-cash-coin',
      'Tarjeta': 'bi bi-credit-card',
      'Yape': 'bi bi-phone',
      'Transferencia': 'bi bi-bank'
    };
    return iconos[metodoPago] || 'bi bi-question-circle';
  }

  obtenerClaseBadgePago(metodoPago: string): string {
    const clases: { [key: string]: string } = {
      'Efectivo': 'efectivo',
      'Tarjeta': 'tarjeta',
      'Yape': 'yape',
      'Transferencia': 'transferencia'
    };
    return clases[metodoPago] || 'efectivo';
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.ventas.length / this.tamanoPagina));
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas;
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    this.ventasPaginadas = this.ventas.slice(inicio, inicio + this.tamanoPagina);
    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  verDetalles(venta: Venta): void {
    this.ventaSeleccionada = venta;
  }

  cerrarDetalles(): void {
    this.ventaSeleccionada = null;
  }
}
