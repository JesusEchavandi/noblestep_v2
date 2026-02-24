import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, SalesReport, SalesByProduct, SalesByCustomer, PurchasesReport, PurchasesBySupplier, InventoryReport, InventoryValuation, ProfitLossReport } from '../services/report.service';
import { CategoryService } from '../services/category.service';
import { ExportService } from '../services/export.service';
import { NotificationService } from '../services/notification.service';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private categoryService = inject(CategoryService);
  private exportService = inject(ExportService);
  private notificationService = inject(NotificationService);

  activeTab: string = 'sales';
  categories: Category[] = [];
  
  filters = {
    startDate: '',
    endDate: '',
    categoryId: null as number | null
  };

  // Sales Reports
  salesReport: SalesReport | null = null;
  salesByProduct: SalesByProduct[] = [];
  salesByCustomer: SalesByCustomer[] = [];

  // Purchases Reports
  purchasesReport: PurchasesReport | null = null;
  purchasesBySupplier: PurchasesBySupplier[] = [];

  // Inventory Reports
  inventoryReport: InventoryReport[] = [];
  inventoryValuation: InventoryValuation | null = null;

  // Profit/Loss Report
  profitLossReport: ProfitLossReport | null = null;

  loading = false;

  ngOnInit(): void {
    this.loadCategories();
    this.setDefaultDates();
  }

  setDefaultDates(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.filters.endDate = today.toISOString().split('T')[0];
    this.filters.startDate = firstDayOfMonth.toISOString().split('T')[0];
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadSalesReports(): void {
    this.loading = true;
    this.reportService.getSalesReport(this.filters.startDate, this.filters.endDate).subscribe({
      next: (data) => {
        this.salesReport = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sales report:', err);
        this.loading = false;
      }
    });

    this.reportService.getSalesByProduct(this.filters.startDate, this.filters.endDate, this.filters.categoryId ?? undefined).subscribe({
      next: (data) => this.salesByProduct = data,
      error: (err) => console.error('Error:', err)
    });

    this.reportService.getSalesByCustomer(this.filters.startDate, this.filters.endDate).subscribe({
      next: (data) => this.salesByCustomer = data,
      error: (err) => console.error('Error:', err)
    });
  }

  loadPurchasesReports(): void {
    this.loading = true;
    this.reportService.getPurchasesReport(this.filters.startDate, this.filters.endDate).subscribe({
      next: (data) => {
        this.purchasesReport = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      }
    });

    this.reportService.getPurchasesBySupplier(this.filters.startDate, this.filters.endDate).subscribe({
      next: (data) => this.purchasesBySupplier = data,
      error: (err) => console.error('Error:', err)
    });
  }

  loadInventoryReports(): void {
    this.loading = true;
    this.reportService.getInventoryReport(this.filters.categoryId ?? undefined).subscribe({
      next: (data) => {
        this.inventoryReport = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      }
    });

    this.reportService.getInventoryValuation().subscribe({
      next: (data) => this.inventoryValuation = data,
      error: (err) => console.error('Error:', err)
    });
  }

  loadProfitLossReport(): void {
    this.loading = true;
    this.reportService.getProfitLossReport(this.filters.startDate, this.filters.endDate).subscribe({
      next: (data) => {
        this.profitLossReport = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      }
    });
  }

  getProfitClass(): string {
    if (!this.profitLossReport) return '';
    return this.profitLossReport.grossProfit >= 0 ? 'text-success' : 'text-danger';
  }

  getMarginStatus(): { label: string; className: string } {
    if (!this.profitLossReport) return { label: '', className: '' };
    const margin = this.profitLossReport.profitMargin;
    if (margin > 20) return { label: 'Excelente rentabilidad', className: 'status-excellent' };
    if (margin > 10) return { label: 'Buena rentabilidad', className: 'status-good' };
    if (margin > 0) return { label: 'Rentabilidad baja', className: 'status-low' };
    return { label: 'Pérdida operativa', className: 'status-loss' };
  }

  getMarginProgress(): number {
    if (!this.profitLossReport) return 0;
    const margin = this.profitLossReport.profitMargin;
    if (margin <= 0) return 15;
    if (margin >= 40) return 100;
    return Math.min(100, Math.round((margin / 40) * 100));
  }

  getDaysDifference(): number {
    if (!this.filters.startDate || !this.filters.endDate) return 0;
    const start = new Date(this.filters.startDate);
    const end = new Date(this.filters.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Export functions - CSV
  exportSalesReport(): void {
    if (this.salesReport) {
      this.reportService.exportToCSV(this.salesReport.items, 'reporte-ventas');
      this.notificationService.notifySuccess('Reporte exportado a CSV');
    }
  }

  exportSalesByProduct(): void {
    this.reportService.exportToCSV(this.salesByProduct, 'ventas-por-producto');
    this.notificationService.notifySuccess('Reporte exportado a CSV');
  }

  exportSalesByCustomer(): void {
    this.reportService.exportToCSV(this.salesByCustomer, 'ventas-por-cliente');
    this.notificationService.notifySuccess('Reporte exportado a CSV');
  }

  exportPurchasesReport(): void {
    if (this.purchasesReport) {
      this.reportService.exportToCSV(this.purchasesReport.items, 'reporte-compras');
      this.notificationService.notifySuccess('Reporte exportado a CSV');
    }
  }

  exportPurchasesBySupplier(): void {
    this.reportService.exportToCSV(this.purchasesBySupplier, 'compras-por-proveedor');
    this.notificationService.notifySuccess('Reporte exportado a CSV');
  }

  exportInventoryReport(): void {
    this.reportService.exportToCSV(this.inventoryReport, 'reporte-inventario');
    this.notificationService.notifySuccess('Reporte exportado a CSV');
  }

  // Export functions - Excel
  exportSalesToExcel(): void {
    if (this.salesReport && this.salesReport.items.length > 0) {
      const sheets = [
        { name: 'Resumen', data: [{ 
          'Total Ventas': this.salesReport.totalSales,
          'Total Transacciones': this.salesReport.totalTransactions,
          'Ticket Promedio': this.salesReport.averageTicket
        }]},
        { name: 'Detalle Ventas', data: this.salesReport.items.map(item => ({
          ID: item.saleId,
          Fecha: new Date(item.saleDate).toLocaleDateString('es-PE'),
          Cliente: item.customerName,
          Documento: item.customerDocument,
          Items: item.itemsCount,
          Total: item.total,
          Usuario: item.userName
        }))},
        { name: 'Por Producto', data: this.salesByProduct.map(p => ({
          Producto: p.productName,
          Marca: p.brand,
          Categoría: p.categoryName,
          'Cantidad Vendida': p.totalQuantitySold,
          Ingresos: p.totalRevenue,
          'Precio Promedio': p.averagePrice
        }))},
        { name: 'Por Cliente', data: this.salesByCustomer.map(c => ({
          Cliente: c.customerName,
          Documento: c.documentNumber,
          'Total Compras': c.totalPurchases,
          'Total Gastado': c.totalSpent,
          'Ticket Promedio': c.averageTicket,
          'Última Compra': new Date(c.lastPurchaseDate).toLocaleDateString('es-PE')
        }))}
      ];
      this.exportService.exportMultipleSheetsToExcel(sheets, 'reporte-ventas-completo');
      this.notificationService.notifySuccess('Reporte exportado a Excel');
    }
  }

  // Export functions - PDF
  async exportSalesToPDF(): Promise<void> {
    if (this.salesReport && this.salesReport.items.length > 0) {
      this.notificationService.notifySuccess('Generando PDF...');
      
      const columns = [
        { header: 'ID', dataKey: 'saleId' },
        { header: 'Fecha', dataKey: 'saleDate' },
        { header: 'Cliente', dataKey: 'customerName' },
        { header: 'Items', dataKey: 'itemsCount' },
        { header: 'Total', dataKey: 'total' }
      ];

      const data = this.salesReport.items.map(item => ({
        saleId: item.saleId,
        saleDate: new Date(item.saleDate).toLocaleDateString('es-PE'),
        customerName: item.customerName,
        itemsCount: item.itemsCount,
        total: `S/ ${item.total.toFixed(2)}`
      }));

      const additionalInfo = [
        { label: 'Período', value: `${new Date(this.salesReport.startDate).toLocaleDateString('es-PE')} - ${new Date(this.salesReport.endDate).toLocaleDateString('es-PE')}` },
        { label: 'Total Ventas', value: `S/ ${this.salesReport.totalSales.toFixed(2)}` },
        { label: 'Total Transacciones', value: this.salesReport.totalTransactions.toString() },
        { label: 'Ticket Promedio', value: `S/ ${this.salesReport.averageTicket.toFixed(2)}` }
      ];

      await this.exportService.exportToPDF(
        'Reporte de Ventas',
        data,
        columns,
        'reporte-ventas',
        additionalInfo
      );

      this.notificationService.notifySuccess('PDF generado exitosamente');
    }
  }
}
