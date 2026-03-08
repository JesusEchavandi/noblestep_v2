using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using System.Globalization;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "Administrador,Vendedor")]
public class PanelControlController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<PanelControlController> _logger;

    public PanelControlController(AppDbContext context, ILogger<PanelControlController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("metrics")]
    public async Task<ActionResult<MetricasPanelDto>> GetMetricasPanel()
    {
        try
        {
            var ahora = DateTime.UtcNow;

            // Total ventas
            var totalVentas = await _context.Ventas
                .Where(s => s.Estado == "Completada")
                .SumAsync(s => (decimal?)s.Total) ?? 0;

            var totalVentasCount = await _context.Ventas
                .Where(s => s.Estado == "Completada")
                .CountAsync();

            // Ventas de hoy
            var inicioHoy = ahora.Date;
            var inicioManana = inicioHoy.AddDays(1);

            var ventasHoy = await _context.Ventas
                .Where(s => s.Estado == "Completada" && s.FechaVenta >= inicioHoy && s.FechaVenta < inicioManana)
                .SumAsync(s => (decimal?)s.Total) ?? 0;

            var ventasHoyCount = await _context.Ventas
                .Where(s => s.Estado == "Completada" && s.FechaVenta >= inicioHoy && s.FechaVenta < inicioManana)
                .CountAsync();

            // Ventas del mes
            var primerDiaMes = new DateTime(ahora.Year, ahora.Month, 1);
            var ventasMes = await _context.Ventas
                .Where(s => s.Estado == "Completada" && s.FechaVenta >= primerDiaMes)
                .SumAsync(s => (decimal?)s.Total) ?? 0;

            var ventasMesCount = await _context.Ventas
                .Where(s => s.Estado == "Completada" && s.FechaVenta >= primerDiaMes)
                .CountAsync();

            // Productos
            var totalProductos = await _context.Productos.CountAsync();
            var productosActivos = await _context.Productos.Where(p => p.Activo).CountAsync();
            var productosBajoStock = await _context.Productos.Where(p => p.Activo && p.Stock < 10).CountAsync();

            // Clientes
            var totalClientes = await _context.Clientes.CountAsync();

            // Proveedores
            var totalProveedores = await _context.Proveedores.Where(s => s.Activo).CountAsync();

            // Compras
            var totalCompras = await _context.Compras.SumAsync(p => (decimal?)p.Total) ?? 0;
            var totalComprasCount = await _context.Compras.CountAsync();

            // Promedio de venta
            var promedioVenta = totalVentasCount > 0 ? totalVentas / totalVentasCount : 0;

            var metricas = new MetricasPanelDto
            {
                TotalVentas = totalVentas,
                CantidadTotalVentas = totalVentasCount,
                VentasHoy = ventasHoy,
                CantidadVentasHoy = ventasHoyCount,
                VentasMes = ventasMes,
                CantidadVentasMes = ventasMesCount,
                TotalProductos = totalProductos,
                ProductosActivos = productosActivos,
                ProductosBajoStock = productosBajoStock,
                TotalClientes = totalClientes,
                TotalProveedores = totalProveedores,
                TotalCompras = totalCompras,
                CantidadTotalCompras = totalComprasCount,
                MontoPromedioVenta = promedioVenta
            };

            return Ok(metricas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en GetMetricasPanel");
            return StatusCode(500, new { message = "Error al obtener métricas del dashboard" });
        }
    }

    [HttpGet("sales-chart")]
    public async Task<ActionResult<DatosGraficoVentasDto>> GetDatosGraficoVentas()
    {
        try
        {
            var ahora = DateTime.UtcNow;
            var inicio7Dias = ahora.Date.AddDays(-6);
            var inicio6Meses = ahora.Date.AddMonths(-5).AddDays(1 - ahora.Day);

            // Últimos 7 días
            var ventasUltimos7Dias = await _context.Ventas
                .Where(s => s.Estado == "Completada" && s.FechaVenta >= inicio7Dias)
                .ToListAsync();

            var ventasDiarias = new List<VentasDiariasDto>();
            for (int i = 6; i >= 0; i--)
            {
                var fecha = ahora.Date.AddDays(-i);
                var ventasDia = ventasUltimos7Dias.Where(s => s.FechaVenta.Date == fecha);
                ventasDiarias.Add(new VentasDiariasDto
                {
                    Fecha = fecha,
                    Total = ventasDia.Sum(s => s.Total),
                    Cantidad = ventasDia.Count()
                });
            }

            // Últimos 6 meses
            var ventasUltimos6Meses = await _context.Ventas
                .Where(s => s.Estado == "Completada" && s.FechaVenta >= inicio6Meses)
                .ToListAsync();

            var ventasMensuales = new List<VentasMensualesDto>();
            var cultura = new CultureInfo("es-ES");

            for (int i = 5; i >= 0; i--)
            {
                var fechaMes = ahora.AddMonths(-i);
                var anio = fechaMes.Year;
                var mes = fechaMes.Month;
                var inicioMes = new DateTime(anio, mes, 1);

                var datosMes = ventasUltimos6Meses
                    .Where(s => s.FechaVenta.Year == anio && s.FechaVenta.Month == mes);

                ventasMensuales.Add(new VentasMensualesDto
                {
                    Anio = anio,
                    Mes = mes,
                    NombreMes = cultura.DateTimeFormat.GetMonthName(mes),
                    Total = datosMes.Sum(s => s.Total),
                    Cantidad = datosMes.Count()
                });
            }

            var datosGrafico = new DatosGraficoVentasDto
            {
                Ultimos7Dias = ventasDiarias,
                Ultimos6Meses = ventasMensuales
            };

            return Ok(datosGrafico);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en GetDatosGraficoVentas");
            return StatusCode(500, new { message = "Error al obtener datos de gráficas" });
        }
    }

    [HttpGet("top-products")]
    public async Task<ActionResult<IEnumerable<ProductoTopDto>>> GetProductosTop([FromQuery] int limit = 5)
    {
        var productosTop = await _context.DetallesVenta
            .Include(sd => sd.Producto)
            .Where(sd => sd.Producto.Activo)
            .GroupBy(sd => new { sd.ProductoId, sd.Producto.Nombre, sd.Producto.Marca })
            .Select(g => new ProductoTopDto
            {
                ProductoId = g.Key.ProductoId,
                NombreProducto = g.Key.Nombre,
                Marca = g.Key.Marca,
                CantidadTotalVendida = g.Sum(sd => sd.Cantidad),
                IngresosTotales = g.Sum(sd => sd.Subtotal)
            })
            .OrderByDescending(x => x.IngresosTotales)
            .Take(limit)
            .ToListAsync();

        return Ok(productosTop);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<ProductoBajoStockDto>>> GetProductosBajoStock([FromQuery] int threshold = 10)
    {
        var productosBajoStock = await _context.Productos
            .Where(p => p.Activo && p.Stock < threshold)
            .OrderBy(p => p.Stock)
            .Select(p => new ProductoBajoStockDto
            {
                Id = p.Id,
                Nombre = p.Nombre,
                Marca = p.Marca,
                Talla = p.Talla,
                Stock = p.Stock,
                Precio = p.Precio
            })
            .ToListAsync();

        return Ok(productosBajoStock);
    }

    [HttpGet("recent-sales")]
    public async Task<ActionResult<IEnumerable<VentaRecienteDto>>> GetVentasRecientes([FromQuery] int limit = 10)
    {
        var ventasRecientes = await _context.Ventas
            .Include(s => s.Cliente)
            .Include(s => s.DetallesVenta)
            .OrderByDescending(s => s.FechaVenta)
            .Take(limit)
            .Select(s => new VentaRecienteDto
            {
                Id = s.Id,
                FechaVenta = s.FechaVenta,
                NombreCliente = s.Cliente.NombreCompleto,
                Total = s.Total,
                Estado = s.Estado,
                CantidadItems = s.DetallesVenta.Count
            })
            .ToListAsync();

        return Ok(ventasRecientes);
    }
}
