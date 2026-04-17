import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, ReporteVentas, VentasPorProducto, VentasPorCliente, ReporteCompras, ComprasPorProveedor, ReporteInventario, ValuacionInventario, ReporteGananciaPerdida } from '../services/report.service';
import { CategoryService } from '../services/category.service';
import { ExportService } from '../services/export.service';
import { NotificationService } from '../services/notification.service';
import { Categoria } from '../models/category.model';

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

  pestanaActiva: string = 'ventas';
  categorias: Categoria[] = [];

  filtros = {
    fechaInicio: '',
    fechaFin: '',
    categoriaId: null as number | null
  };

  // Reportes de Ventas
  reporteVentas: ReporteVentas | null = null;
  ventasPorProducto: VentasPorProducto[] = [];
  ventasPorCliente: VentasPorCliente[] = [];

  // Reportes de Compras
  reporteCompras: ReporteCompras | null = null;
  comprasPorProveedor: ComprasPorProveedor[] = [];

  // Reportes de Inventario
  reporteInventario: ReporteInventario[] = [];
  valuacionInventario: ValuacionInventario | null = null;

  // Reporte de Ganancia/Pérdida
  reporteGananciaPerdida: ReporteGananciaPerdida | null = null;

  cargando = false;

  ngOnInit(): void {
    this.cargarCategorias();
    this.establecerFechasPredeterminadas();
    this.cargarReportesVentas();
  }

  establecerFechasPredeterminadas(): void {
    const hoy = new Date();
    const tresAtras = new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1);

    this.filtros.fechaFin = hoy.toISOString().split('T')[0];
    this.filtros.fechaInicio = tresAtras.toISOString().split('T')[0];
  }

  cargarCategorias(): void {
    this.categoryService.obtenerCategorias().subscribe({
      next: (datos) => this.categorias = datos,
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  cargarReportesVentas(): void {
    this.cargando = true;
    this.reportService.obtenerReporteVentas(this.filtros.fechaInicio, this.filtros.fechaFin).subscribe({
      next: (datos) => {
        this.reporteVentas = datos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar reporte de ventas:', err);
        this.cargando = false;
      }
    });

    this.reportService.obtenerVentasPorProducto(this.filtros.fechaInicio, this.filtros.fechaFin, this.filtros.categoriaId ?? undefined).subscribe({
      next: (datos) => this.ventasPorProducto = datos,
      error: (err) => console.error('Error:', err)
    });

    this.reportService.obtenerVentasPorCliente(this.filtros.fechaInicio, this.filtros.fechaFin).subscribe({
      next: (datos) => this.ventasPorCliente = datos,
      error: (err) => console.error('Error:', err)
    });
  }

  cargarReportesCompras(): void {
    this.cargando = true;
    this.reportService.obtenerReporteCompras(this.filtros.fechaInicio, this.filtros.fechaFin).subscribe({
      next: (datos) => {
        this.reporteCompras = datos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
      }
    });

    this.reportService.obtenerComprasPorProveedor(this.filtros.fechaInicio, this.filtros.fechaFin).subscribe({
      next: (datos) => this.comprasPorProveedor = datos,
      error: (err) => console.error('Error:', err)
    });
  }

  cargarReportesInventario(): void {
    this.cargando = true;
    this.reportService.obtenerReporteInventario(this.filtros.categoriaId ?? undefined).subscribe({
      next: (datos) => {
        this.reporteInventario = datos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
      }
    });

    this.reportService.obtenerValuacionInventario().subscribe({
      next: (datos) => this.valuacionInventario = datos,
      error: (err) => console.error('Error:', err)
    });
  }

  cargarReporteGananciaPerdida(): void {
    this.cargando = true;
    this.reportService.obtenerReporteGananciaPerdida(this.filtros.fechaInicio, this.filtros.fechaFin).subscribe({
      next: (datos) => {
        this.reporteGananciaPerdida = datos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
      }
    });
  }

  obtenerClaseGanancia(): string {
    if (!this.reporteGananciaPerdida) return '';
    return this.reporteGananciaPerdida.gananciaBruta >= 0 ? 'text-success' : 'text-danger';
  }

  obtenerEstadoMargen(): { label: string; className: string } {
    if (!this.reporteGananciaPerdida) return { label: '', className: '' };
    const margen = this.reporteGananciaPerdida.margenGanancia;
    if (margen > 20) return { label: 'Excelente rentabilidad', className: 'status-excellent' };
    if (margen > 10) return { label: 'Buena rentabilidad', className: 'status-good' };
    if (margen > 0) return { label: 'Rentabilidad baja', className: 'status-low' };
    return { label: 'Pérdida operativa', className: 'status-loss' };
  }

  obtenerProgresoMargen(): number {
    if (!this.reporteGananciaPerdida) return 0;
    const margen = this.reporteGananciaPerdida.margenGanancia;
    if (margen <= 0) return 15;
    if (margen >= 40) return 100;
    return Math.min(100, Math.round((margen / 40) * 100));
  }

  obtenerDiferenciaDias(): number {
    if (!this.filtros.fechaInicio || !this.filtros.fechaFin) return 0;
    const inicio = new Date(this.filtros.fechaInicio);
    const fin = new Date(this.filtros.fechaFin);
    return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  }

  // =====================================================
  // EXPORTACIONES - VENTAS
  // =====================================================

  exportarReporteVentas(): void {
    if (this.reporteVentas) {
      this.reportService.exportarACSV(this.reporteVentas.items, 'reporte-ventas');
      this.notificationService.notifySuccess('Reporte exportado a CSV');
    }
  }

  exportarVentasPorProducto(): void {
    this.reportService.exportarACSV(this.ventasPorProducto, 'ventas-por-producto');
    this.notificationService.notifySuccess('Reporte exportado a CSV');
  }

  exportarVentasPorCliente(): void {
    this.reportService.exportarACSV(this.ventasPorCliente, 'ventas-por-cliente');
    this.notificationService.notifySuccess('Reporte exportado a CSV');
  }

  exportarReporteCompras(): void {
    if (this.reporteCompras) {
      this.reportService.exportarACSV(this.reporteCompras.items, 'reporte-compras');
      this.notificationService.notifySuccess('Reporte exportado a CSV');
    }
  }

  exportarComprasPorProveedor(): void {
    this.reportService.exportarACSV(this.comprasPorProveedor, 'compras-por-proveedor');
    this.notificationService.notifySuccess('Reporte exportado a CSV');
  }

  exportarReporteInventario(): void {
    this.reportService.exportarACSV(this.reporteInventario, 'reporte-inventario');
    this.notificationService.notifySuccess('Reporte exportado a CSV');
  }

  // Funciones de exportación - Excel
  exportarVentasAExcel(): void {
    if (this.reporteVentas && this.reporteVentas.items.length > 0) {
      const hojas = [
        { name: 'Resumen', data: [{
          'Total Ventas': `S/ ${this.reporteVentas.totalVentas.toFixed(2)}`,
          'Total Transacciones': this.reporteVentas.totalTransacciones,
          'Ticket Promedio': `S/ ${this.reporteVentas.ticketPromedio.toFixed(2)}`,
          'Período': `${this.filtros.fechaInicio} al ${this.filtros.fechaFin}`
        }]},
        { name: 'Detalle Ventas', data: this.reporteVentas.items.map(item => ({
          ID: item.ventaId,
          Fecha: new Date(item.fechaVenta).toLocaleDateString('es-PE', { timeZone: 'America/Lima' }),
          Cliente: item.nombreCliente,
          Documento: item.documentoCliente,
          Items: item.cantidadItems,
          'Total (S/)': item.total.toFixed(2),
          Usuario: item.nombreUsuario
        }))},
        { name: 'Por Producto', data: this.ventasPorProducto.map(p => ({
          Producto: p.nombreProducto,
          Marca: p.marca,
          Categoría: p.nombreCategoria,
          'Cantidad Vendida': p.cantidadTotalVendida,
          'Ingresos (S/)': p.ingresosTotales.toFixed(2),
          'Precio Promedio (S/)': p.precioPromedio.toFixed(2)
        }))},
        { name: 'Por Cliente', data: this.ventasPorCliente.map(c => ({
          Cliente: c.nombreCliente,
          Documento: c.numeroDocumento,
          'Total Compras': c.totalCompras,
          'Total Gastado (S/)': c.totalGastado.toFixed(2),
          'Ticket Promedio (S/)': c.ticketPromedio.toFixed(2),
          'Última Compra': new Date(c.ultimaFechaCompra).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })
        }))}
      ];
      this.exportService.exportarMultiplesHojasAExcel(hojas, 'reporte-ventas-completo');
      this.notificationService.notifySuccess('Reporte exportado a Excel');
    }
  }

  exportarComprasAExcel(): void {
    if (this.reporteCompras && this.reporteCompras.items.length > 0) {
      const hojas = [
        { name: 'Resumen', data: [{
          'Total Compras': `S/ ${this.reporteCompras.totalCompras.toFixed(2)}`,
          'Total Transacciones': this.reporteCompras.totalTransacciones,
          'Período': `${this.filtros.fechaInicio} al ${this.filtros.fechaFin}`
        }]},
        { name: 'Detalle Compras', data: this.reporteCompras.items.map(item => ({
          ID: item.compraId,
          Fecha: new Date(item.fechaCompra).toLocaleDateString('es-PE', { timeZone: 'America/Lima' }),
          Proveedor: item.nombreProveedor,
          Documento: item.documentoProveedor,
          Items: item.cantidadItems,
          'Total (S/)': item.total.toFixed(2)
        }))},
        { name: 'Por Proveedor', data: this.comprasPorProveedor.map(p => ({
          Proveedor: p.nombreProveedor,
          Documento: p.numeroDocumento,
          'Total Compras': p.totalCompras,
          'Total Gastado (S/)': p.totalGastado.toFixed(2),
          'Última Compra': new Date(p.ultimaFechaCompra).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })
        }))}
      ];
      this.exportService.exportarMultiplesHojasAExcel(hojas, 'reporte-compras-completo');
      this.notificationService.notifySuccess('Reporte exportado a Excel');
    }
  }

  exportarInventarioAExcel(): void {
    if (this.reporteInventario.length > 0) {
      const hojas: { name: string; data: any[] }[] = [
        { name: 'Inventario', data: this.reporteInventario.map(item => ({
          Producto: item.nombreProducto,
          Marca: item.marca,
          Talla: item.talla || 'Única',
          Categoría: item.nombreCategoria,
          'Stock Actual': item.stockActual,
          'Precio Unit. (S/)': item.precioUnitario.toFixed(2),
          'Valor Total (S/)': item.valorTotal.toFixed(2),
          'Total Vendido': item.totalVendido,
          'Rotación': item.tasaRotacion.toFixed(2)
        }))}
      ];
      if (this.valuacionInventario) {
        hojas.unshift({ name: 'Valuación', data: [
          { Concepto: 'Valor Total del Inventario', Valor: `S/ ${this.valuacionInventario.valorTotal.toFixed(2)}` },
          { Concepto: 'Total de Unidades', Valor: this.valuacionInventario.totalUnidades },
          { Concepto: 'Total de Productos', Valor: this.valuacionInventario.totalProductos },
          ...this.valuacionInventario.porCategoria.map(c => ({
            Concepto: `Categoría: ${c.categoria}`, Valor: `S/ ${c.valorTotal.toFixed(2)} (${c.totalUnidades} uds, ${c.productos} prod.)`
          }))
        ]});
      }
      this.exportService.exportarMultiplesHojasAExcel(hojas, 'reporte-inventario-completo');
      this.notificationService.notifySuccess('Reporte exportado a Excel');
    }
  }

  exportarRentabilidadAExcel(): void {
    if (this.reporteGananciaPerdida) {
      const gp = this.reporteGananciaPerdida;
      this.exportService.exportarExcelProfesional({
        titulo: 'Reporte de Rentabilidad — NobleStep',
        subtitulo: `Período: ${this.filtros.fechaInicio} al ${this.filtros.fechaFin}`,
        resumen: [
          { etiqueta: 'Total Ingresos', valor: `S/ ${gp.totalVentas.toFixed(2)}` },
          { etiqueta: 'Total Egresos', valor: `S/ ${gp.totalCompras.toFixed(2)}` },
          { etiqueta: 'Utilidad Bruta', valor: `S/ ${gp.gananciaBruta.toFixed(2)}` },
          { etiqueta: 'Margen de Ganancia', valor: `${gp.margenGanancia.toFixed(2)}%` },
        ],
        columnas: [
          { titulo: 'Concepto', campo: 'concepto' },
          { titulo: 'Monto (S/)', campo: 'monto' },
          { titulo: 'Unidades', campo: 'unidades' },
          { titulo: 'Observación', campo: 'observacion' }
        ],
        datos: [
          { concepto: 'Ventas', monto: `S/ ${gp.totalVentas.toFixed(2)}`, unidades: gp.productosVendidos, observacion: 'Ingresos por ventas' },
          { concepto: 'Compras', monto: `S/ ${gp.totalCompras.toFixed(2)}`, unidades: gp.productosComprados, observacion: 'Costo de adquisición' },
          { concepto: 'Utilidad Bruta', monto: `S/ ${gp.gananciaBruta.toFixed(2)}`, unidades: '-', observacion: gp.gananciaBruta >= 0 ? 'Ganancia' : 'Pérdida' },
          { concepto: 'Margen', monto: `${gp.margenGanancia.toFixed(2)}%`, unidades: '-', observacion: this.obtenerEstadoMargen().label }
        ],
        nombreArchivo: 'reporte-rentabilidad'
      });
      this.notificationService.notifySuccess('Reporte exportado a Excel');
    }
  }

  // =====================================================
  // EXPORTACIONES - PDF
  // =====================================================

  async exportarVentasAPDF(): Promise<void> {
    if (!this.reporteVentas || this.reporteVentas.items.length === 0) return;
    this.notificationService.notifySuccess('Generando PDF...');

    const rv = this.reporteVentas;
    await this.exportService.exportarPDFProfesional({
      titulo: 'Reporte de Ventas',
      subtitulo: `Período: ${new Date(rv.fechaInicio).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })} — ${new Date(rv.fechaFin).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}`,
      resumen: [
        { etiqueta: 'Total Ventas', valor: `S/ ${rv.totalVentas.toFixed(2)}` },
        { etiqueta: 'Transacciones', valor: rv.totalTransacciones.toString() },
        { etiqueta: 'Ticket Promedio', valor: `S/ ${rv.ticketPromedio.toFixed(2)}` },
        { etiqueta: 'Días Analizados', valor: this.obtenerDiferenciaDias().toString() }
      ],
      secciones: [
        {
          titulo: 'Detalle de Ventas',
          colorCabecera: [124, 58, 237],
          columnas: [
            { header: 'ID', dataKey: 'id', align: 'center' },
            { header: 'Fecha', dataKey: 'fecha' },
            { header: 'Cliente', dataKey: 'cliente' },
            { header: 'Items', dataKey: 'items', align: 'center' },
            { header: 'Total', dataKey: 'total', align: 'right' }
          ],
          datos: rv.items.map(item => ({
            id: `#${item.ventaId}`,
            fecha: new Date(item.fechaVenta).toLocaleDateString('es-PE', { timeZone: 'America/Lima' }),
            cliente: item.nombreCliente,
            items: item.cantidadItems,
            total: `S/ ${item.total.toFixed(2)}`
          }))
        },
        {
          titulo: 'Ventas por Producto',
          colorCabecera: [16, 185, 129],
          columnas: [
            { header: 'Producto', dataKey: 'producto' },
            { header: 'Categoría', dataKey: 'categoria' },
            { header: 'Cantidad', dataKey: 'cantidad', align: 'center' },
            { header: 'Ingresos', dataKey: 'ingresos', align: 'right' }
          ],
          datos: this.ventasPorProducto.map(p => ({
            producto: `${p.nombreProducto} - ${p.marca}`,
            categoria: p.nombreCategoria,
            cantidad: p.cantidadTotalVendida,
            ingresos: `S/ ${p.ingresosTotales.toFixed(2)}`
          }))
        },
        {
          titulo: 'Ventas por Cliente',
          colorCabecera: [59, 130, 246],
          columnas: [
            { header: 'Cliente', dataKey: 'cliente' },
            { header: 'Compras', dataKey: 'compras', align: 'center' },
            { header: 'Total Gastado', dataKey: 'gastado', align: 'right' },
            { header: 'Ticket Prom.', dataKey: 'ticket', align: 'right' }
          ],
          datos: this.ventasPorCliente.map(c => ({
            cliente: c.nombreCliente,
            compras: c.totalCompras,
            gastado: `S/ ${c.totalGastado.toFixed(2)}`,
            ticket: `S/ ${c.ticketPromedio.toFixed(2)}`
          }))
        }
      ],
      nombreArchivo: 'reporte-ventas'
    });

    this.notificationService.notifySuccess('PDF generado exitosamente');
  }

  async exportarComprasAPDF(): Promise<void> {
    if (!this.reporteCompras || this.reporteCompras.items.length === 0) return;
    this.notificationService.notifySuccess('Generando PDF...');

    const rc = this.reporteCompras;
    await this.exportService.exportarPDFProfesional({
      titulo: 'Reporte de Compras',
      subtitulo: `Período: ${new Date(rc.fechaInicio).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })} — ${new Date(rc.fechaFin).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}`,
      resumen: [
        { etiqueta: 'Total Compras', valor: `S/ ${rc.totalCompras.toFixed(2)}` },
        { etiqueta: 'Transacciones', valor: rc.totalTransacciones.toString() },
        { etiqueta: 'Días Analizados', valor: this.obtenerDiferenciaDias().toString() }
      ],
      secciones: [
        {
          titulo: 'Detalle de Compras',
          colorCabecera: [220, 38, 38],
          columnas: [
            { header: 'ID', dataKey: 'id', align: 'center' },
            { header: 'Fecha', dataKey: 'fecha' },
            { header: 'Proveedor', dataKey: 'proveedor' },
            { header: 'Items', dataKey: 'items', align: 'center' },
            { header: 'Total', dataKey: 'total', align: 'right' }
          ],
          datos: rc.items.map(item => ({
            id: `#${item.compraId}`,
            fecha: new Date(item.fechaCompra).toLocaleDateString('es-PE', { timeZone: 'America/Lima' }),
            proveedor: item.nombreProveedor,
            items: item.cantidadItems,
            total: `S/ ${item.total.toFixed(2)}`
          }))
        },
        {
          titulo: 'Compras por Proveedor',
          colorCabecera: [245, 158, 11],
          columnas: [
            { header: 'Proveedor', dataKey: 'proveedor' },
            { header: 'Compras', dataKey: 'compras', align: 'center' },
            { header: 'Total Gastado', dataKey: 'gastado', align: 'right' },
            { header: 'Última Compra', dataKey: 'ultima' }
          ],
          datos: this.comprasPorProveedor.map(p => ({
            proveedor: p.nombreProveedor,
            compras: p.totalCompras,
            gastado: `S/ ${p.totalGastado.toFixed(2)}`,
            ultima: new Date(p.ultimaFechaCompra).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })
          }))
        }
      ],
      nombreArchivo: 'reporte-compras'
    });

    this.notificationService.notifySuccess('PDF generado exitosamente');
  }

  async exportarInventarioAPDF(): Promise<void> {
    if (this.reporteInventario.length === 0) return;
    this.notificationService.notifySuccess('Generando PDF...');

    const resumen: { etiqueta: string; valor: string }[] = [];
    if (this.valuacionInventario) {
      resumen.push(
        { etiqueta: 'Valor Total', valor: `S/ ${this.valuacionInventario.valorTotal.toFixed(2)}` },
        { etiqueta: 'Total Unidades', valor: this.valuacionInventario.totalUnidades.toString() },
        { etiqueta: 'Total Productos', valor: this.valuacionInventario.totalProductos.toString() }
      );
    }

    await this.exportService.exportarPDFProfesional({
      titulo: 'Reporte de Inventario',
      subtitulo: `Fecha: ${new Date().toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}`,
      resumen,
      secciones: [
        {
          titulo: 'Detalle de Inventario',
          colorCabecera: [14, 165, 233],
          columnas: [
            { header: 'Producto', dataKey: 'producto' },
            { header: 'Categoría', dataKey: 'categoria' },
            { header: 'Stock', dataKey: 'stock', align: 'center' },
            { header: 'Precio Unit.', dataKey: 'precio', align: 'right' },
            { header: 'Valor Total', dataKey: 'valor', align: 'right' },
            { header: 'Rotación', dataKey: 'rotacion', align: 'center' }
          ],
          datos: this.reporteInventario.map(item => ({
            producto: `${item.nombreProducto} - ${item.marca}`,
            categoria: item.nombreCategoria,
            stock: item.stockActual,
            precio: `S/ ${item.precioUnitario.toFixed(2)}`,
            valor: `S/ ${item.valorTotal.toFixed(2)}`,
            rotacion: `${item.tasaRotacion.toFixed(2)}x`
          }))
        }
      ],
      nombreArchivo: 'reporte-inventario'
    });

    this.notificationService.notifySuccess('PDF generado exitosamente');
  }

  async exportarRentabilidadAPDF(): Promise<void> {
    if (!this.reporteGananciaPerdida) return;
    this.notificationService.notifySuccess('Generando PDF...');

    const gp = this.reporteGananciaPerdida;
    await this.exportService.exportarPDFProfesional({
      titulo: 'Reporte de Rentabilidad',
      subtitulo: `Período: ${new Date(gp.fechaInicio).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })} — ${new Date(gp.fechaFin).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}`,
      resumen: [
        { etiqueta: 'Ingresos', valor: `S/ ${gp.totalVentas.toFixed(2)}` },
        { etiqueta: 'Egresos', valor: `S/ ${gp.totalCompras.toFixed(2)}` },
        { etiqueta: 'Utilidad Bruta', valor: `S/ ${gp.gananciaBruta.toFixed(2)}` },
        { etiqueta: 'Margen', valor: `${gp.margenGanancia.toFixed(2)}%` }
      ],
      secciones: [
        {
          titulo: 'Análisis Financiero',
          colorCabecera: gp.gananciaBruta >= 0 ? [16, 185, 129] : [239, 68, 68],
          columnas: [
            { header: 'Concepto', dataKey: 'concepto' },
            { header: 'Monto', dataKey: 'monto', align: 'right' },
            { header: 'Unidades', dataKey: 'unidades', align: 'center' },
            { header: 'Observación', dataKey: 'obs' }
          ],
          datos: [
            { concepto: 'Ventas (Ingresos)', monto: `S/ ${gp.totalVentas.toFixed(2)}`, unidades: gp.productosVendidos, obs: 'Ingreso operativo' },
            { concepto: 'Compras (Egresos)', monto: `S/ ${gp.totalCompras.toFixed(2)}`, unidades: gp.productosComprados, obs: 'Costo de mercadería' },
            { concepto: 'Utilidad Bruta', monto: `S/ ${gp.gananciaBruta.toFixed(2)}`, unidades: '-', obs: gp.gananciaBruta >= 0 ? '✅ Ganancia' : '❌ Pérdida' },
            { concepto: 'Margen de Ganancia', monto: `${gp.margenGanancia.toFixed(2)}%`, unidades: '-', obs: this.obtenerEstadoMargen().label }
          ]
        }
      ],
      nombreArchivo: 'reporte-rentabilidad'
    });

    this.notificationService.notifySuccess('PDF generado exitosamente');
  }
}
