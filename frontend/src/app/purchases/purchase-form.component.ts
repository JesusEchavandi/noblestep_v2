import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseService } from '../services/purchase.service';
import { SupplierService } from '../services/supplier.service';
import { ProductService } from '../services/product.service';
import { CreatePurchase } from '../models/purchase.model';
import { Supplier } from '../models/supplier.model';
import { Product, ProductVariant } from '../models/product.model';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-md-10">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">Nueva Compra</h4>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #purchaseForm="ngForm">
                <div class="row mb-4">
                  <div class="col-md-4">
                    <label for="supplierId" class="form-label">Proveedor *</label>
                    <select
                      class="form-select"
                      id="supplierId"
                      name="supplierId"
                      [(ngModel)]="purchase.supplierId"
                      required
                    >
                      <option [ngValue]="0" disabled>Seleccione un proveedor</option>
                      <option *ngFor="let supplier of suppliers" [ngValue]="supplier.id">
                        {{ supplier.companyName }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-4">
                    <label for="invoiceNumber" class="form-label">Nº Factura *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="invoiceNumber"
                      name="invoiceNumber"
                      [(ngModel)]="purchase.invoiceNumber"
                      required
                      placeholder="F001-00001"
                    />
                  </div>

                  <div class="col-md-4">
                    <label for="purchaseDate" class="form-label">Fecha de Compra *</label>
                    <input
                      type="datetime-local"
                      class="form-control"
                      id="purchaseDate"
                      name="purchaseDate"
                      [(ngModel)]="purchaseDateStr"
                      required
                    />
                  </div>
                </div>

                <div class="mb-4">
                  <label for="notes" class="form-label">Notas</label>
                  <textarea
                    class="form-control"
                    id="notes"
                    name="notes"
                    [(ngModel)]="purchase.notes"
                    rows="2"
                    placeholder="Notas adicionales sobre la compra..."
                  ></textarea>
                </div>

                <h5 class="mb-3">Artículos de Compra</h5>

                <div *ngFor="let item of purchaseItems; let i = index" class="card mb-3 border-primary">
                  <div class="card-body">
                    <div class="row align-items-end g-2">

                      <!-- Producto -->
                      <div class="col-md-4">
                        <label class="form-label fw-semibold">Producto *</label>
                        <select
                          class="form-select"
                          [(ngModel)]="item.productId"
                          [name]="'product_' + i"
                          (change)="onProductChange(i)"
                          required
                        >
                          <option [ngValue]="0" disabled>Seleccione un producto</option>
                          <option *ngFor="let product of products" [ngValue]="product.id">
                            {{ product.name }} — {{ product.brand }}
                          </option>
                        </select>
                      </div>

                      <!-- Talla (variante) -->
                      <div class="col-md-2">
                        <label class="form-label fw-semibold">Talla *</label>
                        <select
                          class="form-select"
                          [(ngModel)]="item.variantId"
                          [name]="'variant_' + i"
                          (change)="onVariantChange(i)"
                          [disabled]="!item.productId || getVariants(item.productId).length === 0"
                          required
                        >
                          <option [ngValue]="null">
                            {{ getVariants(item.productId).length === 0 ? 'Sin tallas' : 'Seleccione talla' }}
                          </option>
                          <option *ngFor="let v of getVariants(item.productId)" [ngValue]="v.id">
                            Talla {{ v.size }} (stock actual: {{ v.stock }})
                          </option>
                        </select>
                      </div>

                      <!-- Cantidad -->
                      <div class="col-md-1">
                        <label class="form-label fw-semibold">Cantidad *</label>
                        <input
                          type="number"
                          class="form-control"
                          [(ngModel)]="item.quantity"
                          [name]="'quantity_' + i"
                          (change)="calculateTotal()"
                          min="1"
                          required
                        />
                      </div>

                      <!-- Costo unitario -->
                      <div class="col-md-2">
                        <label class="form-label fw-semibold">Costo Unit. *</label>
                        <div class="input-group">
                          <span class="input-group-text">S/</span>
                          <input
                            type="number"
                            class="form-control"
                            [(ngModel)]="item.unitCost"
                            [name]="'unitCost_' + i"
                            (change)="calculateTotal()"
                            min="0.01"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      <!-- Subtotal -->
                      <div class="col-md-2">
                        <label class="form-label fw-semibold">Subtotal</label>
                        <div class="input-group">
                          <span class="input-group-text">S/</span>
                          <input
                            type="text"
                            class="form-control bg-light"
                            [value]="(item.quantity * item.unitCost).toFixed(2)"
                            readonly
                          />
                        </div>
                      </div>

                      <!-- Quitar -->
                      <div class="col-md-1 d-flex align-items-end">
                        <button
                          type="button"
                          class="btn btn-outline-danger btn-sm w-100"
                          (click)="removeItem(i)"
                          [disabled]="purchaseItems.length === 1"
                        >
                          🗑️
                        </button>
                      </div>

                    </div>

                    <!-- Stock actual de la variante seleccionada -->
                    <div *ngIf="item.variantId" class="mt-2">
                      <small class="text-muted">
                        📦 Stock actual: <strong>{{ getVariantStock(item.productId, item.variantId) }}</strong> unidades
                        → después de esta compra: <strong>{{ getVariantStock(item.productId, item.variantId) + (item.quantity || 0) }}</strong>
                      </small>
                    </div>

                  </div>
                </div>

                <div class="mb-4">
                  <button type="button" class="btn btn-outline-primary" (click)="addItem()">
                    + Agregar Artículo
                  </button>
                </div>

                <div class="row mb-4">
                  <div class="col-md-12 text-end">
                    <h4>Total: {{ totalAmount | currency }}</h4>
                  </div>
                </div>

                <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
                  {{ errorMessage }}
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" (click)="cancel()">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="!purchaseForm.form.valid || saving || !isValid()"
                  >
                    <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                    {{ saving ? 'Procesando...' : 'Registrar Compra' }}
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
export class PurchaseFormComponent implements OnInit {
  private purchaseService = inject(PurchaseService);
  private supplierService = inject(SupplierService);
  private productService = inject(ProductService);
  private router = inject(Router);

  purchase: CreatePurchase = {
    supplierId: 0,
    purchaseDate: new Date(),
    invoiceNumber: '',
    notes: '',
    details: []
  };

  purchaseDateStr: string = new Date().toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm

  purchaseItems: Array<{
    productId: number;
    variantId: number | null;
    quantity: number;
    unitCost: number;
    subtotal: number;
  }> = [{
    productId: 0,
    variantId: null,
    quantity: 1,
    unitCost: 0,
    subtotal: 0
  }];

  suppliers: Supplier[] = [];
  products: Product[] = [];
  totalAmount = 0;
  errorMessage = '';
  saving = false;

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadProducts();
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
      },
      error: (error) => console.error('Error al cargar proveedores:', error)
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (error) => console.error('Error al cargar productos:', error)
    });
  }

  onProductChange(index: number): void {
    const item = this.purchaseItems[index];
    item.variantId = null; // resetear talla al cambiar producto
    const product = this.products.find(p => p.id === item.productId);

    // Auto-seleccionar talla si solo hay una variante
    if (product?.variants && product.variants.length === 1) {
      item.variantId = product.variants[0].id;
    }

    // Sugerir costo basado en precio de venta (solo si el campo está vacío)
    if (product && item.unitCost === 0) {
      item.unitCost = +(product.price * 0.6).toFixed(2);
    }
    this.calculateTotal();
  }

  onVariantChange(index: number): void {
    this.calculateTotal();
  }

  getVariants(productId: number): ProductVariant[] {
    const product = this.products.find(p => p.id === productId);
    return product?.variants?.filter(v => v.isActive) ?? [];
  }

  getVariantStock(productId: number, variantId: number | null): number {
    if (!variantId) return 0;
    const product = this.products.find(p => p.id === productId);
    const variant = product?.variants?.find(v => v.id === variantId);
    return variant?.stock ?? 0;
  }

  calculateTotal(): void {
    this.totalAmount = this.purchaseItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitCost);
    }, 0);

    this.purchaseItems.forEach(item => {
      item.subtotal = item.quantity * item.unitCost;
    });
  }

  addItem(): void {
    this.purchaseItems.push({
      productId: 0,
      variantId: null,
      quantity: 1,
      unitCost: 0,
      subtotal: 0
    });
  }

  removeItem(index: number): void {
    this.purchaseItems.splice(index, 1);
    this.calculateTotal();
  }

  isValid(): boolean {
    return this.purchase.supplierId > 0 &&
           this.purchase.invoiceNumber.trim() !== '' &&
           this.purchaseItems.length > 0 &&
           this.purchaseItems.every(item =>
             item.productId > 0 &&
             item.quantity > 0 &&
             item.unitCost > 0 &&
             // Si el producto tiene variantes, la talla es obligatoria
             (this.getVariants(item.productId).length === 0 || item.variantId != null)
           );
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.saving = true;

    this.purchase.purchaseDate = new Date(this.purchaseDateStr);
    this.purchase.details = this.purchaseItems.map(item => ({
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      quantity: item.quantity,
      unitCost: item.unitCost
    }));

    this.purchaseService.createPurchase(this.purchase).subscribe({
      next: () => {
        this.router.navigate(['/purchases']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al crear la compra. Por favor intente nuevamente.';
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/purchases']);
  }
}
