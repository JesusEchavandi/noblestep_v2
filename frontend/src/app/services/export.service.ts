import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  // =====================================================
  // UTILIDADES PRIVADAS
  // =====================================================

  private sanitizeCell(value: any): any {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (trimmed.startsWith('=') || trimmed.startsWith('+') ||
        trimmed.startsWith('-') || trimmed.startsWith('@')) {
      return "'" + trimmed;
    }
    return value;
  }

  private sanitizeData(data: any[]): any[] {
    return data.map(row => {
      const sanitized: any = {};
      for (const key of Object.keys(row)) {
        sanitized[key] = this.sanitizeCell(row[key]);
      }
      return sanitized;
    });
  }

  private obtenerFechaFormateada(): string {
    return new Date().toLocaleDateString('es-PE', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  /** Elimina caracteres que jsPDF no puede renderizar con fuentes estándar */
  private limpiarTexto(texto: string): string {
    if (!texto) return '';
    return texto
      .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u')
      .replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Ú/g, 'U')
      .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
      .replace(/©/g, '(c)').replace(/—/g, '-').replace(/–/g, '-')
      .replace(/⚠/g, '!').replace(/"/g, '"').replace(/"/g, '"')
      .replace(/'/g, "'").replace(/'/g, "'");
  }

  // =====================================================
  // EXCEL - EXPORTACIÓN PROFESIONAL
  // =====================================================

  exportarAExcel(data: any[], fileName: string, sheetName: string = 'Datos'): void {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(this.sanitizeData(data));
    this.formatearHojaExcel(ws, data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  exportarMultiplesHojasAExcel(sheets: { name: string; data: any[]; moneyColumns?: string[] }[], fileName: string): void {
    const wb = XLSX.utils.book_new();
    sheets.forEach(sheet => {
      const ws = XLSX.utils.json_to_sheet(this.sanitizeData(sheet.data));
      this.formatearHojaExcel(ws, sheet.data, sheet.moneyColumns);
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  /** Exportación Excel con título, resumen y datos en una sola hoja profesional */
  exportarExcelProfesional(config: {
    titulo: string;
    subtitulo?: string;
    resumen?: { etiqueta: string; valor: string | number }[];
    columnas: { titulo: string; campo: string; formato?: 'moneda' | 'numero' | 'porcentaje' | 'fecha' }[];
    datos: any[];
    nombreArchivo: string;
    nombreHoja?: string;
  }): void {
    const wb = XLSX.utils.book_new();
    const wsData: any[][] = [];

    // Fila 1: Título
    wsData.push([config.titulo]);
    wsData.push([config.subtitulo || `Generado: ${this.obtenerFechaFormateada()}`]);
    wsData.push([]);  // Fila vacía

    // Resumen si existe
    if (config.resumen && config.resumen.length > 0) {
      config.resumen.forEach(item => {
        wsData.push([item.etiqueta, item.valor]);
      });
      wsData.push([]); // Fila vacía
    }

    // Encabezados de tabla
    const filaInicioTabla = wsData.length;
    wsData.push(config.columnas.map(c => c.titulo));

    // Datos
    config.datos.forEach(row => {
      wsData.push(config.columnas.map(col => {
        const val = row[col.campo];
        if (col.formato === 'moneda' && typeof val === 'number') return val;
        if (col.formato === 'porcentaje' && typeof val === 'number') return val;
        return val ?? '';
      }));
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Anchos de columna automáticos
    const colWidths = config.columnas.map((col, i) => {
      const headerLen = col.titulo.length;
      const maxDataLen = config.datos.reduce((max, row) => {
        const val = String(row[col.campo] ?? '');
        return Math.max(max, val.length);
      }, 0);
      return { wch: Math.max(headerLen, maxDataLen, 12) + 3 };
    });
    ws['!cols'] = colWidths;

    // Merge para título
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: config.columnas.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: config.columnas.length - 1 } }
    ];

    XLSX.utils.book_append_sheet(wb, ws, config.nombreHoja || 'Reporte');
    XLSX.writeFile(wb, `${config.nombreArchivo}.xlsx`);
  }

  private formatearHojaExcel(ws: XLSX.WorkSheet, data: any[], moneyColumns?: string[]): void {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const colWidths = headers.map((header, i) => {
      const headerLen = header.length;
      const maxDataLen = data.reduce((max, row) => {
        const val = String(row[header] ?? '');
        return Math.max(max, val.length);
      }, 0);
      return { wch: Math.max(headerLen, maxDataLen, 10) + 2 };
    });
    ws['!cols'] = colWidths;
  }

  // =====================================================
  // PDF - EXPORTACIÓN PROFESIONAL
  // =====================================================

  /** PDF genérico mejorado con header, resumen y tabla */
  async exportarAPDF(
    title: string,
    data: any[],
    columns: { header: string; dataKey: string }[],
    fileName: string,
    additionalInfo?: { label: string; value: string }[]
  ): Promise<void> {
    const doc = new jsPDF();
    let y = this.dibujarCabeceraPDF(doc, title);

    // Info adicional
    if (additionalInfo && additionalInfo.length > 0) {
      y = this.dibujarResumenPDF(doc, additionalInfo, y);
    }

    // Tabla
    autoTable(doc, {
      startY: y,
      head: [columns.map(col => this.limpiarTexto(col.header))],
      body: data.map(row => columns.map(col => {
        const val = row[col.dataKey] ?? '';
        return typeof val === 'string' ? this.limpiarTexto(val) : val;
      })),
      theme: 'grid',
      headStyles: { fillColor: [26, 26, 26], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      margin: { left: 14, right: 14 }
    });

    this.dibujarPiePDF(doc);
    doc.save(`${fileName}.pdf`);
  }

  /** PDF profesional con múltiples secciones */
  async exportarPDFProfesional(config: {
    titulo: string;
    subtitulo?: string;
    resumen?: { etiqueta: string; valor: string }[];
    secciones: {
      titulo: string;
      columnas: { header: string; dataKey: string; align?: 'left' | 'center' | 'right' }[];
      datos: any[];
      colorCabecera?: [number, number, number];
    }[];
    nombreArchivo: string;
  }): Promise<void> {
    const doc = new jsPDF();
    let y = this.dibujarCabeceraPDF(doc, config.titulo, config.subtitulo);

    // Resumen
    if (config.resumen && config.resumen.length > 0) {
      y = this.dibujarTarjetasResumenPDF(doc, config.resumen, y);
    }

    // Secciones
    for (let i = 0; i < config.secciones.length; i++) {
      const seccion = config.secciones[i];

      // Verificar si necesita nueva página
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      // Título de sección
      doc.setFontSize(13);
      doc.setTextColor(26, 26, 26);
      doc.text(this.limpiarTexto(seccion.titulo), 14, y);
      y += 2;

      // Línea decorativa
      doc.setDrawColor(124, 58, 237);
      doc.setLineWidth(0.8);
      doc.line(14, y, 60, y);
      y += 6;

      if (seccion.datos.length === 0) {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('Sin datos disponibles', 14, y);
        y += 12;
        continue;
      }

      // Columnas con alineación
      const columnStyles: any = {};
      seccion.columnas.forEach((col, idx) => {
        if (col.align) {
          columnStyles[idx] = { halign: col.align };
        }
      });

      autoTable(doc, {
        startY: y,
        head: [seccion.columnas.map(col => this.limpiarTexto(col.header))],
        body: seccion.datos.map(row => seccion.columnas.map(col => {
          const val = row[col.dataKey] ?? '';
          return typeof val === 'string' ? this.limpiarTexto(val) : val;
        })),
        theme: 'grid',
        headStyles: {
          fillColor: seccion.colorCabecera || [26, 26, 26],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8.5
        },
        styles: { fontSize: 8, cellPadding: 2.5 },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        columnStyles,
        margin: { left: 14, right: 14 }
      });

      y = (doc as any).lastAutoTable.finalY + 14;
    }

    this.dibujarPiePDF(doc);
    doc.save(`${config.nombreArchivo}.pdf`);
  }

  // =====================================================
  // PDF - HELPERS VISUALES
  // =====================================================

  private dibujarCabeceraPDF(doc: jsPDF, titulo: string, subtitulo?: string): number {
    const ancho = doc.internal.pageSize.getWidth();

    // Barra superior
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, ancho, 35, 'F');

    // Acento morado
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 35, ancho, 3, 'F');

    // Nombre empresa
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('NobleStep', 14, 18);

    // Subtítulo empresa
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text('Sistema de Gestion Empresarial', 14, 26);

    // Fecha
    doc.setFontSize(8);
    doc.text(this.limpiarTexto(this.obtenerFechaFormateada()), ancho - 14, 26, { align: 'right' });

    // Título del reporte
    let y = 48;
    doc.setFontSize(16);
    doc.setTextColor(26, 26, 26);
    doc.text(this.limpiarTexto(titulo), 14, y);
    y += 6;

    if (subtitulo) {
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(this.limpiarTexto(subtitulo), 14, y);
      y += 6;
    }

    // Línea separadora
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(14, y, ancho - 14, y);
    y += 8;

    return y;
  }

  private dibujarResumenPDF(doc: jsPDF, info: { label: string; value: string }[], y: number): number {
    doc.setFontSize(10);
    info.forEach(item => {
      doc.setTextColor(107, 114, 128);
      doc.text(this.limpiarTexto(item.label) + ':', 14, y);
      doc.setTextColor(26, 26, 26);
      doc.setFont('helvetica', 'bold');
      doc.text(this.limpiarTexto(item.value), 70, y);
      doc.setFont('helvetica', 'normal');
      y += 6.5;
    });
    return y + 4;
  }

  private dibujarTarjetasResumenPDF(doc: jsPDF, items: { etiqueta: string; valor: string }[], y: number): number {
    const ancho = doc.internal.pageSize.getWidth();
    const margen = 14;
    const espacioDisponible = ancho - margen * 2;
    const cantidadPorFila = Math.min(items.length, 4);
    const anchoTarjeta = (espacioDisponible - (cantidadPorFila - 1) * 6) / cantidadPorFila;
    const altoTarjeta = 28;

    const colores: [number, number, number][] = [
      [124, 58, 237],  // Morado
      [16, 185, 129],  // Verde
      [59, 130, 246],  // Azul
      [245, 158, 11],  // Naranja
    ];

    for (let i = 0; i < items.length; i++) {
      const fila = Math.floor(i / cantidadPorFila);
      const col = i % cantidadPorFila;
      const x = margen + col * (anchoTarjeta + 6);
      const yCard = y + fila * (altoTarjeta + 4);

      const color = colores[i % colores.length];
      doc.setFillColor(...color);
      doc.roundedRect(x, yCard, anchoTarjeta, altoTarjeta, 3, 3, 'F');

      // Etiqueta
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(this.limpiarTexto(items[i].etiqueta), x + 5, yCard + 10);

      // Valor
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(this.limpiarTexto(items[i].valor), x + 5, yCard + 21);
      doc.setFont('helvetica', 'normal');
    }

    const filas = Math.ceil(items.length / cantidadPorFila);
    return y + filas * (altoTarjeta + 4) + 8;
  }

  private dibujarPiePDF(doc: jsPDF): void {
    const pageCount = (doc as any).internal.getNumberOfPages();
    const ancho = doc.internal.pageSize.getWidth();
    const alto = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Línea superior del pie
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(14, alto - 16, ancho - 14, alto - 16);

      doc.setFontSize(7.5);
      doc.setTextColor(156, 163, 175);
      doc.text('NobleStep - Sistema de Gestion Empresarial', 14, alto - 10);
      doc.text(`Pagina ${i} de ${pageCount}`, ancho - 14, alto - 10, { align: 'right' });
    }
  }

  // =====================================================
  // DASHBOARD - EXPORTACIONES
  // =====================================================

  async exportDashboardToPDF(
    metrics: any,
    chartElements: { id: string; title: string }[],
    topProducts: any[],
    lowStockProducts: any[]
  ): Promise<void> {
    const doc = new jsPDF();
    let y = this.dibujarCabeceraPDF(doc, 'Reporte del Dashboard', 'Resumen ejecutivo del estado actual del negocio');

    // Métricas principales como tarjetas
    const tarjetasMetricas = [
      { etiqueta: 'Ventas Totales', valor: `S/ ${(metrics.totalVentas ?? 0).toFixed(2)}` },
      { etiqueta: 'Ventas Hoy', valor: `S/ ${(metrics.ventasHoy ?? 0).toFixed(2)}` },
      { etiqueta: 'Ticket Promedio', valor: `S/ ${(metrics.montoPromedioVenta ?? 0).toFixed(2)}` },
      { etiqueta: 'Productos Activos', valor: (metrics.productosActivos ?? 0).toString() },
    ];
    y = this.dibujarTarjetasResumenPDF(doc, tarjetasMetricas, y);

    // Tabla de métricas adicionales
    autoTable(doc, {
      startY: y,
      head: [['Metrica', 'Valor', 'Detalle']],
      body: [
        ['Ventas del Mes', `S/ ${(metrics.ventasMes ?? 0).toFixed(2)}`, `${metrics.cantidadVentasMes ?? 0} ventas`],
        ['Total Compras', `S/ ${(metrics.totalCompras ?? 0).toFixed(2)}`, `${metrics.cantidadTotalCompras ?? 0} compras`],
        ['Stock Bajo', (metrics.productosBajoStock ?? 0).toString(), 'Productos criticos'],
        ['Clientes', (metrics.totalClientes ?? 0).toString(), 'Registrados'],
        ['Proveedores', (metrics.totalProveedores ?? 0).toString(), 'Activos']
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 26, 26], fontSize: 9 },
      styles: { fontSize: 8.5 },
      margin: { left: 14, right: 14 }
    });
    y = (doc as any).lastAutoTable.finalY + 14;

    // Top Productos
    if (topProducts && topProducts.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setTextColor(26, 26, 26);
      doc.text('Top Productos Mas Vendidos', 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['#', 'Producto', 'Marca', 'Vendidos', 'Ingresos']],
        body: topProducts.map((p, i) => [
          `#${i + 1}`,
          p.nombreProducto ?? '',
          p.marca ?? '',
          (p.cantidadTotalVendida ?? 0).toString(),
          `S/ ${(p.ingresosTotales ?? 0).toFixed(2)}`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], fontSize: 9 },
        styles: { fontSize: 8.5 },
        margin: { left: 14, right: 14 }
      });
      y = (doc as any).lastAutoTable.finalY + 14;
    }

    // Stock Bajo
    if (lowStockProducts && lowStockProducts.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setTextColor(26, 26, 26);
      doc.text('Alertas de Stock Bajo', 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Producto', 'Marca', 'Talla', 'Stock', 'Precio']],
        body: lowStockProducts.map(p => [
          p.nombre ?? '',
          p.marca ?? '',
          p.talla ?? '',
          (p.stock ?? 0).toString(),
          `S/ ${(p.precio ?? 0).toFixed(2)}`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68], fontSize: 9 },
        styles: { fontSize: 8.5 },
        margin: { left: 14, right: 14 }
      });
    }

    this.dibujarPiePDF(doc);
    doc.save(`dashboard-noblestep-${new Date().getTime()}.pdf`);
  }

  // Dashboard Excel mejorado
  exportDashboardToExcel(
    metrics: any,
    topProducts: any[],
    lowStockProducts: any[],
    recentSales: any[]
  ): void {
    const hojas: { name: string; data: any[] }[] = [
      { name: 'Métricas', data: [
        { Métrica: 'Ventas Totales', Valor: `S/ ${(metrics.totalVentas ?? 0).toFixed(2)}`, Detalle: `${metrics.cantidadTotalVentas ?? 0} transacciones` },
        { Métrica: 'Ventas Hoy', Valor: `S/ ${(metrics.ventasHoy ?? 0).toFixed(2)}`, Detalle: `${metrics.cantidadVentasHoy ?? 0} ventas` },
        { Métrica: 'Ventas del Mes', Valor: `S/ ${(metrics.ventasMes ?? 0).toFixed(2)}`, Detalle: `${metrics.cantidadVentasMes ?? 0} ventas` },
        { Métrica: 'Ticket Promedio', Valor: `S/ ${(metrics.montoPromedioVenta ?? 0).toFixed(2)}`, Detalle: 'Por venta' },
        { Métrica: 'Productos Activos', Valor: metrics.productosActivos ?? 0, Detalle: `${metrics.totalProductos ?? 0} total` },
        { Métrica: 'Stock Bajo', Valor: metrics.productosBajoStock ?? 0, Detalle: 'Productos críticos' },
        { Métrica: 'Clientes', Valor: metrics.totalClientes ?? 0, Detalle: 'Registrados' },
        { Métrica: 'Proveedores', Valor: metrics.totalProveedores ?? 0, Detalle: 'Activos' }
      ]}
    ];

    if (topProducts?.length > 0) {
      hojas.push({ name: 'Top Productos', data: topProducts.map((p, i) => ({
        Ranking: i + 1, Producto: p.nombreProducto, Marca: p.marca,
        'Cantidad Vendida': p.cantidadTotalVendida,
        'Ingresos (S/)': (p.ingresosTotales ?? 0).toFixed(2)
      }))});
    }

    if (lowStockProducts?.length > 0) {
      hojas.push({ name: 'Stock Bajo', data: lowStockProducts.map(p => ({
        Producto: p.nombre, Marca: p.marca, Talla: p.talla,
        Stock: p.stock, 'Precio (S/)': (p.precio ?? 0).toFixed(2)
      }))});
    }

    if (recentSales?.length > 0) {
      hojas.push({ name: 'Ventas Recientes', data: recentSales.map(s => ({
        ID: s.id, Fecha: new Date(s.fechaVenta).toLocaleDateString('es-PE'),
        Cliente: s.nombreCliente, Items: s.cantidadItems,
        'Total (S/)': (s.total ?? 0).toFixed(2), Estado: s.estado
      }))});
    }

    this.exportarMultiplesHojasAExcel(hojas, `dashboard-noblestep-${new Date().getTime()}`);
  }
}
