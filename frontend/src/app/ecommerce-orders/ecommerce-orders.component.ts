import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface Pedido {
  id: number;
  numeroPedido: string;
  nombreCompletoCliente: string;
  correoCliente: string;
  telefonoCliente: string;
  direccionCliente: string;
  ciudadCliente: string;
  distritoCliente: string;
  referenciaCliente?: string;
  subtotal: number;
  costoEnvio: number;
  total: number;
  metodoPago: string;
  estadoPago: string;
  estadoPedido: string;
  urlComprobantePago?: string;
  notasAdmin?: string;
  tipoComprobante: string;
  nombreEmpresa?: string;
  rucEmpresa?: string;
  fechaPedido: Date;
  fechaEntrega?: Date;
  items: DetallePedido[];
}

interface DetallePedido {
  id: number;
  productoId: number;
  nombreProducto: string;
  codigoProducto: string;
  tallaProducto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

@Component({
  selector: 'app-ecommerce-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-container">
      <div class="page-header">
        <h1>Pedidos del E-commerce</h1>
        <p>Administración de todos los pedidos realizados en la tienda online</p>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>Estado del Pedido:</label>
          <select [(ngModel)]="filtroEstado" (change)="cargarPedidos()">
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="EnProceso">En Proceso</option>
            <option value="Enviado">Enviado</option>
            <option value="Entregado">Entregado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Estado de Pago:</label>
          <select [(ngModel)]="filtroEstadoPago" (change)="cargarPedidos()">
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagado">Pagado</option>
            <option value="Fallido">Fallido</option>
          </select>
        </div>

        <div class="stats">
          <div class="metric-card card-orders">
            <div class="metric-icon">
              <i class="bi bi-box-seam"></i>
            </div>
            <div class="metric-content">
              <h6>Total Pedidos</h6>
              <h3>{{ pedidos.length }}</h3>
              <p class="mb-0">
                <i class="bi bi-cart-check"></i> Pedidos registrados
              </p>
            </div>
          </div>
          <div class="metric-card card-revenue">
            <div class="metric-icon">
              <i class="bi bi-cash-coin"></i>
            </div>
            <div class="metric-content">
              <h6>Total Ventas</h6>
              <h3>{{ formatearPrecio(obtenerTotalVentas()) }}</h3>
              <p class="mb-0">
                <i class="bi bi-graph-up"></i> Ingresos e-commerce
              </p>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="cargando" class="loading">Cargando pedidos...</div>

      <div *ngIf="!cargando && pedidos.length === 0" class="empty-state">
        <p>No hay pedidos para mostrar</p>
      </div>

      <div *ngIf="!cargando && pedidos.length > 0" class="orders-table">
        <table>
          <thead>
            <tr>
              <th>Nº Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Pago</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let pedido of pedidosPaginados">
              <td>
                <strong>{{ pedido.numeroPedido }}</strong>
              </td>
              <td>
                <div class="customer-info">
                  <strong>{{ pedido.nombreCompletoCliente }}</strong>
                  <small>{{ pedido.correoCliente }}</small>
                  <small>{{ pedido.telefonoCliente }}</small>
                </div>
              </td>
              <td>{{ formatearFecha(pedido.fechaPedido) }}</td>
              <td><strong>{{ formatearPrecio(pedido.total) }}</strong></td>
              <td>
                <span class="badge" [class.badge-pending]="pedido.estadoPago === 'Pendiente'"
                      [class.badge-success]="pedido.estadoPago === 'Pagado'"
                      [class.badge-danger]="pedido.estadoPago === 'Fallido'">
                  {{ obtenerTextoEstadoPago(pedido.estadoPago) }}
                </span>
              </td>
              <td>
                <select 
                  [value]="pedido.estadoPedido" 
                  (change)="actualizarEstadoPedido(pedido, $event)"
                  class="status-select">
                  <option value="Pendiente">Pendiente</option>
                  <option value="EnProceso">En Proceso</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </td>
              <td>
                <div class="actions">
                  <button (click)="verPedido(pedido)" class="btn-view" title="Ver Detalles">
                    👁️
                  </button>
                  <button (click)="actualizarEstadoPago(pedido)" class="btn-payment" title="Confirmar Pago">
                    💳
                  </button>
                  <button (click)="verBoleta(pedido)" class="btn-receipt" title="Ver Boleta">
                    🧾
                  </button>
                  <button (click)="descargarBoleta(pedido)" class="btn-download" title="Descargar Boleta">
                    ⬇️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div *ngIf="totalPaginas > 1" class="pagination-container" style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem;padding:0 1rem;">
        <small style="color:#6b7280;">
          {{ (paginaActual-1)*tamanoPagina+1 }}–{{ paginaActual*tamanoPagina > pedidos.length ? pedidos.length : paginaActual*tamanoPagina }} de {{ pedidos.length }}
        </small>
        <div style="display:flex;gap:0.25rem;">
          <button (click)="irAPagina(paginaActual-1)" [disabled]="paginaActual===1" style="padding:0.25rem 0.5rem;border:1px solid #d1d5db;border-radius:4px;background:white;cursor:pointer;">‹</button>
          <button *ngFor="let p of paginas" (click)="irAPagina(p)" 
            [style.background]="p===paginaActual ? '#e84a5f' : 'white'"
            [style.color]="p===paginaActual ? 'white' : '#374151'"
            style="padding:0.25rem 0.5rem;border:1px solid #d1d5db;border-radius:4px;cursor:pointer;">{{ p }}</button>
          <button (click)="irAPagina(paginaActual+1)" [disabled]="paginaActual===totalPaginas" style="padding:0.25rem 0.5rem;border:1px solid #d1d5db;border-radius:4px;background:white;cursor:pointer;">›</button>
        </div>
      </div>

      <!-- Modal de Detalles -->
      <div *ngIf="pedidoSeleccionado" class="modal" (click)="cerrarModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Detalles del Pedido #{{ pedidoSeleccionado.numeroPedido }}</h2>
            <button class="close-btn" (click)="cerrarModal()">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="order-section">
              <h3>Información del Cliente</h3>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Nombre:</strong>
                  <span>{{ pedidoSeleccionado.nombreCompletoCliente }}</span>
                </div>
                <div class="info-item">
                  <strong>Email:</strong>
                  <span>{{ pedidoSeleccionado.correoCliente }}</span>
                </div>
                <div class="info-item">
                  <strong>Teléfono:</strong>
                  <span>{{ pedidoSeleccionado.telefonoCliente }}</span>
                </div>
                <div class="info-item">
                  <strong>Dirección:</strong>
                  <span>{{ pedidoSeleccionado.direccionCliente }}, {{ pedidoSeleccionado.distritoCliente }}, {{ pedidoSeleccionado.ciudadCliente }}</span>
                </div>
              </div>
            </div>

            <div class="order-section">
              <h3>Productos</h3>
              <div class="items-list">
                <div *ngFor="let item of pedidoSeleccionado.items" class="item-row">
                  <div class="item-info">
                    <strong>{{ item.nombreProducto }}</strong>
                    <small>Código: {{ item.codigoProducto }}</small>
                  </div>
                  <div class="item-quantity">
                    {{ item.cantidad }} x {{ formatearPrecio(item.precioUnitario) }}
                  </div>
                  <div class="item-total">
                    {{ formatearPrecio(item.subtotal) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="order-section">
              <h3>Resumen</h3>
              <div class="summary">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <strong>{{ formatearPrecio(pedidoSeleccionado.subtotal) }}</strong>
                </div>
                <div class="summary-row">
                  <span>Envío:</span>
                  <strong>{{ formatearPrecio(pedidoSeleccionado.costoEnvio) }}</strong>
                </div>
                <div class="summary-row total">
                  <span>Total:</span>
                  <strong>{{ formatearPrecio(pedidoSeleccionado.total) }}</strong>
                </div>
              </div>
            </div>

            <div class="order-section">
              <h3>Información de Pago</h3>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Método:</strong>
                  <span>{{ pedidoSeleccionado.metodoPago }}</span>
                </div>
                <div class="info-item">
                  <strong>Estado de Pago:</strong>
                  <span class="badge" [class.badge-pending]="pedidoSeleccionado.estadoPago === 'Pendiente'"
                        [class.badge-success]="pedidoSeleccionado.estadoPago === 'Pagado'"
                        [class.badge-danger]="pedidoSeleccionado.estadoPago === 'Fallido'">
                    {{ obtenerTextoEstadoPago(pedidoSeleccionado.estadoPago) }}
                  </span>
                </div>
                <div class="info-item">
                  <strong>Comprobante:</strong>
                  <span>{{ pedidoSeleccionado.tipoComprobante }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Boleta -->
      <div *ngIf="mostrarModalBoleta" class="modal" (click)="cerrarModalBoleta()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Boleta Pedido #{{ pedidoBoleta?.numeroPedido }}</h2>
            <button class="close-btn" (click)="cerrarModalBoleta()">&times;</button>
          </div>

          <div class="modal-body">
            <div *ngIf="cargandoBoleta" class="loading">Cargando boleta...</div>
            <div *ngIf="!cargandoBoleta && errorBoleta" class="error-box">{{ errorBoleta }}</div>
            <div *ngIf="!cargandoBoleta && !errorBoleta" class="receipt-preview">
              <pre>{{ contenidoBoleta }}</pre>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" (click)="cerrarModalBoleta()">Cerrar</button>
            <button class="btn-primary" [disabled]="!boletaBlob" (click)="descargarBoletaActual()">Descargar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      padding: 2rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: #6b7280;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .filter-group select {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .stats {
      display: flex;
      gap: 1.5rem;
      margin-left: auto;
    }

    /* ============================================
       METRIC CARDS - Diseño idéntico al Dashboard
       ============================================ */
    .metric-card {
      border-radius: 16px;
      padding: 1.5rem 1.75rem;
      min-width: 240px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.07);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 1.25rem;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.18);
    }

    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transform: translate(40%, -40%);
    }

    .metric-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.12);
    }

    .metric-icon {
      font-size: 2.25rem;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }

    .metric-content {
      flex: 1;
      position: relative;
      z-index: 1;
    }

    .metric-content h6 {
      font-size: 0.7rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .metric-content h3 {
      font-size: 1.6rem;
      font-weight: 800;
      margin-bottom: 0.35rem;
      line-height: 1.2;
    }

    .metric-content p {
      font-size: 0.8rem;
      opacity: 0.85;
      margin: 0;
      font-weight: 500;
    }

    .metric-content p i {
      margin-right: 0.25rem;
    }

    /* Total Pedidos - Dark */
    .card-orders {
      background: linear-gradient(135deg, var(--color-dark, #2a363b) 0%, #1f282d 100%);
      color: white;
    }

    .card-orders .metric-icon {
      background: rgba(255, 255, 255, 0.15);
      color: #f5e6ca;
    }

    /* Total Ventas - Primary */
    .card-revenue {
      background: linear-gradient(135deg, var(--color-primary, #e84a5f) 0%, #d63f57 100%);
      color: white;
    }

    .card-revenue .metric-icon {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .empty-state {
      text-align: center;
      padding: 4rem;
      color: #6b7280;
    }

    .orders-table {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow-x: auto;
      border: 1px solid rgba(42, 54, 59, 0.1);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: var(--color-dark, #2A363B);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #fff;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 3px solid #000;
      border-right: 2px solid #000;
    }

    th:last-child {
      border-right: none;
    }

    td {
      padding: 1rem;
      border-bottom: 2px solid #000;
      border-right: 2px solid #000;
    }

    td:last-child {
      border-right: none;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tbody tr:nth-child(even) {
      background: rgba(42, 54, 59, 0.02);
    }

    .customer-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .customer-info small {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-danger {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-select {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-view, .btn-payment {
      padding: 0.5rem;
      border: none;
      background: #f3f4f6;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.25rem;
      transition: background 0.3s;
    }

    .btn-view:hover {
      background: #e5e7eb;
    }

    .btn-payment:hover {
      background: #dbeafe;
    }

    .btn-receipt:hover {
      background: #fef3c7;
    }

    .btn-download:hover {
      background: #d1fae5;
    }

    /* Modal */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      border: 1px solid rgba(42, 54, 59, 0.1);
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 3px solid var(--color-primary, #E84A5F);
      background: var(--color-dark, #2A363B);
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 12px 12px 0 0;
    }

    .modal-header h2 {
      margin: 0;
      color: #fff;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.7);
    }

    .close-btn:hover {
      color: #fff;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      padding: 1rem 1.5rem 1.5rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      border-top: 1px solid rgba(42, 54, 59, 0.12);
    }

    .receipt-preview {
      border: 1px solid rgba(42, 54, 59, 0.15);
      border-radius: 8px;
      background: #fafafa;
      padding: 1rem;
      max-height: 52vh;
      overflow: auto;
    }

    .receipt-preview pre {
      margin: 0;
      white-space: pre-wrap;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      color: #111827;
    }

    .error-box {
      border: 1px solid #fecaca;
      background: #fef2f2;
      color: #b91c1c;
      border-radius: 8px;
      padding: 0.85rem 1rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-primary {
      background: var(--color-primary, #E84A5F);
      color: #fff;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .order-section {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(42, 54, 59, 0.1);
    }

    .order-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .order-section h3 {
      font-size: 1.25rem;
      color: #1f2937;
      margin-bottom: 1rem;
      border-bottom: 2px solid rgba(42, 54, 59, 0.12);
      padding-bottom: 0.5rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem;
      background: rgba(42, 54, 59, 0.02);
      border-radius: 8px;
      border-left: 3px solid rgba(42, 54, 59, 0.15);
    }

    .info-item strong {
      color: #374151;
      font-size: 0.875rem;
    }

    .info-item span {
      color: #6b7280;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .item-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 1rem;
      padding: 1rem;
      background: rgba(42, 54, 59, 0.03);
      border-radius: 8px;
      align-items: center;
      border-left: 3px solid var(--color-primary, #E84A5F);
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .item-info small {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .summary {
      background: rgba(42, 54, 59, 0.03);
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid rgba(42, 54, 59, 0.08);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(42, 54, 59, 0.06);
    }

    .summary-row:last-child {
      border-bottom: none;
    }

    .summary-row.total {
      border-top: 2px solid rgba(42, 54, 59, 0.15);
      border-bottom: none;
      padding-top: 1rem;
      margin-top: 0.5rem;
      font-size: 1.125rem;
    }

    /* Laptop 1366px */
    @media (max-width: 1399px) {
      .orders-container { padding: 1rem; }
      .page-header h1 { font-size: 1.5rem; }
      .stats { gap: 1rem; }
      .metric-card { min-width: 180px; padding: 1rem 1.25rem; }
      .metric-icon { width: 48px; height: 48px; font-size: 1.5rem; border-radius: 10px; }
      .metric-content h3 { font-size: 1.25rem; }
      .metric-content h6 { font-size: 0.6rem; }
      .metric-content p { font-size: 0.7rem; }
      th, td { padding: 0.65rem 0.75rem; font-size: 0.85rem; }
      .modal-content { max-width: 700px; }
    }

    /* QHD 2560x1440 */
    @media (min-width: 1920px) {
      .orders-container { padding: 2.5rem; }
      .page-header h1 { font-size: 2.25rem; }
      .metric-card { min-width: 280px; padding: 1.75rem 2rem; }
      .metric-icon { width: 76px; height: 76px; font-size: 2.75rem; }
      .metric-content h3 { font-size: 2rem; }
      .metric-content h6 { font-size: 0.8rem; }
      th, td { padding: 1.1rem 1.25rem; }
      .modal-content { max-width: 960px; }
    }

    /* Tablet */
    @media (max-width: 768px) {
      .filters { flex-direction: column; }
      .stats { width: 100%; flex-direction: column; }
      .metric-card { min-width: auto; }
    }
  `]
})
export class EcommerceOrdersComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidosPaginados: Pedido[] = [];
  cargando = false;
  pedidoSeleccionado: Pedido | null = null;
  filtroEstado = '';
  filtroEstadoPago = '';

  // Boleta
  mostrarModalBoleta = false;
  cargandoBoleta = false;
  errorBoleta = '';
  contenidoBoleta = '';
  boletaBlob: Blob | null = null;
  pedidoBoleta: Pedido | null = null;

  // Paginación
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 1;
  paginas: number[] = [];

  private apiUrl = `${environment.apiUrl}/admin/ecommerce-orders`;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;
    let url = this.apiUrl;
    const params = [];

    if (this.filtroEstado) params.push(`status=${this.filtroEstado}`);
    if (this.filtroEstadoPago) params.push(`paymentStatus=${this.filtroEstadoPago}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    this.http.get<Pedido[]>(url).subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.paginaActual = 1;
        this.actualizarPaginacion();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.cargando = false;
      }
    });
  }

  verPedido(pedido: Pedido) {
    this.pedidoSeleccionado = pedido;
  }

  cerrarModal() {
    this.pedidoSeleccionado = null;
  }

  actualizarEstadoPedido(pedido: Pedido, event: any) {
    const nuevoEstado = event.target.value;

    this.http.put(`${this.apiUrl}/${pedido.id}/status`, {
      estadoPedido: nuevoEstado
    }).subscribe({
      next: () => {
        pedido.estadoPedido = nuevoEstado;
        console.log('Estado del pedido actualizado');
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
        alert('Error al actualizar el estado');
      }
    });
  }

  actualizarEstadoPago(pedido: Pedido) {
    const nuevoEstado = pedido.estadoPago === 'Pendiente' ? 'Pagado' : 'Pendiente';

    this.http.put(`${this.apiUrl}/${pedido.id}/status`, {
      estadoPago: nuevoEstado
    }).subscribe({
      next: () => {
        pedido.estadoPago = nuevoEstado;
        console.log('Estado de pago actualizado');
      },
      error: (error) => {
        console.error('Error al actualizar estado de pago:', error);
        alert('Error al actualizar el estado de pago');
      }
    });
  }

  obtenerTotalVentas(): number {
    return this.pedidos.reduce((suma, pedido) => suma + pedido.total, 0);
  }

  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }

  formatearFecha(fecha: Date | string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerTextoEstadoPago(estado: string): string {
    const textos: { [key: string]: string } = {
      'Pendiente': 'Pendiente',
      'Pagado': 'Pagado',
      'Fallido': 'Fallido',
      'Reembolsado': 'Reembolsado'
    };
    return textos[estado] || estado;
  }

  verBoleta(pedido: Pedido): void {
    this.pedidoBoleta = pedido;
    this.mostrarModalBoleta = true;
    this.cargandoBoleta = true;
    this.errorBoleta = '';
    this.contenidoBoleta = '';
    this.boletaBlob = null;

    this.http.get(`${this.apiUrl}/${pedido.id}/receipt`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.boletaBlob = blob;
        blob.text().then((txt) => {
          this.contenidoBoleta = txt;
          this.cargandoBoleta = false;
        });
      },
      error: () => {
        this.errorBoleta = 'No se pudo cargar la boleta del pedido.';
        this.cargandoBoleta = false;
      }
    });
  }

  descargarBoleta(pedido: Pedido): void {
    this.http.get(`${this.apiUrl}/${pedido.id}/receipt?download=true`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `boleta-pedido-${pedido.numeroPedido || pedido.id}.txt`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: () => {
        alert('No se pudo descargar la boleta del pedido.');
      }
    });
  }

  descargarBoletaActual(): void {
    if (!this.boletaBlob || !this.pedidoBoleta) return;

    const url = URL.createObjectURL(this.boletaBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `boleta-pedido-${this.pedidoBoleta.numeroPedido || this.pedidoBoleta.id}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  cerrarModalBoleta(): void {
    this.mostrarModalBoleta = false;
    this.cargandoBoleta = false;
    this.errorBoleta = '';
    this.contenidoBoleta = '';
    this.boletaBlob = null;
    this.pedidoBoleta = null;
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.pedidos.length / this.tamanoPagina));
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas;
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    this.pedidosPaginados = this.pedidos.slice(inicio, inicio + this.tamanoPagina);
    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }
}
