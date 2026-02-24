import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SaleService } from '../services/sale.service';
import { Sale } from '../models/sale.model';

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

          <div *ngIf="!loading && sales.length === 0" class="text-center py-5 text-muted">
            <h5>No se encontraron ventas</h5>
            <p>Cree su primera venta para comenzar</p>
          </div>

          <div *ngIf="!loading && sales.length > 0" class="table-responsive">
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
                <tr *ngFor="let sale of sales">
                  <td>{{ sale.id }}</td>
                  <td>{{ sale.saleDate | date:'short' }}</td>
                  <td>{{ sale.customerName }}</td>
                  <td class="text-end">{{ sale.total | currency }}</td>
                  <td>
                    <span class="payment-badge" [ngClass]="getPaymentBadgeClass(sale.paymentMethod)">
                      <i [ngClass]="getPaymentIcon(sale.paymentMethod)" class="me-1"></i>
                      {{ sale.paymentMethod }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-success">{{ sale.status }}</span>
                  </td>
                  <td class="text-end">
                    <button (click)="viewDetails(sale)" class="btn btn-sm btn-outline-primary">
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Sale Details Modal -->
      <div *ngIf="selectedSale" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalles de Venta #{{ selectedSale.id }}</h5>
              <button type="button" class="btn-close" (click)="closeDetails()"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>Cliente:</strong> {{ selectedSale.customerName }}
                </div>
                <div class="col-md-6">
                  <strong>Fecha:</strong> {{ selectedSale.saleDate | date:'medium' }}
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>Método de Pago:</strong>
                  <span class="payment-badge ms-2" [ngClass]="getPaymentBadgeClass(selectedSale.paymentMethod)">
                    <i [ngClass]="getPaymentIcon(selectedSale.paymentMethod)" class="me-1"></i>
                    {{ selectedSale.paymentMethod }}
                  </span>
                </div>
                <div class="col-md-6" *ngIf="selectedSale.transactionId">
                  <strong>ID de Transacción:</strong>
                  <code class="ms-2">{{ selectedSale.transactionId }}</code>
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
                  <tr *ngFor="let detail of selectedSale.details">
                    <td>{{ detail.productName }}</td>
                    <td class="text-end">{{ detail.quantity }}</td>
                    <td class="text-end">{{ detail.unitPrice | currency }}</td>
                    <td class="text-end">{{ detail.subtotal | currency }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th colspan="3" class="text-end">Total:</th>
                    <th class="text-end">{{ selectedSale.total | currency }}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeDetails()">
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

  sales: Sale[] = [];
  selectedSale: Sale | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.loading = true;
    this.saleService.getSales().subscribe({
      next: (data) => {
        this.sales = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        this.loading = false;
      }
    });
  }

  getPaymentIcon(paymentMethod: string): string {
    const icons: { [key: string]: string } = {
      'Efectivo': 'bi bi-cash-coin',
      'Tarjeta': 'bi bi-credit-card',
      'Yape': 'bi bi-phone',
      'Transferencia': 'bi bi-bank'
    };
    return icons[paymentMethod] || 'bi bi-question-circle';
  }

  getPaymentBadgeClass(paymentMethod: string): string {
    const classes: { [key: string]: string } = {
      'Efectivo': 'efectivo',
      'Tarjeta': 'tarjeta',
      'Yape': 'yape',
      'Transferencia': 'transferencia'
    };
    return classes[paymentMethod] || 'efectivo';
  }

  viewDetails(sale: Sale): void {
    this.selectedSale = sale;
  }

  closeDetails(): void {
    this.selectedSale = null;
  }
}
