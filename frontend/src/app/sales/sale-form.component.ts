import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SaleService } from '../services/sale.service';
import { CustomerService } from '../services/customer.service';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { CrearVenta, CrearDetalleVenta } from '../models/sale.model';
import { Cliente } from '../models/customer.model';
import { Producto } from '../models/product.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // SlicePipe incluido en CommonModule
  template: `
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-md-10">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">Nueva Venta</h4>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #saleForm="ngForm">
                <!-- ===== SECCIÓN CLIENTE ===== -->
                <div class="customer-section mb-4">
                  <div class="cs-header">
                    <div class="cs-header-left">
                      <div class="cs-icon-wrap"><i class="fi fi-rr-user"></i></div>
                      <div>
                        <h5 class="cs-title">Cliente</h5>
                        <span class="cs-subtitle">Selecciona o registra un nuevo cliente</span>
                      </div>
                    </div>
                    <!-- Badge cliente seleccionado -->
                    <div *ngIf="venta.clienteId > 0" class="cs-selected-badge">
                      <i class="fi fi-rr-check-circle"></i> Cliente asignado
                    </div>
                  </div>

                  <!-- Tabs modernos -->
                  <div class="cs-tabs">
                    <button type="button" class="cs-tab" [class.active]="modoCliente === 'select'" (click)="setModoCliente('select')">
                      <i class="fi fi-rr-users"></i>
                      <span>Cliente existente</span>
                    </button>
                    <button type="button" class="cs-tab" [class.active]="modoCliente === 'new'" (click)="setModoCliente('new')">
                      <i class="fi fi-rr-user-add"></i>
                      <span>Nuevo cliente</span>
                    </button>
                  </div>

                  <!-- Panel: Seleccionar cliente existente -->
                  <div *ngIf="modoCliente === 'select'" class="cs-panel">
                    <div class="cs-search-wrap">
                      <i class="fi fi-rr-search cs-search-icon"></i>
                      <input type="text" class="cs-search-input" placeholder="Buscar por nombre o N° documento..."
                        [(ngModel)]="busquedaCliente" name="busquedaCliente" (input)="filtrarClientes()" />
                    </div>

                    <div class="cs-list-wrap">
                      <div *ngIf="clientesFiltrados.length === 0" class="cs-empty">
                        <i class="fi fi-rr-user-slash"></i>
                        <span>No se encontraron clientes</span>
                      </div>
                      <div *ngFor="let c of clientesFiltrados | slice:0:6" class="cs-customer-item"
                        [class.selected]="venta.clienteId === c.id"
                        (click)="seleccionarCliente(c)">
                        <div class="cs-avatar">{{ c.nombreCompleto.charAt(0) }}</div>
                        <div class="cs-customer-info">
                          <strong>{{ c.nombreCompleto }}</strong>
                          <span><i class="fi fi-rr-id-card"></i> {{ c.numeroDocumento }}
                            <span *ngIf="c.telefono"> · <i class="fi fi-rr-phone-call"></i> {{ c.telefono }}</span>
                          </span>
                        </div>
                        <i *ngIf="venta.clienteId === c.id" class="fi fi-rr-check-circle cs-check"></i>
                      </div>
                      <div *ngIf="clientesFiltrados.length > 6" class="cs-more">
                        +{{ clientesFiltrados.length - 6 }} más — afina la búsqueda
                      </div>
                    </div>

                    <!-- Cliente seleccionado -->
                    <div *ngIf="infoClienteSeleccionado && venta.clienteId > 0" class="cs-confirmed-card">
                      <div class="cs-confirmed-avatar">{{ infoClienteSeleccionado.nombreCompleto.charAt(0) }}</div>
                      <div class="cs-confirmed-info">
                        <strong>{{ infoClienteSeleccionado.nombreCompleto }}</strong>
                        <span *ngIf="infoClienteSeleccionado.telefono"><i class="fi fi-rr-phone-call"></i> {{ infoClienteSeleccionado.telefono }}</span>
                        <span *ngIf="infoClienteSeleccionado.correo"><i class="fi fi-rr-envelope"></i> {{ infoClienteSeleccionado.correo }}</span>
                      </div>
                      <button type="button" class="cs-clear-btn" (click)="limpiarCliente()" title="Cambiar cliente">
                        <i class="fi fi-rr-refresh"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Panel: Nuevo cliente con DNI -->
                  <div *ngIf="modoCliente === 'new'" class="cs-panel">

                    <!-- DNI Lookup -->
                    <div class="cs-dni-wrap">
                      <div class="cs-dni-header">
                        <i class="fi fi-rr-id-badge"></i>
                        <div>
                          <strong>Consulta RENIEC</strong>
                          <span>Ingresa el DNI para autocompletar los datos</span>
                        </div>
                      </div>
                      <div class="cs-dni-input-row">
                        <div class="cs-dni-field">
                          <input type="text" class="cs-dni-input" placeholder="00000000" inputmode="numeric"
                            [(ngModel)]="consultaDni" name="consultaDni" maxlength="8"
                            (keyup.enter)="consultarDni()" />
                          <span class="cs-dni-chars">{{ consultaDni.length }}/8</span>
                        </div>
                        <button type="button" class="cs-dni-btn" (click)="consultarDni()"
                          [disabled]="cargandoDni || consultaDni.length !== 8"
                          [class.loading]="cargandoDni">
                          <span *ngIf="cargandoDni" class="spinner-border spinner-border-sm"></span>
                          <i *ngIf="!cargandoDni" class="fi fi-rr-search"></i>
                          {{ cargandoDni ? 'Consultando...' : 'Consultar DNI' }}
                        </button>
                      </div>
                      <div *ngIf="dniEncontrado" class="cs-dni-result success">
                        <i class="fi fi-rr-shield-check"></i>
                        <div>
                          <strong>¡Datos encontrados en RENIEC!</strong>
                          <span>Verifica los datos y completa el teléfono</span>
                        </div>
                      </div>
                      <div *ngIf="errorDni" class="cs-dni-result warning">
                        <i class="fi fi-rr-exclamation"></i>
                        <div>
                          <strong>DNI no encontrado</strong>
                          <span>{{ errorDni }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Formulario nuevo cliente — SIN required para no bloquear el form principal -->
                    <div class="cs-new-form">
                      <div class="cs-field-group">
                        <div class="cs-field">
                          <label><i class="fi fi-rr-user"></i> Nombre Completo *</label>
                          <input type="text" [(ngModel)]="nuevoCliente.nombreCompleto" name="nuevoNombreCompleto"
                            placeholder="Nombre completo" [class.filled]="nuevoCliente.nombreCompleto" />
                        </div>
                        <div class="cs-field">
                          <label><i class="fi fi-rr-id-card"></i> DNI / Documento *</label>
                          <input type="text" [(ngModel)]="nuevoCliente.numeroDocumento" name="nuevoNumeroDocumento"
                            placeholder="Número de documento" [class.filled]="nuevoCliente.numeroDocumento" />
                        </div>
                        <div class="cs-field">
                          <label><i class="fi fi-rr-phone-call"></i> Teléfono *</label>
                          <input type="tel" [(ngModel)]="nuevoCliente.telefono" name="nuevoTelefono"
                            placeholder="987 654 321" [class.filled]="nuevoCliente.telefono" />
                        </div>
                        <div class="cs-field">
                          <label><i class="fi fi-rr-envelope"></i> Email <span class="cs-optional">opcional</span></label>
                          <input type="email" [(ngModel)]="nuevoCliente.correo" name="nuevoCorreo"
                            placeholder="correo@email.com" [class.filled]="nuevoCliente.correo" />
                        </div>
                      </div>
                      <div class="cs-new-actions">
                        <button type="button" class="cs-create-btn"
                          (click)="crearYSeleccionarCliente()"
                          [disabled]="guardandoCliente || !nuevoCliente.nombreCompleto || !nuevoCliente.numeroDocumento || !nuevoCliente.telefono">
                          <span *ngIf="guardandoCliente" class="spinner-border spinner-border-sm"></span>
                          <i *ngIf="!guardandoCliente" class="fi fi-rr-user-add"></i>
                          {{ guardandoCliente ? 'Guardando...' : 'Crear y seleccionar cliente' }}
                        </button>
                        <div *ngIf="clienteCreado" class="cs-created-toast">
                          <i class="fi fi-rr-check-circle"></i> ¡Cliente creado y seleccionado!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h5 class="mb-3">Artículos de Venta</h5>

                <div *ngFor="let item of itemsVenta; let i = index" class="card mb-3">
                  <div class="card-body">
                    <div class="row align-items-end">
                      <div class="col-md-5">
                        <label class="form-label">Producto *</label>
                        <select
                          class="form-select"
                          [(ngModel)]="item.productoId"
                          [name]="'producto_' + i"
                          (change)="onCambioProducto(i)"
                          required
                        >
                          <option [ngValue]="0" disabled>Seleccione un producto</option>
                          <option *ngFor="let producto of productos" [ngValue]="producto.id">
                            {{ producto.nombre }} - {{ producto.marca }} ({{ producto.talla }})
                            - Stock: {{ producto.stock }}
                          </option>
                        </select>
                      </div>

                      <div class="col-md-2">
                        <label class="form-label">Cantidad *</label>
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

                      <div class="col-md-2">
                        <label class="form-label">Precio Unitario</label>
                        <input
                          type="text"
                          class="form-control"
                          [value]="item.precioUnitario | currency"
                          readonly
                        />
                      </div>

                      <div class="col-md-2">
                        <label class="form-label">Subtotal</label>
                        <input
                          type="text"
                          class="form-control"
                          [value]="item.subtotal | currency"
                          readonly
                        />
                      </div>

                      <div class="col-md-1">
                        <button
                          type="button"
                          class="btn btn-danger btn-sm"
                          (click)="quitarItem(i)"
                          [disabled]="itemsVenta.length === 1"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <button type="button" class="btn btn-outline-primary" (click)="agregarItem()">
                    + Agregar Artículo
                  </button>
                </div>

                <!-- Payment Method Selection -->
                <div class="mb-4">
                  <h5 class="mb-3">💳 Método de Pago</h5>
                  <div class="row g-3">
                    <!-- Efectivo -->
                    <div class="col-md-3">
                      <div 
                        class="payment-method-card" 
                        [class.active]="metodoPagoSeleccionado === 'Efectivo'"
                        (click)="seleccionarMetodoPago('Efectivo')"
                      >
                        <i class="bi bi-cash-coin payment-icon"></i>
                        <div class="payment-name">Efectivo</div>
                        <i *ngIf="metodoPagoSeleccionado === 'Efectivo'" class="bi bi-check-circle-fill check-icon"></i>
                      </div>
                    </div>
                    
                    <!-- Tarjeta -->
                    <div class="col-md-3">
                      <div 
                        class="payment-method-card" 
                        [class.active]="metodoPagoSeleccionado === 'Tarjeta'"
                        [class.confirmed]="metodoPagoSeleccionado === 'Tarjeta' && pagoConfirmado"
                        (click)="seleccionarMetodoPago('Tarjeta')"
                      >
                        <i class="bi bi-credit-card payment-icon"></i>
                        <div class="payment-name">Tarjeta</div>
                        <i *ngIf="metodoPagoSeleccionado === 'Tarjeta' && pagoConfirmado" class="bi bi-check-circle-fill check-icon"></i>
                      </div>
                    </div>
                    
                    <!-- Yape -->
                    <div class="col-md-3">
                      <div 
                        class="payment-method-card" 
                        [class.active]="metodoPagoSeleccionado === 'Yape'"
                        [class.confirmed]="metodoPagoSeleccionado === 'Yape' && pagoConfirmado"
                        (click)="seleccionarMetodoPago('Yape')"
                      >
                        <i class="bi bi-phone payment-icon"></i>
                        <div class="payment-name">Yape</div>
                        <i *ngIf="metodoPagoSeleccionado === 'Yape' && pagoConfirmado" class="bi bi-check-circle-fill check-icon"></i>
                      </div>
                    </div>
                    
                    <!-- Transferencia -->
                    <div class="col-md-3">
                      <div 
                        class="payment-method-card" 
                        [class.active]="metodoPagoSeleccionado === 'Transferencia'"
                        [class.confirmed]="metodoPagoSeleccionado === 'Transferencia' && pagoConfirmado"
                        (click)="seleccionarMetodoPago('Transferencia')"
                      >
                        <i class="bi bi-bank payment-icon"></i>
                        <div class="payment-name">Transferencia</div>
                        <i *ngIf="metodoPagoSeleccionado === 'Transferencia' && pagoConfirmado" class="bi bi-check-circle-fill check-icon"></i>
                      </div>
                    </div>
                  </div>
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
                    [disabled]="guardando || !puedeEnviar()"
                  >
                    <span *ngIf="guardando" class="spinner-border spinner-border-sm me-2"></span>
                    {{ guardando ? 'Procesando...' : 'Completar Venta' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Yape -->
    <div class="modal fade" [class.show]="mostrarModalYape" [style.display]="mostrarModalYape ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header" style="background: var(--color-dark); color: white;">
            <h5 class="modal-title"><i class="bi bi-phone me-2"></i>Pago con Yape</h5>
            <button type="button" class="btn-close btn-close-white" (click)="cerrarModalPago()"></button>
          </div>
          <div class="modal-body text-center p-4">
            <div class="yape-qr-container mb-4">
              <div class="qr-placeholder">
                <i class="bi bi-qr-code" style="font-size: 8rem; color: var(--color-dark);"></i>
              </div>
              <p class="mt-3 text-muted">Escanea el código QR con tu app Yape</p>
            </div>
            <div class="alert" style="background: var(--color-warning-bg); border-color: var(--color-warning-border);">
              <strong>Monto a pagar:</strong>
              <div style="font-size: 2rem; color: var(--color-primary); font-weight: bold;">{{ montoTotal | currency }}</div>
            </div>
            <p class="text-muted small mb-4">Después de realizar el pago, presiona el botón para confirmar</p>
            <button class="btn btn-lg w-100" [class.btn-primary]="!procesandoPago" [class.btn-secondary]="procesandoPago"
              (click)="confirmarPagoYape()" [disabled]="procesandoPago">
              <span *ngIf="procesandoPago" class="spinner-border spinner-border-sm me-2"></span>
              {{ procesandoPago ? 'Confirmando...' : 'Confirmar Pago Realizado' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Tarjeta -->
    <div class="modal fade" [class.show]="mostrarModalTarjeta" [style.display]="mostrarModalTarjeta ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header" style="background: var(--color-dark); color: white;">
            <h5 class="modal-title"><i class="bi bi-credit-card me-2"></i>Pago con Tarjeta</h5>
            <button type="button" class="btn-close btn-close-white" (click)="cerrarModalPago()"></button>
          </div>
          <div class="modal-body p-4">
            <div class="alert" style="background: var(--color-warning-bg); border-color: var(--color-warning-border);">
              <strong>Monto a pagar:</strong>
              <span style="font-size: 1.5rem; color: var(--color-primary); font-weight: bold; margin-left: 1rem;">{{ montoTotal | currency }}</span>
            </div>
            <div class="mb-3">
              <label class="form-label">Número de Tarjeta *</label>
              <input type="text" class="form-control" [(ngModel)]="datosTarjeta.numero" placeholder="1234 5678 9012 3456" maxlength="19" />
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Fecha de Expiración *</label>
                <input type="text" class="form-control" [(ngModel)]="datosTarjeta.fechaExpiracion" placeholder="MM/AA" maxlength="5" />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">CVV *</label>
                <input type="text" class="form-control" [(ngModel)]="datosTarjeta.cvv" placeholder="123" maxlength="3" />
              </div>
            </div>
            <div class="mb-4">
              <label class="form-label">Nombre del Titular *</label>
              <input type="text" class="form-control" [(ngModel)]="datosTarjeta.nombreTitular" placeholder="Nombre como aparece en la tarjeta" />
            </div>
            <button class="btn btn-lg btn-primary w-100" (click)="procesarPagoTarjeta()" [disabled]="procesandoPago">
              <span *ngIf="procesandoPago" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!procesandoPago" class="bi bi-lock-fill me-2"></i>
              {{ procesandoPago ? 'Procesando pago...' : 'Pagar ' + (montoTotal | currency) }}
            </button>
            <p class="text-muted text-center small mt-3 mb-0"><i class="bi bi-shield-check me-1"></i>Pago seguro y encriptado</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Transferencia -->
    <div class="modal fade" [class.show]="mostrarModalTransferencia" [style.display]="mostrarModalTransferencia ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header" style="background: var(--color-dark); color: white;">
            <h5 class="modal-title"><i class="bi bi-bank me-2"></i>Transferencia Bancaria</h5>
            <button type="button" class="btn-close btn-close-white" (click)="cerrarModalPago()"></button>
          </div>
          <div class="modal-body p-4">
            <div class="alert" style="background: var(--color-warning-bg); border-color: var(--color-warning-border);">
              <strong>Monto a pagar:</strong>
              <span style="font-size: 1.5rem; color: var(--color-primary); font-weight: bold; margin-left: 1rem;">{{ montoTotal | currency }}</span>
            </div>
            <div class="card mb-3" style="background: var(--color-gray-50);">
              <div class="card-body">
                <h6 class="mb-3"><i class="bi bi-building me-2"></i>Datos Bancarios</h6>
                <div class="row g-2">
                  <div class="col-5"><strong>Banco:</strong></div><div class="col-7">BCP</div>
                  <div class="col-5"><strong>Cuenta:</strong></div><div class="col-7">191-12345678-0-90</div>
                  <div class="col-5"><strong>CCI:</strong></div><div class="col-7">00219100123456780090</div>
                  <div class="col-5"><strong>Titular:</strong></div><div class="col-7">NobleStep SAC</div>
                </div>
              </div>
            </div>
            <div class="mb-4">
              <label class="form-label">Número de Operación *</label>
              <input type="text" class="form-control" [(ngModel)]="numeroOperacion" placeholder="Ingrese el número de operación" />
              <small class="text-muted">Ingrese el código que aparece en su constancia de pago</small>
            </div>
            <button class="btn btn-lg btn-primary w-100" (click)="confirmarTransferencia()" [disabled]="procesandoPago">
              <span *ngIf="procesandoPago" class="spinner-border spinner-border-sm me-2"></span>
              {{ procesandoPago ? 'Confirmando...' : 'Confirmar Transferencia' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade" [class.show]="mostrarModalYape || mostrarModalTarjeta || mostrarModalTransferencia" 
         *ngIf="mostrarModalYape || mostrarModalTarjeta || mostrarModalTransferencia"></div>
  `,
  styles: [`
    /* ===== CUSTOMER SECTION STYLES ===== */
    .customer-section {
      background: #fff;
      border: 1.5px solid #e8e8e8;
      border-radius: 16px;
      overflow: hidden;
    }

    .cs-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      background: linear-gradient(135deg, #f8f9fa, #fff);
      border-bottom: 1px solid #f0f0f0;
    }

    .cs-header-left {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .cs-icon-wrap {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.1rem;
    }

    .cs-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-dark);
    }

    .cs-subtitle {
      font-size: 0.75rem;
      color: #6c757d;
    }

    .cs-selected-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      background: #d4edda;
      color: #155724;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.375rem 0.875rem;
      border-radius: 20px;
    }

    .cs-tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid #f0f0f0;
      background: #fafafa;
    }

    .cs-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1rem;
      border: none;
      background: transparent;
      color: #6c757d;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
    }

    .cs-tab:hover { background: #f0f0f0; color: var(--color-dark); }

    .cs-tab.active {
      color: var(--color-primary);
      border-bottom-color: var(--color-primary);
      background: #fff;
      font-weight: 600;
    }

    .cs-panel {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* Search */
    .cs-search-wrap {
      position: relative;
    }

    .cs-search-icon {
      position: absolute;
      left: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      color: #aaa;
      font-size: 0.875rem;
      pointer-events: none;
    }

    .cs-search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1.5px solid #e8e8e8;
      border-radius: 10px;
      font-size: 0.875rem;
      transition: border-color 0.2s;
      outline: none;
    }

    .cs-search-input:focus { border-color: var(--color-primary); }

    /* Customer list */
    .cs-list-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 260px;
      overflow-y: auto;
    }

    .cs-customer-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border: 1.5px solid #f0f0f0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.18s;
      background: #fafafa;
    }

    .cs-customer-item:hover {
      border-color: var(--color-primary);
      background: #fff5f6;
      transform: translateX(2px);
    }

    .cs-customer-item.selected {
      border-color: var(--color-primary);
      background: linear-gradient(135deg, rgba(232,74,95,0.04), rgba(255,132,124,0.04));
    }

    .cs-avatar {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .cs-customer-info {
      flex: 1;
      min-width: 0;
    }

    .cs-customer-info strong {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-dark);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cs-customer-info span {
      font-size: 0.75rem;
      color: #6c757d;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    .cs-check { color: var(--color-primary); font-size: 1.1rem; }

    .cs-more {
      text-align: center;
      font-size: 0.75rem;
      color: #aaa;
      padding: 0.5rem;
      border: 1px dashed #ddd;
      border-radius: 8px;
    }

    .cs-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem;
      color: #aaa;
      font-size: 0.875rem;
    }

    .cs-empty i { font-size: 2rem; }

    /* Confirmed card */
    .cs-confirmed-card {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, #d4edda, #c3e6cb);
      border: 1.5px solid #b8dacc;
      border-radius: 12px;
    }

    .cs-confirmed-avatar {
      width: 44px;
      height: 44px;
      background: #28a745;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .cs-confirmed-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .cs-confirmed-info strong {
      font-size: 0.9rem;
      font-weight: 700;
      color: #155724;
    }

    .cs-confirmed-info span {
      font-size: 0.75rem;
      color: #1e7e34;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .cs-clear-btn {
      background: rgba(255,255,255,0.6);
      border: 1px solid #b8dacc;
      border-radius: 8px;
      padding: 0.5rem;
      cursor: pointer;
      color: #155724;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .cs-clear-btn:hover { background: white; }

    /* DNI Lookup */
    .cs-dni-wrap {
      background: linear-gradient(135deg, #f8f9ff, #f0f4ff);
      border: 1.5px solid #c8d8ff;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .cs-dni-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .cs-dni-header i {
      font-size: 1.5rem;
      color: #4a6cf7;
    }

    .cs-dni-header strong {
      display: block;
      font-size: 0.875rem;
      font-weight: 700;
      color: #1a2a6c;
    }

    .cs-dni-header span {
      font-size: 0.75rem;
      color: #6c757d;
    }

    .cs-dni-input-row {
      display: flex;
      gap: 0.75rem;
      align-items: stretch;
    }

    .cs-dni-field {
      position: relative;
      flex: 1;
    }

    .cs-dni-input {
      width: 100%;
      padding: 0.875rem 3rem 0.875rem 1rem;
      border: 2px solid #c8d8ff;
      border-radius: 10px;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-align: center;
      color: #1a2a6c;
      background: white;
      outline: none;
      transition: border-color 0.2s;
    }

    .cs-dni-input:focus { border-color: #4a6cf7; }

    .cs-dni-chars {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.7rem;
      color: #aaa;
      font-weight: 600;
    }

    .cs-dni-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.5rem;
      background: linear-gradient(135deg, #1a2a6c, #4a6cf7);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .cs-dni-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .cs-dni-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(74,108,247,0.3); }

    .cs-dni-result {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 10px;
      font-size: 0.8rem;
      animation: slideIn 0.3s ease;
    }

    .cs-dni-result.success { background: #d4edda; border: 1px solid #b8dacc; color: #155724; }
    .cs-dni-result.warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }

    .cs-dni-result i { font-size: 1.2rem; margin-top: 0.1rem; flex-shrink: 0; }
    .cs-dni-result strong { display: block; font-weight: 700; margin-bottom: 0.2rem; }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* New customer form */
    .cs-new-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cs-field-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.875rem;
    }

    .cs-field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .cs-field label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #555;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .cs-field input {
      padding: 0.75rem 1rem;
      border: 1.5px solid #e8e8e8;
      border-radius: 10px;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s;
      background: #fafafa;
    }

    .cs-field input:focus { border-color: var(--color-primary); background: white; }
    .cs-field input.filled { border-color: #28a745; background: #f8fff8; }

    .cs-optional {
      font-size: 0.65rem;
      color: #aaa;
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
    }

    .cs-new-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .cs-create-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.75rem;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cs-create-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .cs-create-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(232,74,95,0.35); }

    .cs-created-toast {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #d4edda;
      color: #155724;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      animation: slideIn 0.3s ease;
    }

    /* Laptop 1366px */
    @media (max-width: 1399px) {
      .cs-search-input { padding: 0.65rem 0.9rem 0.65rem 2.5rem; font-size: 0.8rem; }
      .cs-customer-item { padding: 0.6rem 0.8rem; }
      .cs-avatar { width: 32px; height: 32px; font-size: 0.85rem; }
      .cs-customer-info strong { font-size: 0.8rem; }
      .cs-customer-info span { font-size: 0.7rem; }
      .cs-dni-input { padding: 0.65rem 2.5rem 0.65rem 0.75rem; font-size: 1rem; }
      .cs-dni-btn { padding: 0 1rem; font-size: 0.8rem; }
      .cs-field input { padding: 0.6rem 0.85rem; font-size: 0.8rem; }
      .cs-field label { font-size: 0.7rem; }
      .cs-create-btn { padding: 0.7rem 1.25rem; font-size: 0.8rem; }
    }

    /* QHD 2560x1440 */
    @media (min-width: 1920px) {
      .cs-search-input { padding: 0.875rem 1.25rem 0.875rem 3rem; font-size: 0.95rem; }
      .cs-customer-item { padding: 0.875rem 1.25rem; }
      .cs-avatar { width: 44px; height: 44px; font-size: 1.1rem; }
      .cs-dni-input { padding: 1rem 3.5rem 1rem 1.25rem; font-size: 1.4rem; }
      .cs-field input { padding: 0.875rem 1.25rem; font-size: 0.95rem; }
      .cs-create-btn { padding: 1rem 2rem; font-size: 0.95rem; }
    }

    @media (max-width: 768px) {
      .cs-field-group { grid-template-columns: 1fr; }
      .cs-dni-input-row { flex-direction: column; }
      .cs-dni-btn { padding: 0.875rem; justify-content: center; }
    }

    /* Payment Method Cards */
    .payment-method-card {
      border: 2px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: 1.5rem 1rem;
      text-align: center;
      cursor: pointer;
      transition: all var(--transition-base);
      background: white;
      position: relative;
      min-height: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .payment-method-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      border-color: var(--color-primary);
    }

    .payment-method-card.active {
      border-color: var(--color-primary);
      background: linear-gradient(135deg, rgba(232, 74, 95, 0.05), rgba(255, 132, 124, 0.05));
      box-shadow: var(--shadow-md);
    }

    .payment-method-card.confirmed {
      border-color: var(--color-success);
      background: linear-gradient(135deg, rgba(153, 184, 152, 0.05), rgba(153, 184, 152, 0.1));
    }

    .payment-icon {
      font-size: 3rem;
      color: var(--color-dark);
      margin-bottom: 0.5rem;
      transition: all var(--transition-base);
    }

    .payment-method-card.active .payment-icon {
      color: var(--color-primary);
      transform: scale(1.1);
    }

    .payment-method-card.confirmed .payment-icon {
      color: var(--color-success);
    }

    .payment-name {
      font-weight: var(--font-weight-semibold);
      color: var(--color-dark);
      font-size: var(--font-size-base);
    }

    .check-icon {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      font-size: 1.5rem;
      color: var(--color-success);
      animation: checkPop 0.3s ease;
    }

    @keyframes checkPop {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    /* Modal Styles */
    .modal {
      background: rgba(42, 54, 59, 0.7);
    }

    .modal.show {
      display: block !important;
    }

    .modal-backdrop.show {
      opacity: 0.5;
    }

    .modal-content {
      border: none;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
    }

    .modal-header {
      border-bottom: 1px solid var(--color-gray-100);
      padding: 1.5rem;
    }

    .modal-body {
      max-height: 70vh;
      overflow-y: auto;
    }

    /* Yape QR */
    .yape-qr-container {
      padding: 2rem;
    }

    .qr-placeholder {
      width: 250px;
      height: 250px;
      margin: 0 auto;
      background: linear-gradient(135deg, var(--color-gray-50), white);
      border: 3px dashed var(--color-gray-300);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: qrPulse 2s ease-in-out infinite;
    }

    @keyframes qrPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }

    /* Responsive */

    /* Laptop 1366px — payment cards */
    @media (max-width: 1399px) {
      .payment-method-card { min-height: 110px; padding: 1rem 0.75rem; }
      .payment-icon { font-size: 2.25rem; }
      .payment-name { font-size: 0.85rem; }
    }

    /* QHD 2560x1440 — payment cards */
    @media (min-width: 1920px) {
      .payment-method-card { min-height: 160px; padding: 2rem 1.25rem; }
      .payment-icon { font-size: 3.5rem; }
      .payment-name { font-size: 1.05rem; }
    }

    @media (max-width: 768px) {
      .payment-method-card {
        min-height: 120px;
        padding: 1rem 0.5rem;
      }

      .payment-icon {
        font-size: 2.5rem;
      }

      .payment-name {
        font-size: var(--font-size-sm);
      }
    }
  `]
})
export class SaleFormComponent implements OnInit {
  private saleService = inject(SaleService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private http = inject(HttpClient);
  private router = inject(Router);

  // Cliente
  modoCliente: 'select' | 'new' = 'select';
  busquedaCliente = '';
  clientesFiltrados: Cliente[] = [];
  infoClienteSeleccionado: Cliente | null = null;
  nuevoCliente = { nombreCompleto: '', numeroDocumento: '', telefono: '', correo: '' };
  guardandoCliente = false;
  clienteCreado = false;

  // Consulta DNI
  consultaDni = '';
  cargandoDni = false;
  errorDni = '';
  dniEncontrado = false;

  venta: CrearVenta = {
    clienteId: 0,
    metodoPago: 'Efectivo',
    detalles: []
  };

  itemsVenta: any[] = [{
    productoId: 0,
    cantidad: 1,
    precioUnitario: 0,
    subtotal: 0
  }];

  clientes: Cliente[] = [];
  productos: Producto[] = [];
  montoTotal = 0;
  mensajeError = '';
  guardando = false;

  // Método de pago
  metodoPagoSeleccionado = 'Efectivo';
  mostrarModalYape = false;
  mostrarModalTarjeta = false;
  mostrarModalTransferencia = false;
  
  datosTarjeta = { numero: '', fechaExpiracion: '', cvv: '', nombreTitular: '' };
  pagoConfirmado = false;
  procesandoPago = false;
  numeroOperacion = '';

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarProductos();
  }

