using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Administrador,Vendedor")]
public class ReportesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportesController(AppDbContext context)
    {
        _context = context;
    }

    // Sales Reports
    [HttpGet("sales")]
    public async Task<ActionResult<ReporteVentasDto>> GetReporteVentas([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var inicio = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var fin = endDate ?? DateTime.UtcNow;

        var ventas = await _context.Ventas
            .Include(s => s.Cliente)
            .Include(s => s.Usuario)
            .Include(s => s.DetallesVenta)
            .Where(s => s.Estado == "Completada" && s.FechaVenta >= inicio && s.FechaVenta <= fin)
            .OrderByDescending(s => s.FechaVenta)
            .ToListAsync();

        var items = ventas.Select(s => new ItemReporteVentasDto
        {
            VentaId = s.Id,
            FechaVenta = s.FechaVenta,
            NombreCliente = s.Cliente.NombreCompleto,
            DocumentoCliente = s.Cliente.NumeroDocumento,
            Total = s.Total,
            CantidadItems = s.DetallesVenta.Count,
            Estado = s.Estado,
            NombreUsuario = s.Usuario.NombreCompleto
        }).ToList();

        var totalVentas = ventas.Sum(s => s.Total);
        var totalTransacciones = ventas.Count;
        var ticketPromedio = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0;

        var reporte = new ReporteVentasDto
        {
            FechaInicio = inicio,
            FechaFin = fin,
            Items = items,
            TotalVentas = totalVentas,
            TotalTransacciones = totalTransacciones,
            TicketPromedio = ticketPromedio
        };

        return Ok(reporte);
    }

    [HttpGet("sales-by-product")]
    public async Task<ActionResult<List<ReporteVentasPorProductoDto>>> GetReporteVentasPorProducto(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int? categoryId)
    {
        var inicio = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var fin = endDate ?? DateTime.UtcNow;

        var query = _context.DetallesVenta
            .Include(sd => sd.Venta)
            .Include(sd => sd.Producto)
            .ThenInclude(p => p.Categoria)
            .Where(sd => sd.Venta.Estado == "Completada"
                && sd.Venta.FechaVenta >= inicio
                && sd.Venta.FechaVenta <= fin);

        if (categoryId.HasValue)
        {
            query = query.Where(sd => sd.Producto.CategoriaId == categoryId.Value);
        }

        var reporte = await query
            .GroupBy(sd => new
            {
                sd.Producto.Id,
                sd.Producto.Nombre,
                sd.Producto.Marca,
                NombreCategoria = sd.Producto.Categoria.Nombre
            })
            .Select(g => new ReporteVentasPorProductoDto
            {
                ProductoId = g.Key.Id,
                NombreProducto = g.Key.Nombre,
                Marca = g.Key.Marca,
                NombreCategoria = g.Key.NombreCategoria,
                CantidadTotalVendida = g.Sum(sd => sd.Cantidad),
                IngresosTotales = g.Sum(sd => sd.Subtotal),
                PrecioPromedio = g.Average(sd => sd.PrecioUnitario)
            })
            .OrderByDescending(r => r.IngresosTotales)
            .ToListAsync();

        return Ok(reporte);
    }

    [HttpGet("sales-by-customer")]
    public async Task<ActionResult<List<ReporteVentasPorClienteDto>>> GetReporteVentasPorCliente(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var inicio = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var fin = endDate ?? DateTime.UtcNow;

        var reporte = await _context.Ventas
            .Include(s => s.Cliente)
            .Where(s => s.Estado == "Completada" && s.FechaVenta >= inicio && s.FechaVenta <= fin)
            .GroupBy(s => new { s.ClienteId, s.Cliente.NombreCompleto, s.Cliente.NumeroDocumento })
            .Select(g => new ReporteVentasPorClienteDto
            {
                ClienteId = g.Key.ClienteId,
                NombreCliente = g.Key.NombreCompleto,
                NumeroDocumento = g.Key.NumeroDocumento,
                TotalCompras = g.Count(),
                TotalGastado = g.Sum(s => s.Total),
                TicketPromedio = g.Average(s => s.Total),
                UltimaFechaCompra = g.Max(s => s.FechaVenta)
            })
            .OrderByDescending(r => r.TotalGastado)
            .ToListAsync();

        return Ok(reporte);
    }

    // Purchase Reports
    [HttpGet("purchases")]
    public async Task<ActionResult<ReporteComprasDto>> GetReporteCompras(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var inicio = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var fin = endDate ?? DateTime.UtcNow;

        var compras = await _context.Compras
            .Include(p => p.Proveedor)
            .Where(p => p.FechaCompra >= inicio && p.FechaCompra <= fin)
            .OrderByDescending(p => p.FechaCompra)
            .ToListAsync();

        var items = compras.Select(p => new ItemReporteComprasDto
        {
            CompraId = p.Id,
            FechaCompra = p.FechaCompra,
            NombreProveedor = p.Proveedor.RazonSocial,
            DocumentoProveedor = p.Proveedor.NumeroDocumento,
            Total = p.Total,
            CantidadItems = 0,
            Estado = "Completada"
        }).ToList();

        var reporte = new ReporteComprasDto
        {
            FechaInicio = inicio,
            FechaFin = fin,
            Items = items,
            TotalCompras = compras.Sum(p => p.Total),
            TotalTransacciones = compras.Count
        };

        return Ok(reporte);
    }

    [HttpGet("purchases-by-supplier")]
    public async Task<ActionResult<List<ReporteComprasPorProveedorDto>>> GetReporteComprasPorProveedor(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var inicio = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var fin = endDate ?? DateTime.UtcNow;

        var reporte = await _context.Compras
            .Include(p => p.Proveedor)
            .Where(p => p.FechaCompra >= inicio && p.FechaCompra <= fin)
            .GroupBy(p => new { p.ProveedorId, p.Proveedor.RazonSocial, p.Proveedor.NumeroDocumento })
            .Select(g => new ReporteComprasPorProveedorDto
            {
                ProveedorId = g.Key.ProveedorId,
                NombreProveedor = g.Key.RazonSocial,
                NumeroDocumento = g.Key.NumeroDocumento,
                TotalCompras = g.Count(),
                TotalGastado = g.Sum(p => p.Total),
                UltimaFechaCompra = g.Max(p => p.FechaCompra)
            })
            .OrderByDescending(r => r.TotalGastado)
            .ToListAsync();

        return Ok(reporte);
    }

    // Inventory Reports
    [HttpGet("inventory")]
    public async Task<ActionResult<List<ReporteInventarioDto>>> GetReporteInventario([FromQuery] int? categoryId)
    {
        var query = _context.Productos
            .Include(p => p.Categoria)
            .Where(p => p.Activo);

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoriaId == categoryId.Value);
        }

        var productos = await query.ToListAsync();

        var datosVentas = await _context.DetallesVenta
            .Include(sd => sd.Venta)
            .Where(sd => sd.Venta.Estado == "Completada")
            .GroupBy(sd => sd.ProductoId)
            .Select(g => new { ProductoId = g.Key, TotalVendido = g.Sum(sd => sd.Cantidad) })
            .ToListAsync();

        var reporte = productos.Select(p =>
        {
            var vendido = datosVentas.FirstOrDefault(s => s.ProductoId == p.Id)?.TotalVendido ?? 0;
            var tasaRotacion = p.Stock > 0 ? (decimal)vendido / p.Stock : 0;

            return new ReporteInventarioDto
            {
                ProductoId = p.Id,
                NombreProducto = p.Nombre,
                Marca = p.Marca,
                Talla = p.Talla,
                NombreCategoria = p.Categoria.Nombre,
                StockActual = p.Stock,
                PrecioUnitario = p.Precio,
                ValorTotal = p.Stock * p.Precio,
                TotalVendido = vendido,
                TasaRotacion = tasaRotacion
            };
        }).OrderByDescending(r => r.ValorTotal).ToList();

        return Ok(reporte);
    }

    [HttpGet("inventory-valuation")]
    public async Task<ActionResult<ValuacionInventarioDto>> GetValorizacionInventario()
    {
        var productos = await _context.Productos
            .Include(p => p.Categoria)
            .Where(p => p.Activo)
            .ToListAsync();

        var valorTotal = productos.Sum(p => p.Stock * p.Precio);
        var unidadesTotales = productos.Sum(p => p.Stock);
        var totalProductos = productos.Count;

        var porCategoria = productos
            .GroupBy(p => p.Categoria.Nombre)
            .Select(g => new ValuacionCategoriaDto
            {
                Categoria = g.Key,
                ValorTotal = g.Sum(p => p.Stock * p.Precio),
                TotalUnidades = g.Sum(p => p.Stock),
                Productos = g.Count()
            })
            .OrderByDescending(c => c.ValorTotal)
            .ToList();

        var resultado = new ValuacionInventarioDto
        {
            ValorTotal = valorTotal,
            TotalUnidades = unidadesTotales,
            TotalProductos = totalProductos,
            PorCategoria = porCategoria
        };

        return Ok(resultado);
    }

    // Profit/Loss Report
    [HttpGet("profit-loss")]
    public async Task<ActionResult<ReporteGananciaPerdidaDto>> GetReporteGananciaPerdida(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var inicio = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var fin = endDate ?? DateTime.UtcNow;

        var ventas = await _context.Ventas
            .Include(s => s.DetallesVenta)
            .Where(s => s.Estado == "Completada" && s.FechaVenta >= inicio && s.FechaVenta <= fin)
            .ToListAsync();

        var totalVentas = ventas.Sum(s => s.Total);
        var productosVendidos = ventas.SelectMany(s => s.DetallesVenta).Sum(sd => sd.Cantidad);

        var compras = await _context.Compras
            .Include(p => p.Detalles)
            .Where(p => p.FechaCompra >= inicio && p.FechaCompra <= fin)
            .ToListAsync();

        var totalCompras = compras.Sum(p => p.Total);
        var productosComprados = compras.SelectMany(p => p.Detalles).Sum(d => d.Cantidad);

        var gananciaBruta = totalVentas - totalCompras;
        var margenGanancia = totalVentas > 0 ? (gananciaBruta / totalVentas) * 100 : 0;

        var reporte = new ReporteGananciaPerdidaDto
        {
            FechaInicio = inicio,
            FechaFin = fin,
            TotalVentas = totalVentas,
            TotalCompras = totalCompras,
            GananciaBruta = gananciaBruta,
            MargenGanancia = margenGanancia,
            ProductosVendidos = productosVendidos,
            ProductosComprados = productosComprados
        };

        return Ok(reporte);
    }

    // Top Products Report
    [HttpGet("top-products")]
    public async Task<ActionResult<ReporteProductosTopDto>> GetReporteProductosTop(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int limit = 10)
    {
        var inicio = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var fin = endDate ?? DateTime.UtcNow;

        var datosVentas = await _context.DetallesVenta
            .Include(sd => sd.Venta)
            .Include(sd => sd.Producto)
            .ThenInclude(p => p.Categoria)
            .Where(sd => sd.Venta.Estado == "Completada"
                && sd.Venta.FechaVenta >= inicio
                && sd.Venta.FechaVenta <= fin)
            .GroupBy(sd => new
            {
                sd.Producto.Id,
                sd.Producto.Nombre,
                sd.Producto.Marca,
                NombreCategoria = sd.Producto.Categoria.Nombre
            })
            .Select(g => new ItemProductoTopDto
            {
                ProductoId = g.Key.Id,
                NombreProducto = g.Key.Nombre,
                Marca = g.Key.Marca,
                NombreCategoria = g.Key.NombreCategoria,
                CantidadVendida = g.Sum(sd => sd.Cantidad),
                Ingresos = g.Sum(sd => sd.Subtotal)
            })
            .ToListAsync();

        var topPorIngresos = datosVentas.OrderByDescending(p => p.Ingresos).Take(limit).ToList();
        var topPorCantidad = datosVentas.OrderByDescending(p => p.CantidadVendida).Take(limit).ToList();

        var reporte = new ReporteProductosTopDto
        {
            FechaInicio = inicio,
            FechaFin = fin,
            TopPorIngresos = topPorIngresos,
            TopPorCantidad = topPorCantidad
        };

        return Ok(reporte);
    }
}
