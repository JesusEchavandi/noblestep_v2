import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PurchaseService } from '../services/purchase.service';
import { Purchase } from '../models/purchase.model';

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

          <div *ngIf="!loading && purchases.length === 0" class="text-center py-5 text-muted">
            <h5>No se encontraron compras</h5>
            <p>Registre su primera compra para comenzar</p>
          </div>

          <div *ngIf="!loading && purchases.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Compra #</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Nº Factura</th>
                  <th class="text-end">Total</th>
                  <th>Estado</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let purchase of purchases">
                  <td>{{ purchase.id }}</td>
                  <td>{{ purchase.purchaseDate | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ purchase.supplierName }}</td>
                  <td>{{ purchase.invoiceNumber }}</td>
                  <td class="text-end">{{ purchase.total | currency }}</td>
                  <td>
                    <span class="badge bg-success">{{ purchase.status }}</span>
                  </td>
                  <td class="text-end">
                    <button (click)="viewDetails(purchase)" class="btn btn-sm btn-outline-primary">
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Purchase Details Modal -->
      <div *ngIf="selectedPurchase" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalles de Compra #{{ selectedPurchase.id }}</h5>
              <button type="button" class="btn-close" (click)="closeDetails()"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>Proveedor:</strong> {{ selectedPurchase.supplierName }}
                </div>
                <div class="col-md-6">
                  <strong>Fecha:</strong> {{ selectedPurchase.purchaseDate | date:'dd/MM/yyyy HH:mm:ss' }}
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>Nº Factura:</strong> {{ selectedPurchase.invoiceNumber }}
                </div>
                <div class="col-md-6">
                  <strong>Estado:</strong> <span class="badge bg-success">{{ selectedPurchase.status }}</span>
                </div>
              </div>
              <div class="row mb-3" *ngIf="selectedPurchase.notes">
                <div class="col-md-12">
                  <strong>Notas:</strong> {{ selectedPurchase.notes }}
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
                  <tr *ngFor="let detail of selectedPurchase.details">
                    <td>{{ detail.productName }}</td>
                    <td class="text-end">{{ detail.quantity }}</td>
                    <td class="text-end">{{ detail.unitCost | currency }}</td>
                    <td class="text-end">{{ detail.subtotal | currency }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th colspan="3" class="text-end">Total:</th>
                    <th class="text-end">{{ selectedPurchase.total | currency }}</th>
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
  `
})
export class PurchaseListComponent implements OnInit {
  private purchaseService = inject(PurchaseService);

  purchases: Purchase[] = [];
  selectedPurchase: Purchase | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.loading = true;
    this.purchaseService.getPurchases().subscribe({
      next: (data) => {
        this.purchases = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar compras:', error);
        this.loading = false;
      }
    });
  }

  viewDetails(purchase: Purchase): void {
    this.selectedPurchase = purchase;
  }

  closeDetails(): void {
    this.selectedPurchase = null;
  }
}
