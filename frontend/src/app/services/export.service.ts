import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Sanitiza una celda para prevenir CSV/Formula Injection.
   * Celdas que empiecen con = + - @ se prefijan con comilla simple.
   */
  private sanitizeCell(value: any): any {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (trimmed.startsWith('=') || trimmed.startsWith('+') ||
        trimmed.startsWith('-') || trimmed.startsWith('@')) {
      return "'" + trimmed;
    }
    return value;
  }

  /** Sanitiza todos los valores string de un array de objetos */
  private sanitizeData(data: any[]): any[] {
    return data.map(row => {
      const sanitized: any = {};
      for (const key of Object.keys(row)) {
        sanitized[key] = this.sanitizeCell(row[key]);
      }
      return sanitized;
    });
  }

  // Export data to Excel
  exportToExcel(data: any[], fileName: string, sheetName: string = 'Datos'): void {
    const ws = XLSX.utils.json_to_sheet(this.sanitizeData(data));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  // Export multiple sheets to Excel
  exportMultipleSheetsToExcel(sheets: { name: string; data: any[] }[], fileName: string): void {
    const wb = XLSX.utils.book_new();
    
    sheets.forEach(sheet => {
      const ws = XLSX.utils.json_to_sheet(this.sanitizeData(sheet.data));
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });
    
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  // Export to PDF with custom layout
  async exportToPDF(
    title: string,
    data: any[],
    columns: { header: string; dataKey: string }[],
    fileName: string,
    additionalInfo?: { label: string; value: string }[]
  ): Promise<void> {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text(title, 14, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, 14, 28);
    
    let yPosition = 35;
    
    // Add additional info if provided
    if (additionalInfo && additionalInfo.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80);
      additionalInfo.forEach(info => {
        doc.text(`${info.label}: ${info.value}`, 14, yPosition);
        yPosition += 7;
      });
      yPosition += 5;
    }
    
    // Add table
    autoTable(doc, {
      startY: yPosition,
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.dataKey] || '')),
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(127, 140, 141);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        'NobleStep - Sistema de Gestión',
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }
    
    doc.save(`${fileName}.pdf`);
  }

  // Export dashboard with charts to PDF
  async exportDashboardToPDF(
    metrics: any,
    chartElements: { id: string; title: string }[],
    topProducts: any[],
    lowStockProducts: any[]
  ): Promise<void> {
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('Dashboard - NobleStep', 14, yPosition);
    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-PE', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    })}`, 14, yPosition);
    yPosition += 15;

    // Metrics Section
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Métricas Principales', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    const metricsData = [
      ['Ventas Totales', `S/ ${metrics.totalSales.toFixed(2)}`, `${metrics.totalSalesCount} transacciones`],
      ['Ventas Hoy', `S/ ${metrics.todaySales.toFixed(2)}`, `${metrics.todaySalesCount} ventas`],
      ['Ventas del Mes', `S/ ${metrics.monthSales.toFixed(2)}`, `${metrics.monthSalesCount} ventas`],
      ['Ticket Promedio', `S/ ${metrics.averageSaleAmount.toFixed(2)}`, 'Por venta'],
      ['Productos Activos', metrics.activeProducts.toString(), `${metrics.totalProducts} total`],
      ['Stock Bajo', metrics.lowStockProducts.toString(), 'Productos críticos'],
      ['Clientes', metrics.totalCustomers.toString(), 'Registrados'],
      ['Proveedores', metrics.totalSuppliers.toString(), 'Activos']
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor', 'Detalle']],
      body: metricsData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Top Products Section
    if (topProducts && topProducts.length > 0) {
      // Check if we need a new page
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Top 5 Productos Más Vendidos', 14, yPosition);
      yPosition += 8;

      const productsData = topProducts.map((p, i) => [
        `#${i + 1}`,
        p.productName,
        p.brand,
        p.totalQuantitySold.toString(),
        `S/ ${p.totalRevenue.toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['#', 'Producto', 'Marca', 'Vendidos', 'Ingresos']],
        body: productsData,
        theme: 'grid',
        headStyles: { fillColor: [46, 204, 113] },
        margin: { left: 14, right: 14 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Low Stock Section
    if (lowStockProducts && lowStockProducts.length > 0) {
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Alertas de Stock Bajo', 14, yPosition);
      yPosition += 8;

      const stockData = lowStockProducts.map(p => [
        p.name,
        p.brand,
        p.size,
        p.stock.toString(),
        `S/ ${p.price.toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Producto', 'Marca', 'Talla', 'Stock', 'Precio']],
        body: stockData,
        theme: 'grid',
        headStyles: { fillColor: [230, 126, 34] },
        margin: { left: 14, right: 14 }
      });
    }

    // Add charts as images
    for (const chartEl of chartElements) {
      const element = document.getElementById(chartEl.id);
      if (element) {
        try {
          doc.addPage();
          doc.setFontSize(14);
          doc.setTextColor(44, 62, 80);
          doc.text(chartEl.title, 14, 20);

          const canvas = await html2canvas(element, {
            scale: 2,
            logging: false,
            backgroundColor: '#ffffff'
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 180;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          doc.addImage(imgData, 'PNG', 14, 30, imgWidth, imgHeight);
        } catch (error) {
          console.error('Error capturing chart:', error);
        }
      }
    }

    // Add footer to all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(127, 140, 141);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`dashboard-noblestep-${new Date().getTime()}.pdf`);
  }

  // Export dashboard to Excel with multiple sheets
  exportDashboardToExcel(
    metrics: any,
    topProducts: any[],
    lowStockProducts: any[],
    recentSales: any[]
  ): void {
    const wb = XLSX.utils.book_new();

    // Metrics Sheet
    const metricsData = [
      { Métrica: 'Ventas Totales', Valor: metrics.totalSales, Detalle: `${metrics.totalSalesCount} transacciones` },
      { Métrica: 'Ventas Hoy', Valor: metrics.todaySales, Detalle: `${metrics.todaySalesCount} ventas` },
      { Métrica: 'Ventas del Mes', Valor: metrics.monthSales, Detalle: `${metrics.monthSalesCount} ventas` },
      { Métrica: 'Ticket Promedio', Valor: metrics.averageSaleAmount, Detalle: 'Por venta' },
      { Métrica: 'Productos Activos', Valor: metrics.activeProducts, Detalle: `${metrics.totalProducts} total` },
      { Métrica: 'Stock Bajo', Valor: metrics.lowStockProducts, Detalle: 'Productos críticos' },
      { Métrica: 'Clientes', Valor: metrics.totalCustomers, Detalle: 'Registrados' },
      { Métrica: 'Proveedores', Valor: metrics.totalSuppliers, Detalle: 'Activos' }
    ];
    const wsMetrics = XLSX.utils.json_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(wb, wsMetrics, 'Métricas');

    // Top Products Sheet
    if (topProducts && topProducts.length > 0) {
      const productsData = topProducts.map((p, i) => ({
        Ranking: i + 1,
        Producto: p.productName,
        Marca: p.brand,
        Categoría: p.categoryName,
        'Cantidad Vendida': p.totalQuantitySold,
        'Ingresos (S/)': p.totalRevenue
      }));
      const wsProducts = XLSX.utils.json_to_sheet(productsData);
      XLSX.utils.book_append_sheet(wb, wsProducts, 'Top Productos');
    }

    // Low Stock Sheet
    if (lowStockProducts && lowStockProducts.length > 0) {
      const stockData = lowStockProducts.map(p => ({
        Producto: p.name,
        Marca: p.brand,
        Talla: p.size,
        Stock: p.stock,
        'Precio (S/)': p.price
      }));
      const wsStock = XLSX.utils.json_to_sheet(stockData);
      XLSX.utils.book_append_sheet(wb, wsStock, 'Stock Bajo');
    }

    // Recent Sales Sheet
    if (recentSales && recentSales.length > 0) {
      const salesData = recentSales.map(s => ({
        ID: s.id,
        Fecha: new Date(s.saleDate).toLocaleDateString('es-PE'),
        Cliente: s.customerName,
        Items: s.itemsCount,
        'Total (S/)': s.total,
        Estado: s.status
      }));
      const wsSales = XLSX.utils.json_to_sheet(salesData);
      XLSX.utils.book_append_sheet(wb, wsSales, 'Ventas Recientes');
    }

    XLSX.writeFile(wb, `dashboard-noblestep-${new Date().getTime()}.xlsx`);
  }
}
