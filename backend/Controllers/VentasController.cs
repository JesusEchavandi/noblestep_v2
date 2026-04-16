using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Helpers;
using NobleStep.Api.Models;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/sales")]
[Authorize(Roles = "Administrador,Vendedor")]
public class VentasController : ControllerBase
{
    private readonly AppDbContext _context;

    public VentasController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VentaDto>>> GetVentas(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (pageSize > 100) pageSize = 100;
        if (pageSize < 1) pageSize = 1;
        if (page < 1) page = 1;

        var query = _context.Ventas
            .Include(s => s.Cliente)
            .Include(s => s.DetallesVenta)
            .ThenInclude(sd => sd.Producto)
            .OrderByDescending(s => s.FechaVenta);

        var total = await _context.Ventas.CountAsync();

        var ventas = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new VentaDto
            {
                Id = s.Id,
                ClienteId = s.ClienteId,
                NombreCliente = s.Cliente.NombreCompleto,
                FechaVenta = s.FechaVenta,
                Total = s.Total,
                Estado = s.Estado,
                Detalles = s.DetallesVenta.Select(sd => new DetalleVentaDto
                {
                    ProductoId = sd.ProductoId,
                    NombreProducto = sd.Producto.Nombre,
                    Cantidad = sd.Cantidad,
                    PrecioUnitario = sd.PrecioUnitario,
                    Subtotal = sd.Subtotal
                }).ToList()
            })
            .ToListAsync();

