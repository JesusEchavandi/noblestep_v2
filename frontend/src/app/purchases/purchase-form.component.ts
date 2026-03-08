import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PurchaseService } from '../services/purchase.service';
import { SupplierService } from '../services/supplier.service';
import { ProductService } from '../services/product.service';
import { CrearCompra } from '../models/purchase.model';
import { Proveedor } from '../models/supplier.model';
import { Producto, VarianteProducto } from '../models/product.model';
import { environment } from '../../environments/environment';

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
                    <label for="proveedorId" class="form-label">Proveedor *</label>
                    <select
                      class="form-select"
                      id="proveedorId"
                      name="proveedorId"
                      [(ngModel)]="compra.proveedorId"
                      required
                    >
                      <option [ngValue]="0" disabled>Seleccione un proveedor</option>
                      <option *ngFor="let proveedor of proveedores" [ngValue]="proveedor.id">
                        {{ proveedor.nombreEmpresa }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-4">
                    <label for="numeroCompra" class="form-label">Nº Compra</label>
                    <input
                      type="text"
                      class="form-control bg-light"
                      id="numeroCompra"
                      name="numeroCompra"
                      [value]="numeroCompraGenerado"
                      readonly
                      placeholder="Generando..."
                    />
                    <small class="text-muted">Generado automáticamente</small>
                  </div>

                  <div class="col-md-4">
                    <label for="fechaCompra" class="form-label">Fecha de Compra *</label>
                    <input
                      type="datetime-local"
                      class="form-control"
                      id="fechaCompra"
                      name="fechaCompra"
                      [(ngModel)]="fechaCompraStr"
                      required
                    />
                  </div>
                </div>

                <div class="mb-4">
                  <label for="notas" class="form-label">Notas</label>
                  <textarea
                    class="form-control"
                    id="notas"
                    name="notas"
                    [(ngModel)]="compra.notas"
                    rows="2"
                    placeholder="Notas adicionales sobre la compra..."
                  ></textarea>
                </div>

                <h5 class="mb-3">Artículos de Compra</h5>

                <div *ngFor="let item of itemsCompra; let i = index" class="card mb-3 border-primary">
                  <div class="card-body">
                    <div class="row align-items-end g-2">

                      <!-- Producto -->
                      <div class="col-md-4">
                        <label class="form-label fw-semibold">Producto *</label>
                        <select
                          class="form-select"
                          [(ngModel)]="item.productoId"
                          [name]="'producto_' + i"
                          (change)="onCambioProducto(i)"
                          required
                        >
                          <option [ngValue]="0" disabled>Seleccione un producto</option>
                          <option *ngFor="let producto of productos" [ngValue]="producto.id">
                            {{ producto.nombre }} — {{ producto.marca }}
                          </option>
                        </select>
                      </div>

                      <!-- Talla (variante) -->
                      <div class="col-md-2">
                        <label class="form-label fw-semibold">Talla *</label>
                        <select
                          class="form-select"
                          [(ngModel)]="item.varianteId"
                          [name]="'variante_' + i"
                          (change)="onCambioVariante(i)"
                          [disabled]="!item.productoId || obtenerVariantes(item.productoId).length === 0"
                          required
                        >
                          <option [ngValue]="null">
                            {{ obtenerVariantes(item.productoId).length === 0 ? 'Sin tallas' : 'Seleccione talla' }}
                          </option>
                          <option *ngFor="let v of obtenerVariantes(item.productoId)" [ngValue]="v.id">
                            Talla {{ v.talla }} (stock actual: {{ v.stock }})
                          </option>
                        </select>
                      </div>

                      <!-- Cantidad -->
                      <div class="col-md-1">
                        <label class="form-label fw-semibold">Cantidad *</label>
                        <input
                          type="number"
                          class="form-control"
                          [(ngModel)]="item.cantidad"
                          [name]="'cantidad_' + i"
                          (change)="calcularTotal()"
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
                            [(ngModel)]="item.costoUnitario"
                            [name]="'costoUnitario_' + i"
                            (change)="calcularTotal()"
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
                            [value]="(item.cantidad * item.costoUnitario).toFixed(2)"
                            readonly
                          />
                        </div>
                      </div>

                      <!-- Quitar -->
                      <div class="col-md-1 d-flex align-items-end">
                        <button
                          type="button"
                          class="btn btn-outline-danger btn-sm w-100"
                          (click)="quitarItem(i)"
                          [disabled]="itemsCompra.length === 1"
                        >
                          🗑️
                        </button>
                      </div>

                    </div>

                    <!-- Stock actual de la variante seleccionada -->
                    <div *ngIf="item.varianteId" class="mt-2">
                      <small class="text-muted">
                        📦 Stock actual: <strong>{{ obtenerStockVariante(item.productoId, item.varianteId) }}</strong> unidades
                        → después de esta compra: <strong>{{ obtenerStockVariante(item.productoId, item.varianteId) + (item.cantidad || 0) }}</strong>
                      </small>
                    </div>

                  </div>
                </div>

                <div class="mb-4">
                  <button type="button" class="btn btn-outline-primary" (click)="agregarItem()">
                    + Agregar Artículo
                  </button>
                </div>

                <div class="row mb-4">
                  <div class="col-md-12 text-end">
                    <h4>Total: {{ montoTotal | currency }}</h4>
                  </div>
                </div>

                <div *ngIf="mensajeError" class="alert alert-danger" role="alert">
                  {{ mensajeError }}
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" (click)="cancelar()">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="!purchaseForm.form.valid || guardando || !esValido()"
                  >
                    <span *ngIf="guardando" class="spinner-border spinner-border-sm me-2"></span>
                    {{ guardando ? 'Procesando...' : 'Registrar Compra' }}
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
  private http = inject(HttpClient);

  numeroCompraGenerado = 'Generando...';

  compra: CrearCompra = {
    proveedorId: 0,
    fechaCompra: new Date(),
    numeroFactura: '',
    notas: '',
    detalles: []
  };

  fechaCompraStr: string = new Date().toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm

  itemsCompra: Array<{
    productoId: number;
    varianteId: number | null;
    cantidad: number;
    costoUnitario: number;
    subtotal: number;
  }> = [{
    productoId: 0,
    varianteId: null,
    cantidad: 1,
    costoUnitario: 0,
    subtotal: 0
  }];

  proveedores: Proveedor[] = [];
  productos: Producto[] = [];
  montoTotal = 0;
  mensajeError = '';
  guardando = false;

  ngOnInit(): void {
    this.cargarProveedores();
    this.cargarProductos();
    this.cargarSiguienteNumero();
  }

  cargarSiguienteNumero(): void {
    this.http.get<{ numeroCompra: string }>(`${environment.apiUrl}/purchases/next-number`).subscribe({
      next: (res) => {
        this.numeroCompraGenerado = res.numeroCompra;
      },
      error: () => {
        this.numeroCompraGenerado = 'COMP-AUTO';
      }
    });
  }

  cargarProveedores(): void {
    this.supplierService.obtenerProveedores().subscribe({
      next: (datos) => {
        this.proveedores = datos;
      },
      error: (error: any) => console.error('Error al cargar proveedores:', error)
    });
  }

  cargarProductos(): void {
    this.productService.obtenerProductos().subscribe({
      next: (datos) => {
        this.productos = datos;
      },
      error: (error: any) => console.error('Error al cargar productos:', error)
    });
  }

  onCambioProducto(index: number): void {
    const item = this.itemsCompra[index];
    item.varianteId = null; // resetear talla al cambiar producto
    const producto = this.productos.find(p => p.id === item.productoId);

    // Auto-seleccionar talla si solo hay una variante
    if (producto?.variantes && producto.variantes.length === 1) {
      item.varianteId = producto.variantes[0].id;
    }

    // Sugerir costo basado en precio de venta (solo si el campo está vacío)
    if (producto && item.costoUnitario === 0) {
      item.costoUnitario = +(producto.precio * 0.6).toFixed(2);
    }
    this.calcularTotal();
  }

  onCambioVariante(index: number): void {
    this.calcularTotal();
  }

  obtenerVariantes(productoId: number): VarianteProducto[] {
    const producto = this.productos.find(p => p.id === productoId);
    return producto?.variantes?.filter(v => v.activo) ?? [];
  }

  obtenerStockVariante(productoId: number, varianteId: number | null): number {
    if (!varianteId) return 0;
    const producto = this.productos.find(p => p.id === productoId);
    const variante = producto?.variantes?.find(v => v.id === varianteId);
    return variante?.stock ?? 0;
  }

  calcularTotal(): void {
    this.montoTotal = this.itemsCompra.reduce((sum, item) => {
      return sum + (item.cantidad * item.costoUnitario);
    }, 0);

    this.itemsCompra.forEach(item => {
      item.subtotal = item.cantidad * item.costoUnitario;
    });
  }

  agregarItem(): void {
    this.itemsCompra.push({
      productoId: 0,
      varianteId: null,
      cantidad: 1,
      costoUnitario: 0,
      subtotal: 0
    });
  }

  quitarItem(index: number): void {
    this.itemsCompra.splice(index, 1);
    this.calcularTotal();
  }

  esValido(): boolean {
    return this.compra.proveedorId > 0 &&
           this.itemsCompra.length > 0 &&
           this.itemsCompra.every(item =>
             item.productoId > 0 &&
             item.cantidad > 0 &&
             item.costoUnitario > 0 &&
             // Si el producto tiene variantes, la talla es obligatoria
             (this.obtenerVariantes(item.productoId).length === 0 || item.varianteId != null)
           );
  }

  onSubmit(): void {
    this.mensajeError = '';
    this.guardando = true;

    this.compra.fechaCompra = new Date(this.fechaCompraStr);
    this.compra.detalles = this.itemsCompra.map(item => ({
      productoId: item.productoId,
      varianteId: item.varianteId ?? undefined,
      cantidad: item.cantidad,
      costoUnitario: item.costoUnitario
    }));

    this.purchaseService.crearCompra(this.compra).subscribe({
      next: () => {
        this.router.navigate(['/purchases']);
      },
      error: (error: any) => {
        this.mensajeError = error.error?.message || 'Error al crear la compra. Por favor intente nuevamente.';
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/purchases']);
  }
}
