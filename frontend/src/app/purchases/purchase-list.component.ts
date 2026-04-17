import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PurchaseService } from '../services/purchase.service';
import { Compra } from '../models/purchase.model';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Compras</h2>
        <a routerLink="/purchases/new" class="btn btn-primary">
          Nueva Compra
        </a>
      </div>

      <div class="card">
        <div class="card-body">
          <div *ngIf="loading" class="spinner-container">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>

          <div *ngIf="!loading && compras.length === 0" class="text-center py-5 text-muted">
            <h5>No se encontraron compras</h5>
            <p>Registre su primera compra para comenzar</p>
          </div>

          <div *ngIf="!loading && compras.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Compra #</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Nº Compra</th>
                  <th class="text-end">Total</th>
                  <th>Estado</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let compra of comprasPaginadas">
                  <td>{{ compra.id }}</td>
                  <td>{{ compra.fechaCompra | date:'dd/MM/yyyy HH:mm':'-0500' }}</td>
                  <td>{{ compra.nombreProveedor }}</td>
                  <td>{{ compra.numeroFactura }}</td>
                  <td class="text-end">{{ compra.total | currency }}</td>
                  <td>
                    <span class="badge bg-success">{{ compra.estado }}</span>
                  </td>
                  <td class="text-end">
                    <button (click)="verDetalles(compra)" class="btn btn-sm btn-outline-primary">
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
              {{ (paginaActual-1)*tamanoPagina+1 }}–{{ paginaActual*tamanoPagina > compras.length ? compras.length : paginaActual*tamanoPagina }} de {{ compras.length }}
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
      <div *ngIf="compraSeleccionada" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalles de Compra #{{ compraSeleccionada.id }}</h5>
              <button type="button" class="btn-close" (click)="cerrarDetalles()"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>Proveedor:</strong> {{ compraSeleccionada.nombreProveedor }}
                </div>
                <div class="col-md-6">
                  <strong>Fecha:</strong> {{ compraSeleccionada.fechaCompra | date:'dd/MM/yyyy HH:mm:ss':'-0500' }}
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>Nº Compra:</strong> {{ compraSeleccionada.numeroFactura }}
                </div>
                <div class="col-md-6">
                  <strong>Estado:</strong> <span class="badge bg-success">{{ compraSeleccionada.estado }}</span>
                </div>
              </div>
              <div class="row mb-3" *ngIf="compraSeleccionada.notas">
                <div class="col-md-12">
                  <strong>Notas:</strong> {{ compraSeleccionada.notas }}
                </div>
              </div>

              <h6 class="mb-3">Artículos:</h6>
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th class="text-end">Cantidad</th>
                    <th class="text-end">Costo Unitario</th>
                    <th class="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let detalle of compraSeleccionada.detalles">
                    <td>{{ detalle.nombreProducto }}</td>
                    <td class="text-end">{{ detalle.cantidad }}</td>
                    <td class="text-end">{{ detalle.costoUnitario | currency }}</td>
                    <td class="text-end">{{ detalle.subtotal | currency }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th colspan="3" class="text-end">Total:</th>
                    <th class="text-end">{{ compraSeleccionada.total | currency }}</th>
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
  `
})
export class PurchaseListComponent implements OnInit {
  private purchaseService = inject(PurchaseService);

  compras: Compra[] = [];
  comprasPaginadas: Compra[] = [];
  compraSeleccionada: Compra | null = null;
  loading = true;

  // Paginación
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 1;
  paginas: number[] = [];

  ngOnInit(): void {
    this.cargarCompras();
  }

  cargarCompras(): void {
    this.loading = true;
    this.purchaseService.obtenerCompras().subscribe({
      next: (datos) => {
        this.compras = datos;
        this.actualizarPaginacion();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar compras:', err);
        this.loading = false;
      }
    });
  }

  verDetalles(compra: Compra): void {
    this.compraSeleccionada = compra;
  }

  cerrarDetalles(): void {
    this.compraSeleccionada = null;
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.compras.length / this.tamanoPagina));
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas;
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    this.comprasPaginadas = this.compras.slice(inicio, inicio + this.tamanoPagina);
    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }
}