        return Ok(new
        {
            datos = ventas,
            pagina = page,
            tamanoPagina = pageSize,
            total,
            totalPaginas = (int)Math.Ceiling((double)total / pageSize)
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VentaDto>> GetVenta(int id)
    {
        var venta = await _context.Ventas
            .Include(s => s.Cliente)
            .Include(s => s.DetallesVenta)
            .ThenInclude(sd => sd.Producto)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (venta == null)
            return NotFound();

        var ventaDto = new VentaDto
        {
            Id = venta.Id,
            ClienteId = venta.ClienteId,
            NombreCliente = venta.Cliente.NombreCompleto,
            FechaVenta = venta.FechaVenta,
            Total = venta.Total,
            Estado = venta.Estado,
            Detalles = venta.DetallesVenta.Select(sd => new DetalleVentaDto
            {
                ProductoId = sd.ProductoId,
                NombreProducto = sd.Producto.Nombre,
                Cantidad = sd.Cantidad,
                PrecioUnitario = sd.PrecioUnitario,
                Subtotal = sd.Subtotal
            }).ToList()
        };

        return Ok(ventaDto);
    }

    [HttpGet("{id}/receipt")]
    public async Task<IActionResult> GetBoletaVenta(int id, [FromQuery] bool download = false)
    {
        var venta = await _context.Ventas
            .Include(v => v.Cliente)
            .Include(v => v.Usuario)
            .Include(v => v.DetallesVenta)
            .ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (venta == null)
            return NotFound(new { message = "Venta no encontrada" });

        var filePath = BoletaHelper.GenerarBoletaVenta(venta);
        var fileName = Path.GetFileName(filePath);
        var bytes = await System.IO.File.ReadAllBytesAsync(filePath);

        if (download)
            return File(bytes, "text/plain; charset=utf-8", fileName);

        Response.Headers.ContentDisposition = $"inline; filename=\"{fileName}\"";
        return File(bytes, "text/plain; charset=utf-8");
    }

    [HttpPost]
    public async Task<ActionResult<VentaDto>> CrearVenta([FromBody] CrearVentaDto crearDto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int usuarioId))
            return Unauthorized();

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var cliente = await _context.Clientes.FindAsync(crearDto.ClienteId);
            if (cliente == null)
                return BadRequest(new { message = "Cliente no encontrado" });

            var productIds = crearDto.Detalles.Select(d => d.ProductoId).Distinct().ToList();
            var productos = await _context.Productos
                .Include(p => p.Variantes.Where(v => v.Activo))
                .Where(p => productIds.Contains(p.Id) && p.Activo)
                .ToListAsync();

            if (productos.Count != productIds.Count)
                return BadRequest(new { message = "Uno o más productos no encontrados o inactivos" });

            // Verificar stock antes de modificar nada
            foreach (var detalle in crearDto.Detalles)
            {
                var producto = productos.First(p => p.Id == detalle.ProductoId);

                if (detalle.VarianteId.HasValue)
                {
                    var variante = producto.Variantes.FirstOrDefault(v => v.Id == detalle.VarianteId.Value);
                    if (variante == null)
                        return BadRequest(new { message = $"Talla no encontrada para: {producto.Nombre}" });
                    if (variante.Stock < detalle.Cantidad)
                        return BadRequest(new { message = $"Stock insuficiente para {producto.Nombre} talla {variante.Talla}. Disponible: {variante.Stock}" });
                }
                else
                {
                    if (producto.Stock < detalle.Cantidad)
                        return BadRequest(new { message = $"Stock insuficiente para: {producto.Nombre}. Disponible: {producto.Stock}" });
                }
            }

            var venta = new Venta
            {
                ClienteId = crearDto.ClienteId,
                UsuarioId = usuarioId,
                FechaVenta = DateTime.UtcNow,
                FechaCreacion = DateTime.UtcNow,
                Estado = "Completada"
            };

            decimal total = 0;
            foreach (var detalle in crearDto.Detalles)
            {
                var producto = productos.First(p => p.Id == detalle.ProductoId);
                var precioUnitario = producto.PrecioOferta > 0 ? producto.PrecioOferta : producto.Precio;
                var subtotal = precioUnitario * detalle.Cantidad;

                venta.DetallesVenta.Add(new DetalleVenta
                {
                    ProductoId = detalle.ProductoId,
                    VarianteId = detalle.VarianteId,
                    Cantidad = detalle.Cantidad,
                    PrecioUnitario = precioUnitario,
                    Subtotal = subtotal
                });

                total += subtotal;

                // Descontar stock
                if (detalle.VarianteId.HasValue)
                {
                    var variante = producto.Variantes.First(v => v.Id == detalle.VarianteId.Value);
                    variante.Stock -= detalle.Cantidad;
                    variante.FechaActualizacion = DateTime.UtcNow;
                    producto.Stock = producto.Variantes.Sum(v => v.Stock);
                }
                else
                {
                    producto.Stock -= detalle.Cantidad;
                }
                producto.FechaActualizacion = DateTime.UtcNow;
            }

            venta.Total = total;

            _context.Ventas.Add(venta);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Cargar navegaciones para la respuesta
            await _context.Entry(venta).Reference(s => s.Cliente).LoadAsync();
            await _context.Entry(venta).Collection(s => s.DetallesVenta).LoadAsync();
            foreach (var detalle in venta.DetallesVenta)
            {
                await _context.Entry(detalle).Reference(sd => sd.Producto).LoadAsync();
            }

            var ventaDto = new VentaDto
            {
                Id = venta.Id,
                ClienteId = venta.ClienteId,
                NombreCliente = venta.Cliente.NombreCompleto,
                FechaVenta = venta.FechaVenta,
                Total = venta.Total,
                Estado = venta.Estado,
                Detalles = venta.DetallesVenta.Select(sd => new DetalleVentaDto
                {
                    ProductoId = sd.ProductoId,
                    NombreProducto = sd.Producto.Nombre,
                    Cantidad = sd.Cantidad,
                    PrecioUnitario = sd.PrecioUnitario,
                    Subtotal = sd.Subtotal
                }).ToList()
            };

            // Generar boleta simple en archivo .txt (no bloquea la operación de venta)
            try
            {
                BoletaHelper.GenerarBoletaVenta(venta);
            }
            catch
            {
                // Si falla la boleta, no se revierte la venta.
            }

            return CreatedAtAction(nameof(GetVenta), new { id = venta.Id }, ventaDto);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpGet("reports/by-date")]
    public async Task<ActionResult> GetVentasPorFecha([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var query = _context.Ventas.AsQueryable();

        if (startDate.HasValue)
            query = query.Where(s => s.FechaVenta >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(s => s.FechaVenta <= endDate.Value);

        var ventas = await query
            .Include(s => s.Cliente)
            .Where(s => s.Estado == "Completada")
            .OrderByDescending(s => s.FechaVenta)
            .Select(s => new
            {
                s.Id,
                s.FechaVenta,
                NombreCliente = s.Cliente.NombreCompleto,
                s.Total,
                s.Estado
            })
            .ToListAsync();

        var totalVentas = ventas.Sum(s => s.Total);

        return Ok(new
        {
            sales = ventas,
            totalSales = totalVentas,
            count = ventas.Count
        });
    }

    [HttpGet("reports/best-selling")]
    public async Task<ActionResult> GetProductosMasVendidos([FromQuery] int limit = 10)
    {
        var masVendidos = await _context.DetallesVenta
            .Include(sd => sd.Producto)
            .GroupBy(sd => new { sd.ProductoId, sd.Producto.Nombre })
            .Select(g => new
            {
                ProductId = g.Key.ProductoId,
                ProductName = g.Key.Nombre,
                TotalQuantity = g.Sum(sd => sd.Cantidad),
                TotalRevenue = g.Sum(sd => sd.Subtotal)
            })
            .OrderByDescending(x => x.TotalQuantity)
            .Take(limit)
            .ToListAsync();

        return Ok(masVendidos);
    }

    [HttpGet("reports/total")]
    public async Task<ActionResult> GetTotalVentas()
    {
        var totalVentas = await _context.Ventas
            .Where(s => s.Estado == "Completada")
            .SumAsync(s => s.Total);

        var totalCount = await _context.Ventas
            .Where(s => s.Estado == "Completada")
            .CountAsync();

        return Ok(new
        {
            totalSales = totalVentas,
            totalCount
        });
    }
}
