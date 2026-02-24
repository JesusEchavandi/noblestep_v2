import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface Order {
  id: number;
  orderNumber: string;
  customerFullName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerDistrict: string;
  customerReference?: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  paymentProofUrl?: string;
  adminNotes?: string;
  invoiceType: string;
  companyName?: string;
  companyRUC?: string;
  orderDate: Date;
  deliveredDate?: Date;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
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
          <select [(ngModel)]="filterStatus" (change)="loadOrders()">
            <option value="">Todos</option>
            <option value="Pending">Pendiente</option>
            <option value="Processing">Procesando</option>
            <option value="Shipped">Enviado</option>
            <option value="Delivered">Entregado</option>
            <option value="Cancelled">Cancelado</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Estado de Pago:</label>
          <select [(ngModel)]="filterPaymentStatus" (change)="loadOrders()">
            <option value="">Todos</option>
            <option value="Pending">Pendiente</option>
            <option value="Confirmed">Confirmado</option>
            <option value="Rejected">Rechazado</option>
          </select>
        </div>

        <div class="stats">
          <div class="stat-card">
            <span class="stat-label">Total Pedidos</span>
            <span class="stat-value">{{ orders.length }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total Ventas</span>
            <span class="stat-value">{{ formatPrice(getTotalSales()) }}</span>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Cargando pedidos...</div>

      <div *ngIf="!loading && orders.length === 0" class="empty-state">
        <p>No hay pedidos para mostrar</p>
      </div>

      <div *ngIf="!loading && orders.length > 0" class="orders-table">
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
            <tr *ngFor="let order of orders">
              <td>
                <strong>{{ order.orderNumber }}</strong>
              </td>
              <td>
                <div class="customer-info">
                  <strong>{{ order.customerFullName }}</strong>
                  <small>{{ order.customerEmail }}</small>
                  <small>{{ order.customerPhone }}</small>
                </div>
              </td>
              <td>{{ formatDate(order.orderDate) }}</td>
              <td><strong>{{ formatPrice(order.total) }}</strong></td>
              <td>
                <span class="badge" [class.badge-pending]="order.paymentStatus === 'Pending'"
                      [class.badge-success]="order.paymentStatus === 'Confirmed'"
                      [class.badge-danger]="order.paymentStatus === 'Rejected'">
                  {{ getPaymentStatusText(order.paymentStatus) }}
                </span>
              </td>
              <td>
                <select 
                  [value]="order.orderStatus" 
                  (change)="updateOrderStatus(order, $event)"
                  class="status-select">
                  <option value="Pending">Pendiente</option>
                  <option value="Processing">Procesando</option>
                  <option value="Shipped">Enviado</option>
                  <option value="Delivered">Entregado</option>
                  <option value="Cancelled">Cancelado</option>
                </select>
              </td>
              <td>
                <div class="actions">
                  <button (click)="viewOrder(order)" class="btn-view" title="Ver Detalles">
                    👁️
                  </button>
                  <button (click)="updatePaymentStatus(order)" class="btn-payment" title="Confirmar Pago">
                    💳
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de Detalles -->
      <div *ngIf="selectedOrder" class="modal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Detalles del Pedido #{{ selectedOrder.orderNumber }}</h2>
            <button class="close-btn" (click)="closeModal()">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="order-section">
              <h3>Información del Cliente</h3>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Nombre:</strong>
                  <span>{{ selectedOrder.customerFullName }}</span>
                </div>
                <div class="info-item">
                  <strong>Email:</strong>
                  <span>{{ selectedOrder.customerEmail }}</span>
                </div>
                <div class="info-item">
                  <strong>Teléfono:</strong>
                  <span>{{ selectedOrder.customerPhone }}</span>
                </div>
                <div class="info-item">
                  <strong>Dirección:</strong>
                  <span>{{ selectedOrder.customerAddress }}, {{ selectedOrder.customerDistrict }}, {{ selectedOrder.customerCity }}</span>
                </div>
              </div>
            </div>

            <div class="order-section">
              <h3>Productos</h3>
              <div class="items-list">
                <div *ngFor="let item of selectedOrder.items" class="item-row">
                  <div class="item-info">
                    <strong>{{ item.productName }}</strong>
                    <small>Código: {{ item.productCode }}</small>
                  </div>
                  <div class="item-quantity">
                    {{ item.quantity }} x {{ formatPrice(item.unitPrice) }}
                  </div>
                  <div class="item-total">
                    {{ formatPrice(item.subtotal) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="order-section">
              <h3>Resumen</h3>
              <div class="summary">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <strong>{{ formatPrice(selectedOrder.subtotal) }}</strong>
                </div>
                <div class="summary-row">
                  <span>Envío:</span>
                  <strong>{{ formatPrice(selectedOrder.shippingCost) }}</strong>
                </div>
                <div class="summary-row total">
                  <span>Total:</span>
                  <strong>{{ formatPrice(selectedOrder.total) }}</strong>
                </div>
              </div>
            </div>

            <div class="order-section">
              <h3>Información de Pago</h3>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Método:</strong>
                  <span>{{ selectedOrder.paymentMethod }}</span>
                </div>
                <div class="info-item">
                  <strong>Estado de Pago:</strong>
                  <span class="badge" [class.badge-pending]="selectedOrder.paymentStatus === 'Pending'"
                        [class.badge-success]="selectedOrder.paymentStatus === 'Confirmed'"
                        [class.badge-danger]="selectedOrder.paymentStatus === 'Rejected'">
                    {{ getPaymentStatusText(selectedOrder.paymentStatus) }}
                  </span>
                </div>
                <div class="info-item">
                  <strong>Comprobante:</strong>
                  <span>{{ selectedOrder.invoiceType }}</span>
                </div>
              </div>
            </div>
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
      gap: 1rem;
      margin-left: auto;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-label {
      font-size: 0.75rem;
      opacity: 0.9;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
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
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #f9fafb;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    tr:hover {
      background: #f9fafb;
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
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #6b7280;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .order-section {
      margin-bottom: 2rem;
    }

    .order-section h3 {
      font-size: 1.25rem;
      color: #1f2937;
      margin-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
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
      background: #f9fafb;
      border-radius: 8px;
      align-items: center;
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
      background: #f9fafb;
      padding: 1rem;
      border-radius: 8px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .summary-row.total {
      border-top: 2px solid #e5e7eb;
      padding-top: 1rem;
      margin-top: 0.5rem;
      font-size: 1.125rem;
    }
  `]
})
export class EcommerceOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  selectedOrder: Order | null = null;
  filterStatus = '';
  filterPaymentStatus = '';

  private apiUrl = `${environment.apiUrl}/admin/ecommerce-orders`;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    let url = this.apiUrl;
    const params = [];
    
    if (this.filterStatus) params.push(`status=${this.filterStatus}`);
    if (this.filterPaymentStatus) params.push(`paymentStatus=${this.filterPaymentStatus}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    this.http.get<Order[]>(url).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  viewOrder(order: Order) {
    this.selectedOrder = order;
  }

  closeModal() {
    this.selectedOrder = null;
  }

  updateOrderStatus(order: Order, event: any) {
    const newStatus = event.target.value;
    
    this.http.put(`${this.apiUrl}/${order.id}/status`, {
      orderStatus: newStatus
    }).subscribe({
      next: () => {
        order.orderStatus = newStatus;
        console.log('Order status updated');
      },
      error: (error) => {
        console.error('Error updating status:', error);
        alert('Error al actualizar el estado');
      }
    });
  }

  updatePaymentStatus(order: Order) {
    const newStatus = order.paymentStatus === 'Pending' ? 'Confirmed' : 'Pending';
    
    this.http.put(`${this.apiUrl}/${order.id}/status`, {
      paymentStatus: newStatus
    }).subscribe({
      next: () => {
        order.paymentStatus = newStatus;
        console.log('Payment status updated');
      },
      error: (error) => {
        console.error('Error updating payment status:', error);
        alert('Error al actualizar el estado de pago');
      }
    });
  }

  getTotalSales(): number {
    return this.orders.reduce((sum, order) => sum + order.total, 0);
  }

  formatPrice(price: number): string {
    return `S/ ${price.toFixed(2)}`;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPaymentStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'Pending': 'Pendiente',
      'Confirmed': 'Confirmado',
      'Rejected': 'Rechazado'
    };
    return texts[status] || status;
  }
}
