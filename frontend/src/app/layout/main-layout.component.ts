import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService, Notification } from '../services/notification.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-content">
          <button class="sidebar-toggle" (click)="toggleSidebar()">
            <i class="fi fi-rr-menu-burger"></i>
          </button>
          <div class="app-title">
            <img src="assets/logo.svg" alt="NobleStep Logo" class="app-logo">
            <strong>NobleStep</strong>
          </div>
          <div class="user-info">
            <!-- Notifications -->
            <div class="notification-wrapper">
              <button class="btn btn-icon position-relative" (click)="toggleNotifications()" title="Notificaciones">
                <i class="fi fi-rr-bell"></i>
                <span class="notification-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
              </button>
              
              <!-- Notifications Dropdown -->
              <div class="notifications-dropdown" *ngIf="showNotifications">
                <div class="notifications-header">
                  <h6>Notificaciones</h6>
                  <div>
                    <button class="btn btn-sm btn-link" (click)="markAllAsRead()" *ngIf="unreadCount > 0">
                      Marcar todas
                    </button>
                    <button class="btn btn-sm btn-link text-danger" (click)="clearAll()" *ngIf="notifications.length > 0">
                      Limpiar
                    </button>
                  </div>
                </div>
                <div class="notifications-body">
                  <div *ngIf="notifications.length === 0" class="text-center text-muted py-4">
                    <i class="fi fi-rr-bell-slash" style="font-size: 2rem;"></i>
                    <p class="mb-0 mt-2">No hay notificaciones</p>
                  </div>
                  <div *ngFor="let notification of notifications" 
                       class="notification-item" 
                       [class.unread]="!notification.read"
                       [class.notification-success]="notification.type === 'success'"
                       [class.notification-warning]="notification.type === 'warning'"
                       [class.notification-danger]="notification.type === 'danger'"
                       [class.notification-info]="notification.type === 'info'"
                       (click)="handleNotificationClick(notification)">
                    <div class="notification-icon">
                      <i class="fi" [class]="notification.icon || 'fi-rr-info'"></i>
                    </div>
                    <div class="notification-content">
                      <h6>{{ notification.title }}</h6>
                      <p>{{ notification.message }}</p>
                      <small>{{ getTimeAgo(notification.timestamp) }}</small>
                    </div>
                    <button class="btn-close-notification" (click)="removeNotification($event, notification.id)">
                      <i class="fi fi-rr-cross-small"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- User Info -->
            <span class="user-name">
              <i class="fi fi-rr-circle-user"></i> {{ currentUser?.nombreCompleto }}
            </span>
            <span class="badge user-role">{{ currentUser?.rol }}</span>
            <button class="btn btn-outline-light btn-sm ms-3" (click)="logout()">
              <i class="fi fi-rr-sign-out-alt"></i> Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <!-- Vertical Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed" [class.mobile-open]="mobileMenuOpen">
        <nav class="sidebar-nav">
          <a class="nav-item" routerLink="/dashboard" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fi fi-rr-dashboard"></i>
            <span class="nav-text">Tablero</span>
          </a>

          <div class="nav-section">
            <div class="section-title">Inventario</div>
            <a class="nav-item" routerLink="/products" routerLinkActive="active" (click)="closeMobileMenu()">
              <i class="fi fi-rr-box-alt"></i>
              <span class="nav-text">Productos</span>
            </a>
            <a class="nav-item" routerLink="/categories" routerLinkActive="active" (click)="closeMobileMenu()">
              <i class="fi fi-rr-apps"></i>
              <span class="nav-text">Categorías</span>
            </a>
          </div>

          <div class="nav-section">
            <div class="section-title">Contactos</div>
            <a class="nav-item" routerLink="/customers" routerLinkActive="active" (click)="closeMobileMenu()">
              <i class="fi fi-rr-users"></i>
              <span class="nav-text">Clientes</span>
            </a>
            <a class="nav-item" routerLink="/suppliers" routerLinkActive="active" (click)="closeMobileMenu()">
              <i class="fi fi-rr-truck-side"></i>
              <span class="nav-text">Proveedores</span>
            </a>
          </div>

          <div class="nav-section">
            <div class="section-title">Transacciones</div>
            <a class="nav-item" routerLink="/sales" routerLinkActive="active" (click)="closeMobileMenu()">
              <i class="fi fi-rr-shopping-cart-check"></i>
              <span class="nav-text">Ventas</span>
            </a>
            <a class="nav-item" routerLink="/purchases" routerLinkActive="active" (click)="closeMobileMenu()">
              <i class="fi fi-rr-receipt"></i>
              <span class="nav-text">Compras</span>
            </a>
            <a class="nav-item" routerLink="/ecommerce-orders" routerLinkActive="active" (click)="closeMobileMenu()">
              <i class="fi fi-rr-store-alt"></i>
              <span class="nav-text">Pedidos E-commerce</span>
            </a>
          </div>

          <div class="nav-section">
            <div class="section-title">Análisis</div>
            <a class="nav-item" routerLink="/reports" routerLinkActive="active" (click)="closeMobileMenu()">
              <i class="fi fi-rr-chart-histogram"></i>
              <span class="nav-text">Reportes</span>
            </a>
          </div>

          <div class="nav-section" *ngIf="currentUser?.rol === 'Administrador'">
            <div class="section-title">Administración</div>
            <a class="nav-item" routerLink="/users" routerLinkActive="active" (click)="closeMobileMenu()">
              <i class="fi fi-rr-user-gear"></i>
              <span class="nav-text">Usuarios</span>
            </a>
          </div>
        </nav>
      </aside>

      <!-- Mobile overlay -->
      <div class="mobile-overlay" [class.active]="mobileMenuOpen" (click)="closeMobileMenu()"></div>

      <!-- Main Content -->
      <main class="main-content" [class.sidebar-collapsed]="sidebarCollapsed">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="app-footer" [class.sidebar-collapsed]="sidebarCollapsed">
        <p class="text-muted mb-0">
          © 2024 NobleStep - Sistema de Gestión de Calzado
        </p>
      </footer>
    </div>
  `,
  styles: [`
    /* ========== SMOOTH TRANSITIONS ========== */
    .app-container {
      transition: var(--transition-base);
    }
    
    /* ========== SIDEBAR ANIMATIONS ========== */
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* Top Header */
    .top-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 70px;
      background: var(--color-dark);
      box-shadow: var(--shadow-md);
      z-index: 1000;
      border-bottom: 3px solid var(--color-primary);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      height: 100%;
    }

    .sidebar-toggle {
      background: transparent;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background 0.3s ease;
    }

    .sidebar-toggle:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .app-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .app-logo {
      height: 45px;
      width: auto;
      transition: transform 0.3s ease;
    }

    .app-logo:hover {
      transform: scale(1.05);
    }

    .user-info {
      display: flex;
      align-items: center;
      color: white;
    }

    .user-name {
      margin-right: 0.75rem;
      font-weight: 500;
    }

    .user-role {
      background: var(--color-cream) !important;
      color: var(--color-dark) !important;
      padding: 0.375rem 0.75rem;
      font-weight: 600;
    }

    /* Sidebar */
    .sidebar {
      position: fixed;
      top: 70px;
      left: 0;
      width: 280px;
      height: calc(100vh - 70px);
      background: var(--color-dark);
      box-shadow: var(--shadow-lg);
      transition: transform 0.3s ease, width 0.3s ease;
      z-index: 999;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
    }

    .sidebar-nav {
      padding: 1.5rem 0;
    }

    .nav-section {
      margin-bottom: 2rem;
    }

    .section-title {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 0 1.5rem;
      margin-bottom: 0.75rem;
      transition: opacity 0.3s ease;
    }

    .sidebar.collapsed .section-title {
      opacity: 0;
      height: 0;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      transition: all 0.3s ease;
      position: relative;
      font-weight: 500;
    }

    .nav-item i {
      font-size: 1.25rem;
      min-width: 30px;
      transition: transform 0.3s ease;
    }

    .nav-text {
      margin-left: 1rem;
      white-space: nowrap;
      transition: opacity 0.3s ease;
    }

    .sidebar.collapsed .nav-text {
      opacity: 0;
      width: 0;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      padding-left: 2rem;
    }

    .nav-item:hover i {
      transform: scale(1.1) rotate(5deg);
    }

    .nav-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--color-primary);
      transform: scaleY(0);
      transition: transform 0.3s ease;
    }

    .nav-item.active::before,
    .nav-item:hover::before {
      transform: scaleY(1);
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(232, 74, 95, 0.2) 0%, transparent 100%);
      color: white;
      border-left: 4px solid var(--color-primary);
      border-left: 4px solid var(--color-cream);
      box-shadow: 0 2px 8px rgba(232, 74, 95, 0.3);
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--color-cream);
    }

    /* Main Content */
    .main-content {
      margin-top: 70px;
      margin-left: 280px;
      padding: 1.5rem;
      min-height: calc(100vh - 140px);
      transition: margin-left 0.3s ease;
    }

    .main-content.sidebar-collapsed {
      margin-left: 80px;
    }

    /* Responsive main content per resolution */
    @media (min-width: 1400px) {
      .main-content {
        padding: 2rem;
      }
    }

    @media (min-width: 1920px) {
      .main-content {
        padding: 2.5rem 3rem;
      }
    }

    @media (max-width: 1399px) {
      .main-content {
        padding: 1rem 1.25rem;
      }
    }

    /* Footer */
    .app-footer {
      margin-left: 280px;
      background: var(--color-dark);
      color: white;
      text-align: center;
      padding: 1.5rem;
      box-shadow: 0 -4px 6px rgba(0,0,0,0.1);
      transition: margin-left 0.3s ease;
    }

    .app-footer.sidebar-collapsed {
      margin-left: 80px;
    }

    .app-footer p {
      margin: 0;
      opacity: 0.9;
    }

    /* Responsive */
    /* Notifications */
    .notification-wrapper {
      position: relative;
      margin-right: 1rem;
    }

    .btn-icon {
      background: transparent;
      border: none;
      color: white;
      font-size: 1.25rem;
      padding: 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .btn-icon:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .notification-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--color-primary);
      color: white;
      border-radius: 50%;
      padding: 0.2rem 0.4rem;
      font-size: 0.7rem;
      font-weight: bold;
      min-width: 1.2rem;
      text-align: center;
    }

    .notifications-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      width: 400px;
      max-height: 500px;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1001;
      overflow: hidden;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e8ebed;
      background: #f8f9fa;
    }

    .notifications-header h6 {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .notifications-body {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      padding: 1rem;
      border-bottom: 1px solid #e8ebed;
      cursor: pointer;
      transition: background 0.2s ease;
      position: relative;
    }

    .notification-item:hover {
      background: #f8f9fa;
    }

    .notification-item.unread {
      background: #e3f2fd;
    }

    .notification-icon {
      font-size: 1.5rem;
      margin-right: 1rem;
      flex-shrink: 0;
    }

    .notification-success .notification-icon {
      color: var(--color-success);
    }

    .notification-warning .notification-icon {
      color: var(--color-secondary);
    }

    .notification-danger .notification-icon {
      color: var(--color-primary);
    }

    .notification-info .notification-icon {
      color: var(--color-success);
    }

    .notification-content {
      flex: 1;
    }

    .notification-content h6 {
      margin: 0 0 0.25rem 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
    }

    .notification-content p {
      margin: 0 0 0.25rem 0;
      font-size: 0.85rem;
      color: #666;
    }

    .notification-content small {
      font-size: 0.75rem;
      color: #999;
    }

    .btn-close-notification {
      background: transparent;
      border: none;
      color: #999;
      cursor: pointer;
      padding: 0.25rem;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .btn-close-notification:hover {
      color: #666;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0 1rem;
      }

      .app-title {
        font-size: 1.25rem;
      }

      .app-logo {
        height: 35px;
      }

      .app-title strong {
        display: none;
      }

      .user-name {
        display: none;
      }

      .user-role {
        display: none;
      }

      .sidebar {
        transform: translateX(-100%);
        width: 280px;
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }

      .sidebar.collapsed {
        width: 280px;
      }

      .main-content,
      .app-footer {
        margin-left: 0 !important;
      }

      .notifications-dropdown {
        width: 320px;
        right: -1rem;
      }
    }

    .mobile-overlay {
      display: none;
    }

    @media (max-width: 768px) {
      .mobile-overlay {
        display: block;
        position: fixed;
        top: 70px;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 998;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .mobile-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }
    }

    /* Laptop 15" (1366px) — sidebar + header compact */
    @media (max-width: 1399px) and (min-width: 769px) {
      .top-header {
        height: 60px;
      }

      .header-content {
        padding: 0 1.25rem;
      }

      .app-title {
        font-size: 1.35rem;
        gap: 0.5rem;
      }

      .app-logo {
        height: 36px;
      }

      .sidebar {
        top: 60px;
        width: 240px;
        height: calc(100vh - 60px);
      }

      .sidebar.collapsed {
        width: 64px;
      }

      .main-content {
        margin-top: 60px;
        margin-left: 240px;
      }

      .main-content.sidebar-collapsed {
        margin-left: 64px;
      }

      .app-footer {
        margin-left: 240px;
      }

      .app-footer.sidebar-collapsed {
        margin-left: 64px;
      }

      .nav-item {
        padding: 0.7rem 1.25rem;
        font-size: 0.875rem;
      }

      .section-title {
        font-size: 0.65rem;
        padding: 0 1.25rem;
        margin-bottom: 0.5rem;
      }

      .nav-section {
        margin-bottom: 1.25rem;
      }

      .user-name {
        font-size: 0.85rem;
      }

      .user-role {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
      }

      .btn-icon {
        font-size: 1.1rem;
        padding: 0.35rem;
      }
    }

    /* QHD 27" (2560px) — más espacio */
    @media (min-width: 1920px) {
      .top-header {
        height: 76px;
      }

      .sidebar {
        top: 76px;
        width: 300px;
        height: calc(100vh - 76px);
      }

      .main-content {
        margin-top: 76px;
        margin-left: 300px;
      }

      .main-content.sidebar-collapsed {
        margin-left: 80px;
      }

      .app-footer {
        margin-left: 300px;
      }

      .app-footer.sidebar-collapsed {
        margin-left: 80px;
      }

      .app-title {
        font-size: 1.85rem;
      }

      .app-logo {
        height: 50px;
      }

      .nav-item {
        padding: 1.1rem 1.75rem;
        font-size: 1.05rem;
      }

      .nav-item i {
        font-size: 1.35rem;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  
  currentUser = this.authService.obtenerUsuarioActual();
  sidebarCollapsed = false;
  mobileMenuOpen = false;
  showNotifications = false;
  notifications: Notification[] = [];
  unreadCount = 0;

  ngOnInit(): void {
    // Subscribe to notifications
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });

    this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
    });

    // Request notification permission
    this.notificationService.requestPermission();
    // Polling pedidos nuevos cada 30s — lee token del key correcto ('currentUser')
    const currentUser = localStorage.getItem('currentUser');
    const token = currentUser ? (JSON.parse(currentUser)?.token || '') : '';
    if (token) this.notificationService.startOrderPolling(environment.apiUrl, token);
  }

  ngOnDestroy(): void {
    this.notificationService.stopOrderPolling();
  }

  toggleSidebar(): void {
    if (window.innerWidth <= 768) {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    this.notificationService.clearAll();
    this.showNotifications = false;
  }

  handleNotificationClick(notification: Notification): void {
    this.notificationService.markAsRead(notification.id);
    if (notification.link) {
      // Navigate to link if available
      this.showNotifications = false;
    }
  }

  removeNotification(event: Event, notificationId: number): void {
    event.stopPropagation();
    this.notificationService.removeNotification(notificationId);
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Justo ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  }

  logout(): void {
    this.authService.cerrarSesion();
  }
}