  cargarClientes(): void {
    this.customerService.obtenerClientes().subscribe({
      next: (datos) => {
        this.clientes = datos;
        this.clientesFiltrados = datos;
      },
      error: (err: any) => console.error('Error cargando clientes:', err)
    });
  }

  setModoCliente(modo: 'select' | 'new'): void {
    this.modoCliente = modo;
    this.errorDni = '';
    this.dniEncontrado = false;
    this.clienteCreado = false;
    if (modo === 'select') {
      this.nuevoCliente = { nombreCompleto: '', numeroDocumento: '', telefono: '', correo: '' };
      this.consultaDni = '';
    }
  }

  filtrarClientes(): void {
    const q = this.busquedaCliente.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(c =>
      c.nombreCompleto.toLowerCase().includes(q) ||
      c.numeroDocumento.toLowerCase().includes(q)
    );
  }

  seleccionarCliente(c: Cliente): void {
    this.venta.clienteId = c.id;
    this.infoClienteSeleccionado = c;
  }

  limpiarCliente(): void {
    this.venta.clienteId = 0;
    this.infoClienteSeleccionado = null;
    this.busquedaCliente = '';
    this.clientesFiltrados = [...this.clientes];
  }

  consultarDni(): void {
    if (this.consultaDni.length !== 8) return;
    this.cargandoDni = true;
    this.errorDni = '';
    this.dniEncontrado = false;
    // Read token from the correct key used by AuthService ('currentUser')
    const currentUser = localStorage.getItem('currentUser');
    const token = currentUser ? (JSON.parse(currentUser)?.token || '') : '';
    this.http.get<any>(
      `${environment.apiUrl}/dni/${this.consultaDni}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: (data: any) => {
        this.cargandoDni = false;
        this.dniEncontrado = true;
        const nombre = data.nombres || data.name || '';
        const ap = data.apellidoPaterno || data.apellido_paterno || '';
        const am = data.apellidoMaterno || data.apellido_materno || '';
        this.nuevoCliente.nombreCompleto = `${nombre} ${ap} ${am}`.trim();
        this.nuevoCliente.numeroDocumento = data.dni || data.numero || this.consultaDni;
      },
      error: (err: any) => {
        this.cargandoDni = false;
        this.errorDni = err.error?.message || 'DNI no encontrado. Ingresa los datos manualmente.';
        this.nuevoCliente.numeroDocumento = this.consultaDni;
      }
    });
  }

  crearYSeleccionarCliente(): void {
    if (!this.nuevoCliente.nombreCompleto || !this.nuevoCliente.numeroDocumento || !this.nuevoCliente.telefono) return;
    this.guardandoCliente = true;
    this.customerService.crearCliente(this.nuevoCliente).subscribe({
      next: (creado: Cliente) => {
        this.clientes.push(creado);
        this.clientesFiltrados = [...this.clientes];
        this.venta.clienteId = creado.id;
        this.guardandoCliente = false;
        this.clienteCreado = true;
        this.modoCliente = 'select';
        this.busquedaCliente = creado.nombreCompleto;
        this.filtrarClientes();
        setTimeout(() => { this.clienteCreado = false; }, 3000);
      },
      error: (err: any) => {
        this.guardandoCliente = false;
        alert(err.error?.message || 'Error al crear el cliente. El DNI puede ya estar registrado.');
      }
    });
  }

  cargarProductos(): void {
    this.productService.obtenerProductos().subscribe({
      next: (datos) => {
        this.productos = datos.filter(p => p.stock > 0);
      },
      error: (err: any) => console.error('Error cargando productos:', err)
    });
  }

  onCambioProducto(index: number): void {
    const item = this.itemsVenta[index];
    const producto = this.productos.find(p => p.id === item.productoId);
    
    if (producto) {
      item.precioUnitario = producto.precio;
      item.subtotal = item.cantidad * item.precioUnitario;
      this.calcularTotal();
    }
  }

  calcularTotal(): void {
    this.montoTotal = this.itemsVenta.reduce((sum: number, item: any) => {
      return sum + (item.cantidad * item.precioUnitario);
    }, 0);

    this.itemsVenta.forEach((item: any) => {
      item.subtotal = item.cantidad * item.precioUnitario;
    });
  }

  agregarItem(): void {
    this.itemsVenta.push({ productoId: 0, cantidad: 1, precioUnitario: 0, subtotal: 0 });
  }

  quitarItem(index: number): void {
    this.itemsVenta.splice(index, 1);
    this.calcularTotal();
  }

  puedeEnviar(): boolean {
    return this.venta.clienteId > 0 &&
      this.itemsVenta.length > 0 &&
      this.itemsVenta.every((item: any) => item.productoId > 0 && item.cantidad > 0) &&
      this.montoTotal > 0;
  }

  seleccionarMetodoPago(metodo: string): void {
    this.metodoPagoSeleccionado = metodo;
    this.venta.metodoPago = metodo;
    this.pagoConfirmado = false;
    if (metodo === 'Yape') this.mostrarModalYape = true;
    else if (metodo === 'Tarjeta') this.mostrarModalTarjeta = true;
    else if (metodo === 'Transferencia') this.mostrarModalTransferencia = true;
  }

  confirmarPagoYape(): void {
    this.procesandoPago = true;
    setTimeout(() => {
      this.venta.idTransaccion = `YAPE-${Date.now()}`;
      this.pagoConfirmado = true;
      this.procesandoPago = false;
      this.mostrarModalYape = false;
      alert('✅ Pago Yape confirmado exitosamente');
    }, 1500);
  }

  procesarPagoTarjeta(): void {
    if (!this.datosTarjeta.numero || !this.datosTarjeta.fechaExpiracion || !this.datosTarjeta.cvv || !this.datosTarjeta.nombreTitular) {
      alert('Por favor complete todos los campos de la tarjeta');
      return;
    }
    this.procesandoPago = true;
    setTimeout(() => {
      this.venta.idTransaccion = `TRX-CARD-${Date.now()}`;
      this.pagoConfirmado = true;
      this.procesandoPago = false;
      this.mostrarModalTarjeta = false;
      alert('✅ Pago con tarjeta procesado exitosamente');
      this.datosTarjeta = { numero: '', fechaExpiracion: '', cvv: '', nombreTitular: '' };
    }, 2000);
  }

  confirmarTransferencia(): void {
    if (!this.numeroOperacion) {
      alert('Por favor ingrese el número de operación');
      return;
    }
    this.procesandoPago = true;
    setTimeout(() => {
      this.venta.idTransaccion = `TRANS-${this.numeroOperacion}-${Date.now()}`;
      this.pagoConfirmado = true;
      this.procesandoPago = false;
      this.mostrarModalTransferencia = false;
      alert('✅ Transferencia confirmada exitosamente');
      this.numeroOperacion = '';
    }, 1500);
  }

  cerrarModalPago(): void {
    this.mostrarModalYape = false;
    this.mostrarModalTarjeta = false;
    this.mostrarModalTransferencia = false;
    this.procesandoPago = false;
  }

  onSubmit(): void {
    // Validate payment for digital methods
    if ((this.metodoPagoSeleccionado === 'Yape' || this.metodoPagoSeleccionado === 'Tarjeta' || this.metodoPagoSeleccionado === 'Transferencia') && !this.pagoConfirmado) {
      alert('Por favor complete el proceso de pago antes de continuar');
      return;
    }

    this.mensajeError = '';
    this.guardando = true;

    this.venta.detalles = this.itemsVenta.map((item: any) => ({
      productoId: item.productoId,
      cantidad: item.cantidad
    }));

    this.saleService.crearVenta(this.venta).subscribe({
      next: () => {
        this.router.navigate(['/sales']);
      },
      error: (err: any) => {
        this.mensajeError = err.error?.message || 'Error al crear la venta. Por favor intente nuevamente.';
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/sales']);
  }
}
