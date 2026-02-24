import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardMetrics, TopProduct, LowStockProduct, RecentSale, SalesChartData } from '../services/dashboard.service';
import { ExportService } from '../services/export.service';
import { NotificationService } from '../services/notification.service';
import { forkJoin } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid dashboard-container">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2><i class="bi bi-speedometer2"></i> Dashboard - Panel de Control</h2>
            <p class="text-muted mb-0">Bienvenido al sistema de gestión NobleStep</p>
          </div>
          <div class="export-buttons">
            <button class="btn btn-success me-2" (click)="exportToExcel()" [disabled]="loading">
              <i class="bi bi-file-earmark-excel"></i> Exportar Excel
            </button>
            <button class="btn btn-danger" (click)="exportToPDF()" [disabled]="loading">
              <i class="bi bi-file-earmark-pdf"></i> Exportar PDF
            </button>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando métricas del dashboard...</p>
      </div>

      <div *ngIf="!loading">
        <!-- KPI Cards Row 1 -->
        <div class="row mb-4">
          <div class="col-xl-3 col-md-6 mb-4">
            <div class="metric-card card-sales">
              <div class="metric-icon">
                <i class="bi bi-cash-coin"></i>
              </div>
              <div class="metric-content">
                <h6>Ventas Totales</h6>
                <h3>{{ metrics.totalSales | currency:'PEN':'symbol':'1.2-2' }}</h3>
                <p class="mb-0">
                  <i class="bi bi-graph-up"></i> {{ metrics.totalSalesCount }} transacciones
                </p>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 mb-4">
            <div class="metric-card card-today">
              <div class="metric-icon">
                <i class="bi bi-calendar-check"></i>
              </div>
              <div class="metric-content">
                <h6>Ventas Hoy</h6>
                <h3>{{ metrics.todaySales | currency:'PEN':'symbol':'1.2-2' }}</h3>
                <p class="mb-0">
                  <i class="bi bi-cart-check"></i> {{ metrics.todaySalesCount }} ventas
                </p>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 mb-4">
            <div class="metric-card card-month">
              <div class="metric-icon">
                <i class="bi bi-calendar3"></i>
              </div>
              <div class="metric-content">
                <h6>Ventas del Mes</h6>
                <h3>{{ metrics.monthSales | currency:'PEN':'symbol':'1.2-2' }}</h3>
                <p class="mb-0">
                  <i class="bi bi-bag-check"></i> {{ metrics.monthSalesCount }} ventas
                </p>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 mb-4">
            <div class="metric-card card-average">
              <div class="metric-icon">
                <i class="bi bi-calculator"></i>
              </div>
              <div class="metric-content">
                <h6>Ticket Promedio</h6>
                <h3>{{ metrics.averageSaleAmount | currency:'PEN':'symbol':'1.2-2' }}</h3>
                <p class="mb-0">
                  <i class="bi bi-receipt"></i> Por venta
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI Cards Row 2 -->
        <div class="row mb-4">
          <div class="col-xl-3 col-md-6 mb-4">
            <div class="metric-card card-products">
              <div class="metric-icon">
                <i class="bi bi-box-seam"></i>
              </div>
              <div class="metric-content">
                <h6>Productos</h6>
                <h3>{{ metrics.activeProducts }}</h3>
                <p class="mb-0">
                  <i class="bi bi-check-circle"></i> {{ metrics.totalProducts }} total
                </p>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 mb-4">
            <div class="metric-card card-warning">
              <div class="metric-icon">
                <i class="bi bi-exclamation-triangle"></i>
              </div>
              <div class="metric-content">
                <h6>Stock Bajo</h6>
                <h3>{{ metrics.lowStockProducts }}</h3>
                <p class="mb-0">
                  <i class="bi bi-arrow-down-circle"></i> Productos críticos
                </p>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 mb-4">
            <div class="metric-card card-customers">
              <div class="metric-icon">
                <i class="bi bi-people"></i>
              </div>
              <div class="metric-content">
                <h6>Clientes</h6>
                <h3>{{ metrics.totalCustomers }}</h3>
                <p class="mb-0">
                  <i class="bi bi-person-check"></i> Registrados
                </p>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 mb-4">
            <div class="metric-card card-suppliers">
              <div class="metric-icon">
                <i class="bi bi-truck"></i>
              </div>
              <div class="metric-content">
                <h6>Proveedores</h6>
                <h3>{{ metrics.totalSuppliers }}</h3>
                <p class="mb-0">
                  <i class="bi bi-check-circle"></i> Activos
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row mb-4">
          <!-- Daily Sales Chart -->
          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-graph-up"></i> Ventas - Últimos 7 Días
                </h5>
                <span class="badge bg-primary">Diario</span>
              </div>
              <div class="card-body">
                <div id="dailyChartContainer">
                  <canvas #dailyChart></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- Monthly Sales Chart -->
          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-bar-chart-line"></i> Ventas - Últimos 6 Meses
                </h5>
                <span class="badge bg-success">Mensual</span>
              </div>
              <div class="card-body">
                <div id="monthlyChartContainer">
                  <canvas #monthlyChart></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts and Data Row -->
        <div class="row mb-4">
          <!-- Top Products -->
          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-trophy"></i> Productos Más Vendidos
                </h5>
                <span class="badge bg-info">Top 5</span>
              </div>
              <div class="card-body">
                <div *ngIf="topProducts.length === 0" class="text-center text-muted py-4">
                  <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                  <p class="mt-3">No hay datos de ventas disponibles</p>
                </div>
                <div *ngIf="topProducts.length > 0" class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th class="text-center">Vendidos</th>
                        <th class="text-end">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let product of topProducts; let i = index">
                        <td>
                          <div class="d-flex align-items-center">
                            <span class="badge bg-primary me-2">#{{i + 1}}</span>
                            <div>
                              <strong>{{ product.productName }}</strong>
                              <br>
                              <small class="text-muted">{{ product.brand }}</small>
                            </div>
                          </div>
                        </td>
                        <td class="text-center">
                          <span class="badge bg-success">{{ product.totalQuantitySold }} und</span>
                        </td>
                        <td class="text-end">
                          <strong>{{ product.totalRevenue | currency:'PEN':'symbol':'1.2-2' }}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Low Stock Alert -->
          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-exclamation-triangle text-warning"></i> Alertas de Stock
                </h5>
                <span class="badge bg-warning text-dark">{{ lowStockProducts.length }} productos</span>
              </div>
              <div class="card-body">
                <div *ngIf="lowStockProducts.length === 0" class="text-center text-success py-4">
                  <i class="bi bi-check-circle" style="font-size: 3rem;"></i>
                  <p class="mt-3">¡Todos los productos tienen stock suficiente!</p>
                </div>
                <div *ngIf="lowStockProducts.length > 0" class="low-stock-list">
                  <div *ngFor="let product of lowStockProducts" class="low-stock-item">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ product.name }}</strong>
                        <br>
                        <small class="text-muted">{{ product.brand }} - {{ product.size }}</small>
                      </div>
                      <div class="text-end">
                        <span class="badge" [class.bg-danger]="product.stock < 5" [class.bg-warning]="product.stock >= 5">
                          {{ product.stock }} en stock
                        </span>
                        <br>
                        <small class="text-muted">{{ product.price | currency:'PEN':'symbol':'1.2-2' }}</small>
                      </div>
                    </div>
                  </div>
                  <div class="text-center mt-3">
                    <a routerLink="/products" class="btn btn-sm btn-warning">
                      <i class="bi bi-box-seam"></i> Gestionar Inventario
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Sales and Quick Actions -->
        <div class="row">
          <!-- Recent Sales -->
          <div class="col-lg-8 mb-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-clock-history"></i> Ventas Recientes
                </h5>
                <a routerLink="/sales" class="btn btn-sm btn-outline-primary">Ver Todas</a>
              </div>
              <div class="card-body">
                <div *ngIf="recentSales.length === 0" class="text-center text-muted py-4">
                  <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                  <p class="mt-3">No hay ventas recientes</p>
                </div>
                <div *ngIf="recentSales.length > 0" class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th class="text-center">Items</th>
                        <th class="text-end">Total</th>
                        <th class="text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let sale of recentSales">
                        <td>
                          <small>{{ sale.saleDate | date:'dd/MM/yyyy HH:mm' }}</small>
                        </td>
                        <td>
                          <i class="bi bi-person-circle"></i> {{ sale.customerName }}
                        </td>
                        <td class="text-center">
                          <span class="badge bg-secondary">{{ sale.itemsCount }}</span>
                        </td>
                        <td class="text-end">
                          <strong>{{ sale.total | currency:'PEN':'symbol':'1.2-2' }}</strong>
                        </td>
                        <td class="text-center">
                          <span class="badge bg-success">{{ sale.status }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="col-lg-4 mb-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-lightning"></i> Acciones Rápidas
                </h5>
              </div>
              <div class="card-body">
                <div class="d-grid gap-3">
                  <a routerLink="/sales/new" class="btn btn-primary btn-lg">
                    <i class="bi bi-cart-plus"></i> Nueva Venta
                  </a>
                  <a routerLink="/purchases/new" class="btn btn-success btn-lg">
                    <i class="bi bi-bag-plus"></i> Nueva Compra
                  </a>
                  <a routerLink="/products/new" class="btn btn-info btn-lg">
                    <i class="bi bi-box-seam"></i> Agregar Producto
                  </a>
                  <a routerLink="/customers" class="btn btn-secondary btn-lg">
                    <i class="bi bi-people"></i> Gestionar Clientes
                  </a>
                  <a routerLink="/reports" class="btn btn-outline-primary btn-lg">
                    <i class="bi bi-bar-chart"></i> Ver Reportes
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ============================================
       DASHBOARD CONTAINER & LAYOUT
       ============================================ */
    .dashboard-container {
      padding: 1.5rem;
      background: #f8f9fa;
      min-height: 100vh;
    }

    /* ============================================
       PAGE HEADER
       ============================================ */
    .page-header {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }

    .page-header h2 {
      color: #1e293b;
      font-weight: 700;
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
    }

    .page-header .text-muted {
      color: #64748b !important;
      font-size: 0.95rem;
    }

    .export-buttons .btn {
      font-weight: 600;
      padding: 0.5rem 1.25rem;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .export-buttons .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    /* ============================================
       METRIC CARDS - IMPROVED DESIGN
       ============================================ */
    .metric-card {
      border-radius: 16px;
      padding: 1.75rem;
      height: 100%;
      box-shadow: 0 4px 6px rgba(0,0,0,0.07);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.18);
    }

    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 150px;
      height: 150px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transform: translate(40%, -40%);
    }

    .metric-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.12);
    }

    .metric-icon {
      font-size: 3rem;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
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
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .metric-content h3 {
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }

    .metric-content p {
      font-size: 0.9rem;
      opacity: 0.85;
      margin: 0;
      font-weight: 500;
    }

    .metric-content p i {
      margin-right: 0.25rem;
    }

    /* ============================================
       METRIC CARDS WITH BRAND PALETTE
       ============================================ */
    
    /* Ventas Totales - Primary */
    .card-sales {
      background: linear-gradient(135deg, var(--color-primary) 0%, #d63f57 100%);
      color: white;
    }

    .card-sales .metric-icon {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }

    /* Ventas Hoy - Secondary */
    .card-today {
      background: linear-gradient(135deg, var(--color-secondary) 0%, #ff6f66 100%);
      color: white;
    }

    .card-today .metric-icon {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }

    /* Ventas del Mes - Success */
    .card-month {
      background: linear-gradient(135deg, var(--color-success) 0%, #88a787 100%);
      color: white;
    }

    .card-month .metric-icon {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }

    /* Ticket Promedio - Cream */
    .card-average {
      background: linear-gradient(135deg, var(--color-cream) 0%, #ffdfa3 100%);
      color: var(--color-dark);
    }

    .card-average .metric-icon {
      background: rgba(42, 54, 59, 0.15);
      color: var(--color-dark);
    }

    /* Productos - Dark */
    .card-products {
      background: linear-gradient(135deg, var(--color-dark) 0%, #1f282d 100%);
      color: white;
    }

    .card-products .metric-icon {
      background: rgba(255, 255, 255, 0.15);
      color: var(--color-cream);
    }

    /* Stock Bajo - Primary (Warning) */
    .card-warning {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      color: white;
    }

    .card-warning .metric-icon {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }

    /* Clientes - Success */
    .card-customers {
      background: linear-gradient(135deg, var(--color-success) 0%, #7da97c 100%);
      color: white;
    }

    .card-customers .metric-icon {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }

    /* Proveedores - Secondary */
    .card-suppliers {
      background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%);
      color: white;
    }

    .card-suppliers .metric-icon {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }

    /* ============================================
       CARDS & TABLES
       ============================================ */
    .card {
      border: none;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: box-shadow 0.3s ease;
    }

    .card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }

    .card-header {
      background: white;
      border-bottom: 2px solid #f1f5f9;
      padding: 1.25rem 1.5rem;
      border-radius: 12px 12px 0 0 !important;
    }

    .card-header h5 {
      color: #1e293b;
      font-weight: 700;
      font-size: 1.1rem;
      margin: 0;
    }

    .card-header h5 i {
      margin-right: 0.5rem;
      color: var(--color-primary);
    }

    .card-body {
      padding: 1.5rem;
    }

    .table {
      margin-bottom: 0;
    }

    .table thead th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
      padding: 1rem;
    }

    .table tbody tr {
      transition: background 0.2s ease;
    }

    .table tbody tr:hover {
      background: #f8fafc;
    }

    .table tbody td {
      padding: 1rem;
      vertical-align: middle;
      color: #334155;
      font-size: 0.95rem;
    }

    /* ============================================
       BADGES
       ============================================ */
    .badge {
      padding: 0.5rem 0.85rem;
      font-weight: 600;
      font-size: 0.8rem;
      border-radius: 6px;
      letter-spacing: 0.3px;
    }

    .badge.bg-primary {
      background: var(--color-primary) !important;
    }

    .badge.bg-success {
      background: var(--color-success) !important;
    }

    .badge.bg-info {
      background: var(--color-success) !important;
    }

    .badge.bg-warning {
      background: var(--color-secondary) !important;
      color: white !important;
    }

    .badge.bg-danger {
      background: var(--color-primary) !important;
    }

    .badge.bg-secondary {
      background: #64748b !important;
    }

    /* ============================================
       LOW STOCK ALERTS
       ============================================ */
    .low-stock-list {
      max-height: 450px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .low-stock-list::-webkit-scrollbar {
      width: 6px;
    }

    .low-stock-list::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 10px;
    }

    .low-stock-list::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }

    .low-stock-list::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    .low-stock-item {
      padding: 1.25rem;
      border-bottom: 1px solid #e2e8f0;
      transition: all 0.2s ease;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }

    .low-stock-item:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateX(5px);
    }

    .low-stock-item:last-child {
      border-bottom: none;
    }

    .low-stock-item strong {
      color: #1e293b;
      font-size: 1rem;
    }

    .low-stock-item small {
      color: #64748b;
    }

    /* ============================================
       BUTTONS
       ============================================ */
    .btn {
      border-radius: 8px;
      font-weight: 600;
      padding: 0.65rem 1.25rem;
      transition: all 0.3s ease;
      border: none;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .btn-danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .btn-info {
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    }

    .btn-warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .btn-secondary {
      background: linear-gradient(135deg, #64748b 0%, #475569 100%);
    }

    .btn-outline-primary {
      border: 2px solid var(--color-primary);
      color: var(--color-primary);
      background: white;
    }

    .btn-outline-primary:hover {
      background: var(--color-primary);
      color: white;
    }

    .btn-lg {
      padding: 0.875rem 1.5rem;
      font-size: 1rem;
    }

    /* ============================================
       CHARTS
       ============================================ */
    #dailyChartContainer,
    #monthlyChartContainer {
      position: relative;
      height: 300px;
      padding: 1rem 0;
    }

    /* ============================================
       LOADING SPINNER
       ============================================ */
    .spinner-border {
      width: 3rem;
      height: 3rem;
      border-width: 0.3rem;
    }

    /* ============================================
       RESPONSIVE DESIGN
       ============================================ */
    
    /* Tablets (768px - 991px) */
    @media (max-width: 991px) {
      .dashboard-container {
        padding: 1rem;
      }

      .page-header {
        padding: 1.25rem;
      }

      .page-header h2 {
        font-size: 1.5rem;
      }

      .export-buttons {
        margin-top: 1rem;
      }

      .export-buttons .btn {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
      }

      .metric-card {
        padding: 1.5rem;
        gap: 1.25rem;
      }

      .metric-icon {
        width: 70px;
        height: 70px;
        font-size: 2.5rem;
      }

      .metric-content h3 {
        font-size: 1.75rem;
      }
    }

    /* Mobile (up to 767px) */
    @media (max-width: 767px) {
      .dashboard-container {
        padding: 0.75rem;
      }

      .page-header {
        padding: 1rem;
      }

      .page-header h2 {
        font-size: 1.35rem;
      }

      .page-header h2 i {
        display: none;
      }

      .page-header .d-flex {
        flex-direction: column;
        align-items: flex-start !important;
      }

      .export-buttons {
        width: 100%;
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
      }

      .export-buttons .btn {
        flex: 1;
        padding: 0.6rem 0.75rem;
        font-size: 0.85rem;
      }

      .export-buttons .btn i {
        display: block;
        margin-bottom: 0.25rem;
      }

      .metric-card {
        padding: 1.25rem;
        gap: 1rem;
        flex-direction: column;
        text-align: center;
      }

      .metric-icon {
        width: 60px;
        height: 60px;
        font-size: 2rem;
        margin: 0 auto;
      }

      .metric-content h6 {
        font-size: 0.75rem;
        margin-bottom: 0.5rem;
      }

      .metric-content h3 {
        font-size: 1.5rem;
      }

      .metric-content p {
        font-size: 0.85rem;
      }

      .card-header {
        padding: 1rem;
      }

      .card-header h5 {
        font-size: 1rem;
      }

      .card-header .d-flex {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 0.75rem;
      }

      .card-body {
        padding: 1rem;
      }

      .table {
        font-size: 0.85rem;
      }

      .table thead th,
      .table tbody td {
        padding: 0.75rem 0.5rem;
      }

      #dailyChartContainer,
      #monthlyChartContainer {
        height: 250px;
      }

      .low-stock-list {
        max-height: 350px;
      }

      .low-stock-item {
        padding: 1rem;
      }

      .btn-lg {
        padding: 0.75rem 1.25rem;
        font-size: 0.95rem;
      }

      .d-grid.gap-3 {
        gap: 0.75rem !important;
      }
    }

    /* Small Mobile (up to 575px) */
    @media (max-width: 575px) {
      .page-header h2 {
        font-size: 1.2rem;
      }

      .metric-content h3 {
        font-size: 1.35rem;
      }

      .card-header h5 {
        font-size: 0.95rem;
      }

      .table {
        font-size: 0.8rem;
      }

      .badge {
        font-size: 0.7rem;
        padding: 0.4rem 0.7rem;
      }
    }

    /* Print Styles */
    @media print {
      .dashboard-container {
        background: white;
      }

      .export-buttons,
      .btn {
        display: none !important;
      }

      .metric-card {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .card {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private exportService = inject(ExportService);
  private notificationService = inject(NotificationService);

  @ViewChild('dailyChart') dailyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyChart') monthlyChartRef!: ElementRef<HTMLCanvasElement>;

  private dailyChart?: Chart;
  private monthlyChart?: Chart;
  private refreshIntervalId?: ReturnType<typeof setInterval>;

  loading = true;
  metrics: DashboardMetrics = {
    totalSales: 0,
    totalSalesCount: 0,
    todaySales: 0,
    todaySalesCount: 0,
    monthSales: 0,
    monthSalesCount: 0,
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    totalPurchases: 0,
    totalPurchasesCount: 0,
    averageSaleAmount: 0
  };

  topProducts: TopProduct[] = [];
  lowStockProducts: LowStockProduct[] = [];
  recentSales: RecentSale[] = [];
  salesChartData?: SalesChartData;

  ngOnInit(): void {
    this.loadDashboardData();

    // Auto-refresh dashboard every 5 minutes — store ID to clear on destroy
    this.refreshIntervalId = setInterval(() => {
      this.loadDashboardData();
    }, 5 * 60 * 1000);
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  loadDashboardData(): void {
    this.loading = true;
    
    forkJoin({
      metrics: this.dashboardService.getMetrics(),
      topProducts: this.dashboardService.getTopProducts(5),
      lowStockProducts: this.dashboardService.getLowStockProducts(10),
      recentSales: this.dashboardService.getRecentSales(10),
      salesChartData: this.dashboardService.getSalesChartData()
    }).subscribe({
      next: (data) => {
        this.metrics = data.metrics;
        this.topProducts = data.topProducts;
        this.lowStockProducts = data.lowStockProducts;
        this.recentSales = data.recentSales;
        this.salesChartData = data.salesChartData;
        this.loading = false;
        
        // Check for low stock and notify
        this.checkLowStockAlerts();
        
        // Initialize charts after data is loaded
        setTimeout(() => this.initializeCharts(), 100);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.notificationService.notifyError('Error al cargar datos del dashboard');
        this.loading = false;
      }
    });
  }

  checkLowStockAlerts(): void {
    // Generate notifications for critical stock levels
    this.lowStockProducts.forEach(product => {
      if (product.stock <= 3) {
        this.notificationService.notifyLowStock(product.name, product.stock);
      }
    });

    // Summary notification if there are low stock products
    if (this.lowStockProducts.length > 0) {
      const criticalCount = this.lowStockProducts.filter(p => p.stock <= 5).length;
      if (criticalCount > 0) {
        this.notificationService.addNotification(
          'Alerta de Inventario',
          `Tienes ${criticalCount} productos con stock crítico (≤5 unidades)`,
          'warning',
          'bi-exclamation-triangle',
          '/products'
        );
      }
    }
  }

  private initializeCharts(): void {
    if (!this.salesChartData) return;

    this.createDailyChart();
    this.createMonthlyChart();
  }

  private createDailyChart(): void {
    if (!this.salesChartData || !this.dailyChartRef) return;

    const ctx = this.dailyChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart if exists
    if (this.dailyChart) {
      this.dailyChart.destroy();
    }

    const labels = this.salesChartData.last7Days.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
    });

    const data = this.salesChartData.last7Days.map(d => d.total);
    const counts = this.salesChartData.last7Days.map(d => d.count);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ventas (S/)',
            data: data,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#fff',
            pointBorderWidth: 3,
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 13, weight: 'bold' },
              color: '#1e293b',
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            padding: 16,
            titleFont: { size: 15, weight: 'bold' },
            bodyFont: { size: 14 },
            borderColor: '#6366f1',
            borderWidth: 2,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const value = context.parsed.y ?? 0;
                return [
                  `Ventas: S/ ${value.toFixed(2)}`,
                  `Transacciones: ${counts[index]}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => 'S/ ' + value,
              font: { size: 12, weight: 'bold' },
              color: '#475569',
              padding: 8
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.15)'
            },
            border: {
              display: false
            }
          },
          x: {
            ticks: {
              font: { size: 12, weight: 'bold' },
              color: '#475569',
              padding: 8
            },
            grid: {
              display: false
            },
            border: {
              display: false
            }
          }
        }
      }
    };

    this.dailyChart = new Chart(ctx, config);
  }

  private createMonthlyChart(): void {
    if (!this.salesChartData || !this.monthlyChartRef) return;

    const ctx = this.monthlyChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart if exists
    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    const labels = this.salesChartData.last6Months.map(m => m.monthName);
    const data = this.salesChartData.last6Months.map(m => m.total);
    const counts = this.salesChartData.last6Months.map(m => m.count);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ventas Mensuales (S/)',
            data: data,
            backgroundColor: [
              '#6366f1',
              '#ec4899',
              '#06b6d4',
              '#10b981',
              '#f59e0b',
              '#8b5cf6'
            ],
            borderColor: [
              '#4f46e5',
              '#db2777',
              '#0891b2',
              '#059669',
              '#d97706',
              '#7c3aed'
            ],
            borderWidth: 2,
            borderRadius: 10,
            hoverBackgroundColor: [
              '#4f46e5',
              '#db2777',
              '#0891b2',
              '#059669',
              '#d97706',
              '#7c3aed'
            ]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 13, weight: 'bold' },
              color: '#1e293b',
              padding: 15,
              usePointStyle: true,
              pointStyle: 'rect'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            padding: 16,
            titleFont: { size: 15, weight: 'bold' },
            bodyFont: { size: 14 },
            borderColor: '#6366f1',
            borderWidth: 2,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const value = context.parsed.y ?? 0;
                return [
                  `Ventas: S/ ${value.toFixed(2)}`,
                  `Transacciones: ${counts[index]}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => 'S/ ' + value,
              font: { size: 12, weight: 'bold' },
              color: '#475569',
              padding: 8
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.15)'
            },
            border: {
              display: false
            }
          },
          x: {
            ticks: {
              font: { size: 12, weight: 'bold' },
              color: '#475569',
              padding: 8
            },
            grid: {
              display: false
            },
            border: {
              display: false
            }
          }
        }
      }
    };

    this.monthlyChart = new Chart(ctx, config);
  }

  async exportToPDF(): Promise<void> {
    try {
      this.notificationService.notifySuccess('Generando PDF... Por favor espere.');
      
      const chartElements = [
        { id: 'dailyChartContainer', title: 'Ventas - Últimos 7 Días' },
        { id: 'monthlyChartContainer', title: 'Ventas - Últimos 6 Meses' }
      ];

      await this.exportService.exportDashboardToPDF(
        this.metrics,
        chartElements,
        this.topProducts,
        this.lowStockProducts
      );

      this.notificationService.notifySuccess('PDF generado exitosamente');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      this.notificationService.notifyError('Error al generar PDF');
    }
  }

  exportToExcel(): void {
    try {
      this.exportService.exportDashboardToExcel(
        this.metrics,
        this.topProducts,
        this.lowStockProducts,
        this.recentSales
      );
      this.notificationService.notifySuccess('Excel generado exitosamente');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      this.notificationService.notifyError('Error al generar Excel');
    }
  }

  ngOnDestroy(): void {
    // Clear auto-refresh interval
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
    // Clean up charts
    if (this.dailyChart) {
      this.dailyChart.destroy();
    }
    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }
  }
}
