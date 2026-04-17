import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, MetricasPanel, ProductoTop, ProductoBajoStock, VentaReciente, DatosGraficoVentas } from '../services/dashboard.service';
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
            <button class="btn btn-success me-2" (click)="exportarAExcel()" [disabled]="cargando">
              <i class="bi bi-file-earmark-excel"></i> Exportar Excel
            </button>
            <button class="btn btn-danger" (click)="exportarAPDF()" [disabled]="cargando">
              <i class="bi bi-file-earmark-pdf"></i> Exportar PDF
            </button>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="cargando" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando métricas del dashboard...</p>
      </div>

      <div *ngIf="!cargando">
        <!-- KPI Cards Row 1: Ventas -->
        <div class="row mb-4">
          <div class="col-xl-4 col-md-6 mb-4">
            <div class="metric-card card-sales">
              <div class="metric-icon">
                <i class="bi bi-cash-coin"></i>
              </div>
              <div class="metric-content">
                <h6>Ventas Totales</h6>
                <h3>{{ metricas.totalVentas | currency:'PEN':'symbol':'1.2-2' }}</h3>
                <p class="mb-0">
                  <i class="bi bi-graph-up"></i> {{ metricas.cantidadTotalVentas }} transacciones
                </p>
              </div>
            </div>
          </div>

          <div class="col-xl-4 col-md-6 mb-4">
            <div class="metric-card card-today">
              <div class="metric-icon">
                <i class="bi bi-calendar-check"></i>
              </div>
              <div class="metric-content">
                <h6>Ventas Hoy</h6>
                <h3>{{ metricas.ventasHoy | currency:'PEN':'symbol':'1.2-2' }}</h3>
                <p class="mb-0">
                  <i class="bi bi-cart-check"></i> {{ metricas.cantidadVentasHoy }} ventas
                </p>
              </div>
            </div>
          </div>

          <div class="col-xl-4 col-md-6 mb-4">
            <div class="metric-card card-month">
              <div class="metric-icon">
                <i class="bi bi-calendar3"></i>
              </div>
              <div class="metric-content">
                <h6>Ventas del Mes</h6>
                <h3>{{ metricas.ventasMes | currency:'PEN':'symbol':'1.2-2' }}</h3>
                <p class="mb-0">
                  <i class="bi bi-bag-check"></i> {{ metricas.cantidadVentasMes }} ventas
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI Cards Row 2: Inventario & Contactos -->
        <div class="row mb-4">
          <div class="col-xl-4 col-md-6 mb-4">
            <div class="metric-card card-products">
              <div class="metric-icon">
                <i class="bi bi-box-seam"></i>
              </div>
              <div class="metric-content">
                <h6>Productos</h6>
                <h3>{{ metricas.productosActivos }}</h3>
                <p class="mb-0">
                  <i class="bi bi-check-circle"></i> {{ metricas.totalProductos }} total
                </p>
              </div>
            </div>
          </div>

          <div class="col-xl-4 col-md-6 mb-4">
            <div class="metric-card card-customers">
              <div class="metric-icon">
                <i class="bi bi-people"></i>
              </div>
              <div class="metric-content">
                <h6>Clientes</h6>
                <h3>{{ metricas.totalClientes }}</h3>
                <p class="mb-0">
                  <i class="bi bi-person-check"></i> Registrados
                </p>
              </div>
            </div>
          </div>

          <div class="col-xl-4 col-md-6 mb-4">
            <div class="metric-card card-suppliers">
              <div class="metric-icon">
                <i class="bi bi-truck"></i>
              </div>
              <div class="metric-content">
                <h6>Proveedores</h6>
                <h3>{{ metricas.totalProveedores }}</h3>
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

        <!-- Top Products & Low Stock -->
        <div class="row mb-4">
          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-trophy"></i> Productos Más Vendidos
                </h5>
                <span class="badge bg-info">Top 5</span>
              </div>
              <div class="card-body">
                <div *ngIf="productosTop.length === 0" class="text-center text-muted py-4">
                  <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                  <p class="mt-3">No hay datos de ventas disponibles</p>
                </div>
                <div *ngIf="productosTop.length > 0" class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th class="text-center">Vendidos</th>
                        <th class="text-end">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let producto of productosTop; let i = index">
                        <td>
                          <div class="d-flex align-items-center">
                            <span class="badge bg-primary me-2">#{{i + 1}}</span>
                            <div>
                              <strong>{{ producto.nombreProducto }}</strong>
                              <br>
                              <small class="text-muted">{{ producto.marca }}</small>
                            </div>
                          </div>
                        </td>
                        <td class="text-center">
                          <span class="badge bg-success">{{ producto.cantidadTotalVendida }} und</span>
                        </td>
                        <td class="text-end">
                          <strong>{{ producto.ingresosTotales | currency:'PEN':'symbol':'1.2-2' }}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-exclamation-triangle" style="color: #FECEA8;"></i> Alertas de Stock
                </h5>
                <span class="badge" style="background: #e67e22; color: #fff;">{{ productosBajoStock.length }} productos</span>
              </div>
              <div class="card-body">
                <div *ngIf="productosBajoStock.length === 0" class="text-center text-success py-4">
                  <i class="bi bi-check-circle" style="font-size: 3rem;"></i>
                  <p class="mt-3">¡Todos los productos tienen stock suficiente!</p>
                </div>
                <div *ngIf="productosBajoStock.length > 0" class="low-stock-list">
                  <div *ngFor="let producto of productosBajoStock" class="low-stock-item">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ producto.nombre }}</strong>
                        <br>
                        <small class="text-muted">{{ producto.marca }} - {{ producto.talla }}</small>
                      </div>
                      <div class="text-end">
                        <span class="badge" [class.bg-danger]="producto.stock < 5" [class.bg-warning]="producto.stock >= 5">
                          {{ producto.stock }} en stock
                        </span>
                        <br>
                        <small class="text-muted">{{ producto.precio | currency:'PEN':'symbol':'1.2-2' }}</small>
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
          <div class="col-12 mb-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 class="mb-0">
                  <i class="bi bi-clock-history"></i> Ventas Recientes
                </h5>
                <div class="d-flex gap-2 flex-wrap">
                  <a routerLink="/sales/new" class="btn btn-sm btn-primary">
                    <i class="bi bi-cart-plus"></i> Nueva Venta
                  </a>
                  <a routerLink="/purchases/new" class="btn btn-sm btn-success">
                    <i class="bi bi-bag-plus"></i> Nueva Compra
                  </a>
                  <a routerLink="/products/new" class="btn btn-sm btn-info">
                    <i class="bi bi-box-seam"></i> Agregar Producto
                  </a>
                  <a routerLink="/reports" class="btn btn-sm btn-outline-light">
                    <i class="bi bi-bar-chart"></i> Reportes
                  </a>
                  <a routerLink="/sales" class="btn btn-sm btn-outline-light">Ver Todas</a>
                </div>
              </div>
              <div class="card-body">
                <div *ngIf="ventasRecientes.length === 0" class="text-center text-muted py-4">
                  <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                  <p class="mt-3">No hay ventas recientes</p>
                </div>
                <div *ngIf="ventasRecientes.length > 0" class="table-responsive">
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
                      <tr *ngFor="let venta of ventasRecientes">
                        <td>
                          <small>{{ venta.fechaVenta | date:'dd/MM/yyyy HH:mm':'-0500' }}</small>
                        </td>
                        <td>
                          <i class="bi bi-person-circle"></i> {{ venta.nombreCliente }}
                        </td>
                        <td class="text-center">
                          <span class="badge bg-secondary">{{ venta.cantidadItems }}</span>
                        </td>
                        <td class="text-end">
                          <strong>{{ venta.total | currency:'PEN':'symbol':'1.2-2' }}</strong>
                        </td>
                        <td class="text-center">
                          <span class="badge bg-success">{{ venta.estado }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
      padding: 1.25rem 1.35rem;
      height: 100%;
      box-shadow: 0 4px 6px rgba(0,0,0,0.07);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 1rem;
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
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.12);
    }

    .metric-icon {
      font-size: 2.25rem;
      width: 60px;
      height: 60px;
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
      min-width: 0;
      position: relative;
      z-index: 1;
    }

    .metric-content h6 {
      font-size: 0.7rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .metric-content h3 {
      font-size: 1.35rem;
      font-weight: 800;
      margin-bottom: 0.3rem;
      line-height: 1.2;
      word-break: break-word;
    }

    .metric-content p {
      font-size: 0.75rem;
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

    /* Productos - Blue */
    .card-products {
      background: linear-gradient(135deg, #4a90d9 0%, #2c6cb0 100%);
      color: white;
    }

    .card-products .metric-icon {
      background: rgba(255, 255, 255, 0.2);
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
      background: var(--color-dark, #2A363B);
      color: #fff;
      border-bottom: 3px solid var(--color-primary, #E84A5F);
      padding: 1.25rem 1.5rem;
      border-radius: 12px 12px 0 0 !important;
    }

    .card-header h5 {
      color: #fff;
      font-weight: 700;
      font-size: 1.1rem;
      margin: 0;
    }

    .card-header h5 i {
      margin-right: 0.5rem;
      color: var(--color-cream, #FECEA8);
    }

    .card-body {
      padding: 1.5rem;
    }

    .table {
      margin-bottom: 0;
      --bs-table-border-color: #000;
      --bs-border-color: #000;
    }

    .table > :not(caption) > * > * {
      border-bottom-color: #000;
    }

    .table thead th {
      background: var(--color-dark, #2A363B);
      color: #fff;
      font-weight: 700;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 3px solid #000 !important;
      border-right: 2px solid #000;
      padding: 1rem;
    }

    .table thead th:last-child {
      border-right: none;
    }

    .table tbody tr:nth-child(even) {
      background: rgba(42, 54, 59, 0.02);
    }

    .table tbody td {
      padding: 1rem;
      vertical-align: middle;
      color: #334155;
      font-size: 0.95rem;
      border-bottom: 2px solid #000 !important;
      border-right: 2px solid #000;
    }

    .table tbody td:last-child {
      border-right: none;
    }

    .table tbody tr:last-child td {
      border-bottom: none !important;
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
      border-bottom: 1px solid rgba(42, 54, 59, 0.1);
      transition: all 0.2s ease;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      border-left: 3px solid transparent;
    }

    .low-stock-item:hover {
      background: rgba(42, 54, 59, 0.03);
      border-left-color: var(--color-primary, #E84A5F);
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

    /* Laptop 15" básica (1366px - con sidebar de 240px = ~1086px contenido) */
    @media (max-width: 1399px) {
      .dashboard-container {
        padding: 0.75rem;
      }

      .page-header {
        padding: 1rem;
      }

      .page-header h2 {
        font-size: 1.4rem;
      }

      .metric-card {
        padding: 0.9rem 1rem;
        gap: 0.75rem;
      }

      .metric-icon {
        width: 46px;
        height: 46px;
        font-size: 1.5rem;
        border-radius: 10px;
      }

      .metric-content h6 {
        font-size: 0.58rem;
        margin-bottom: 0.2rem;
        letter-spacing: 0.5px;
      }

      .metric-content h3 {
        font-size: 1.1rem;
        margin-bottom: 0.1rem;
      }

      .metric-content p {
        font-size: 0.62rem;
      }

      .metric-card::before {
        width: 80px;
        height: 80px;
      }

      .export-buttons .btn {
        padding: 0.4rem 0.85rem;
        font-size: 0.8rem;
      }
    }

    /* QHD 27" (2560x1440) */
    @media (min-width: 1920px) {
      .dashboard-container {
        padding: 2rem;
      }

      .metric-card {
        padding: 1.75rem 2rem;
        gap: 1.5rem;
      }

      .metric-icon {
        width: 80px;
        height: 80px;
        font-size: 2.75rem;
      }

      .metric-content h3 {
        font-size: 2rem;
      }

      .metric-content h6 {
        font-size: 0.8rem;
        margin-bottom: 0.6rem;
      }

      .metric-content p {
        font-size: 0.9rem;
      }

      .page-header h2 {
        font-size: 2rem;
      }
    }

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

  private graficoDiario?: Chart;
  private graficoMensual?: Chart;
  private idIntervaloRefresco?: ReturnType<typeof setInterval>;

  cargando = true;
  metricas: MetricasPanel = {
    totalVentas: 0,
    cantidadTotalVentas: 0,
    ventasHoy: 0,
    cantidadVentasHoy: 0,
    ventasMes: 0,
    cantidadVentasMes: 0,
    totalProductos: 0,
    productosActivos: 0,
    productosBajoStock: 0,
    totalClientes: 0,
    totalProveedores: 0,
    totalCompras: 0,
    cantidadTotalCompras: 0,
    montoPromedioVenta: 0
  };

  productosTop: ProductoTop[] = [];
  productosBajoStock: ProductoBajoStock[] = [];
  ventasRecientes: VentaReciente[] = [];
  datosGraficoVentas?: DatosGraficoVentas;

  ngOnInit(): void {
    this.cargarDatosDashboard();

    // Auto-refresh dashboard every 5 minutes — store ID to clear on destroy
    this.idIntervaloRefresco = setInterval(() => {
      this.cargarDatosDashboard();
    }, 5 * 60 * 1000);
  }

  ngAfterViewInit(): void {
    // Los gráficos se inicializan después de cargar los datos
  }

  cargarDatosDashboard(): void {
    this.cargando = true;
    
    forkJoin({
      metricas: this.dashboardService.obtenerMetricas(),
      productosTop: this.dashboardService.obtenerProductosTop(5),
      productosBajoStock: this.dashboardService.obtenerProductosBajoStock(10),
      ventasRecientes: this.dashboardService.obtenerVentasRecientes(10),
      datosGraficoVentas: this.dashboardService.obtenerDatosGraficoVentas()
    }).subscribe({
      next: (datos) => {
        this.metricas = datos.metricas;
        this.productosTop = datos.productosTop;
        this.productosBajoStock = datos.productosBajoStock;
        this.ventasRecientes = datos.ventasRecientes;
        this.datosGraficoVentas = datos.datosGraficoVentas;
        this.cargando = false;
        
        this.verificarAlertasStock();
        
        setTimeout(() => this.inicializarGraficos(), 100);
      },
      error: (error: any) => {
        console.error('Error cargando datos del dashboard:', error);
        this.notificationService.notifyError('Error al cargar datos del dashboard');
        this.cargando = false;
      }
    });
  }

  verificarAlertasStock(): void {
    this.productosBajoStock.forEach(producto => {
      if (producto.stock <= 3) {
        this.notificationService.notifyLowStock(producto.nombre, producto.stock);
      }
    });

    if (this.productosBajoStock.length > 0) {
      const cantidadCriticos = this.productosBajoStock.filter(p => p.stock <= 5).length;
      if (cantidadCriticos > 0) {
        this.notificationService.addNotification(
          'Alerta de Inventario',
          `Tienes ${cantidadCriticos} productos con stock crítico (≤5 unidades)`,
          'warning',
          'bi-exclamation-triangle',
          '/products'
        );
      }
    }
  }

  private inicializarGraficos(): void {
    if (!this.datosGraficoVentas) return;

    this.crearGraficoDiario();
    this.crearGraficoMensual();
  }

  private crearGraficoDiario(): void {
    if (!this.datosGraficoVentas || !this.dailyChartRef) return;

    const ctx = this.dailyChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.graficoDiario) {
      this.graficoDiario.destroy();
    }

    const etiquetas = this.datosGraficoVentas.ultimos7Dias.map(d => {
      const fecha = new Date(d.fecha);
      return fecha.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Lima' });
    });

    const datos = this.datosGraficoVentas.ultimos7Dias.map(d => d.total);
    const cantidades = this.datosGraficoVentas.ultimos7Dias.map(d => d.cantidad);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Ventas (S/)',
            data: datos,
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
                  `Transacciones: ${cantidades[index]}`
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
            grid: { color: 'rgba(148, 163, 184, 0.15)' },
            border: { display: false }
          },
          x: {
            ticks: {
              font: { size: 12, weight: 'bold' },
              color: '#475569',
              padding: 8
            },
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    };

    this.graficoDiario = new Chart(ctx, config);
  }

  private crearGraficoMensual(): void {
    if (!this.datosGraficoVentas || !this.monthlyChartRef) return;

    const ctx = this.monthlyChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.graficoMensual) {
      this.graficoMensual.destroy();
    }

    const etiquetasMes = this.datosGraficoVentas.ultimos6Meses.map(m => m.nombreMes);
    const datosMes = this.datosGraficoVentas.ultimos6Meses.map(m => m.total);
    const cantidadesMes = this.datosGraficoVentas.ultimos6Meses.map(m => m.cantidad);

    const configMes: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: etiquetasMes,
        datasets: [
          {
            label: 'Ventas Mensuales (S/)',
            data: datosMes,
            backgroundColor: ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'],
            borderColor: ['#4f46e5', '#db2777', '#0891b2', '#059669', '#d97706', '#7c3aed'],
            borderWidth: 2,
            borderRadius: 10,
            hoverBackgroundColor: ['#4f46e5', '#db2777', '#0891b2', '#059669', '#d97706', '#7c3aed']
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
                  `Transacciones: ${cantidadesMes[index]}`
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
            grid: { color: 'rgba(148, 163, 184, 0.15)' },
            border: { display: false }
          },
          x: {
            ticks: {
              font: { size: 12, weight: 'bold' },
              color: '#475569',
              padding: 8
            },
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    };

    this.graficoMensual = new Chart(ctx, configMes);
  }

  async exportarAPDF(): Promise<void> {
    try {
      this.notificationService.notifySuccess('Generando PDF... Por favor espere.');
      
      const elementosGrafico = [
        { id: 'dailyChartContainer', title: 'Ventas - Últimos 7 Días' },
        { id: 'monthlyChartContainer', title: 'Ventas - Últimos 6 Meses' }
      ];

      await this.exportService.exportDashboardToPDF(
        this.metricas,
        elementosGrafico,
        this.productosTop,
        this.productosBajoStock
      );

      this.notificationService.notifySuccess('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      this.notificationService.notifyError('Error al generar PDF');
    }
  }

  exportarAExcel(): void {
    try {
      this.exportService.exportDashboardToExcel(
        this.metricas,
        this.productosTop,
        this.productosBajoStock,
        this.ventasRecientes
      );
      this.notificationService.notifySuccess('Excel generado exitosamente');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      this.notificationService.notifyError('Error al generar Excel');
    }
  }

  ngOnDestroy(): void {
    if (this.idIntervaloRefresco) {
      clearInterval(this.idIntervaloRefresco);
    }
    if (this.graficoDiario) {
      this.graficoDiario.destroy();
    }
    if (this.graficoMensual) {
      this.graficoMensual.destroy();
    }
  }
}
