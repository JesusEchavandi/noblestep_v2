import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  timestamp: Date;
  read: boolean;
  icon?: string;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private notificationId = 1;
  private lastOrderCount = -1;
  private pollingInterval: any;

  startOrderPolling(apiUrl: string, token: string): void {
    if (this.pollingInterval) return;
    this.pollingInterval = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/admin/ecommerce-orders?status=Pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const orders = await res.json();
          const count = orders.length;
          if (this.lastOrderCount !== -1 && count > this.lastOrderCount) {
            const newCount = count - this.lastOrderCount;
            this.addNotification(
              `🛍️ Nuevo${newCount > 1 ? 's' : ''} pedido${newCount > 1 ? 's' : ''}`,
              `Tienes ${newCount} pedido${newCount > 1 ? 's' : ''} pendiente${newCount > 1 ? 's' : ''} en el ecommerce`,
              'info', 'fi-rr-store-alt', '/ecommerce-orders'
            );
          }
          this.lastOrderCount = count;
        }
      } catch {}
    }, 30000);
  }

  stopOrderPolling(): void {
    if (this.pollingInterval) { clearInterval(this.pollingInterval); this.pollingInterval = null; }
  }

  // Shortcuts
  success(msg: string): void { this.addNotification('Éxito', msg, 'success', 'fi-rr-check'); }
  error(msg: string): void { this.addNotification('Error', msg, 'danger', 'fi-rr-cross-circle'); }
  warning(msg: string): void { this.addNotification('Aviso', msg, 'warning', 'fi-rr-exclamation'); }
  info(msg: string): void { this.addNotification('Info', msg, 'info', 'fi-rr-info'); }
  add(n: Partial<Notification> & { title: string; message: string }): void {
    this.addNotification(n.title, n.message, n.type || 'info', n.icon, n.link);
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        observer.next(notifications.filter(n => !n.read).length);
      });
    });
  }

  addNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info', icon?: string, link?: string): void {
    const notification: Notification = {
      id: this.notificationId++,
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
      icon,
      link
    };

    const current = this.notifications$.value;
    this.notifications$.next([notification, ...current]);

    // Show browser notification if permission granted
    this.showBrowserNotification(title, message);

    // Auto-remove after 30 seconds for non-critical notifications
    if (type !== 'danger' && type !== 'warning') {
      setTimeout(() => this.removeNotification(notification.id), 30000);
    }
  }

  markAsRead(notificationId: number): void {
    const notifications = this.notifications$.value.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notifications$.next(notifications);
  }

  markAllAsRead(): void {
    const notifications = this.notifications$.value.map(n => ({ ...n, read: true }));
    this.notifications$.next(notifications);
  }

  removeNotification(notificationId: number): void {
    const notifications = this.notifications$.value.filter(n => n.id !== notificationId);
    this.notifications$.next(notifications);
  }

  clearAll(): void {
    this.notifications$.next([]);
  }

  // Specific notification types
  notifyLowStock(productName: string, stock: number): void {
    this.addNotification(
      'Stock Bajo',
      `${productName} tiene solo ${stock} unidades en stock`,
      'warning',
      'bi-exclamation-triangle',
      '/products'
    );
  }

  notifyNewSale(customerName: string, total: number): void {
    this.addNotification(
      'Nueva Venta',
      `Venta a ${customerName} por S/ ${total.toFixed(2)}`,
      'success',
      'bi-cart-check',
      '/sales'
    );
  }

  notifyNewPurchase(supplierName: string, total: number): void {
    this.addNotification(
      'Nueva Compra',
      `Compra a ${supplierName} por S/ ${total.toFixed(2)}`,
      'info',
      'bi-bag-plus',
      '/purchases'
    );
  }

  notifyError(message: string): void {
    this.addNotification(
      'Error',
      message,
      'danger',
      'bi-x-circle'
    );
  }

  notifySuccess(message: string): void {
    this.addNotification(
      'Éxito',
      message,
      'success',
      'bi-check-circle'
    );
  }

  private async showBrowserNotification(title: string, message: string): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }
    }
  }

  // Request browser notification permission
  async requestPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }
}
