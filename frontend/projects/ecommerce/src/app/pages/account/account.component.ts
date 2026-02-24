import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EcommerceAuthService, EcommerceCustomer } from '../../services/ecommerce-auth.service';
import { OrderService, Order } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  customer: EcommerceCustomer | null = null;
  orders: Order[] = [];
  activeTab: 'orders' | 'profile' | 'settings' = 'orders';
  loading = false;
  editingProfile = false;

  profileForm = {
    fullName: '',
    phone: '',
    documentNumber: '',
    address: '',
    city: '',
    district: ''
  };

  constructor(
    private authService: EcommerceAuthService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentCustomer$.subscribe(customer => {
      this.customer = customer;
      if (customer) {
        this.profileForm = {
          fullName: customer.fullName,
          phone: customer.phone || '',
          documentNumber: customer.documentNumber || '',
          address: customer.address || '',
          city: customer.city || '',
          district: customer.district || ''
        };
      }
    });

    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error('Error al cargar pedidos');
      }
    });
  }

  setActiveTab(tab: 'orders' | 'profile' | 'settings') {
    this.activeTab = tab;
    this.editingProfile = false;
  }

  toggleEditProfile() {
    this.editingProfile = !this.editingProfile;
  }

  saveProfile() {
    if (!this.profileForm.fullName) {
      this.notificationService.warning('El nombre es requerido');
      return;
    }

    this.loading = true;
    this.authService.updateProfile(this.profileForm).subscribe({
      next: (customer) => {
        this.loading = false;
        this.editingProfile = false;
        this.notificationService.success('Perfil actualizado exitosamente');
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error('Error al actualizar el perfil');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.notificationService.success('Sesión cerrada');
    this.router.navigate(['/']);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Pending': '#f59e0b',
      'Processing': '#3b82f6',
      'Shipped': '#8b5cf6',
      'Delivered': '#10b981',
      'Cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'Pending': 'Pendiente',
      'Processing': 'Procesando',
      'Shipped': 'Enviado',
      'Delivered': 'Entregado',
      'Cancelled': 'Cancelado'
    };
    return texts[status] || status;
  }

  getPaymentStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'Pending': 'Pendiente',
      'Confirmed': 'Confirmado',
      'Rejected': 'Rechazado'
    };
    return texts[status] || status;
  }

  formatPrice(price: number): string {
    return `S/ ${price.toFixed(2)}`;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getOrderStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'Pending': '⏳',
      'Processing': '📦',
      'Shipped': '🚚',
      'Delivered': '✅',
      'Cancelled': '❌'
    };
    return icons[status] || '📋';
  }

  getPaymentMethodName(method: string): string {
    const methods: { [key: string]: string } = {
      'yape': 'Yape',
      'card': 'Tarjeta',
      'transfer': 'Transferencia'
    };
    return methods[method] || method;
  }

  viewOrderDetails(order: Order) {
    // Expandir detalles del pedido (se puede implementar un modal)
    console.log('Ver detalles:', order);
  }

  trackOrder(orderNumber: string) {
    this.notificationService.info(`Rastreando pedido #${orderNumber}`);
  }
}
