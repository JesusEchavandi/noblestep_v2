using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Helpers;
using NobleStep.Api.Models;

namespace NobleStep.Api.Controllers;

[Authorize(Roles = "Administrador,Vendedor")]
[ApiController]
[Route("api/purchases")]
public class ComprasController : ControllerBase
{
    private readonly AppDbContext _context;

    public ComprasController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CompraDto>>> GetCompras()
    {
        var compras = await _context.Compras
            .Include(p => p.Proveedor)
            .Include(p => p.Detalles)
                .ThenInclude(d => d.Producto)
            .Include(p => p.Detalles)
                .ThenInclude(d => d.Variante)
            .OrderByDescending(p => p.FechaCompra)
            .Select(p => new CompraDto
            {
                Id = p.Id,
                ProveedorId = p.ProveedorId,
                NombreProveedor = p.Proveedor.RazonSocial,
                FechaCompra = p.FechaCompra,
                NumeroFactura = p.NumeroFactura,
                Total = p.Total,
                Estado = p.Estado,
                Notas = p.Notas,
                Detalles = p.Detalles.Select(d => new DetalleCompraDto
                {
                    Id = d.Id,
                    ProductoId = d.ProductoId,
                    NombreProducto = d.Producto != null ? d.Producto.Nombre : "—",
                    VarianteId = d.VarianteId,
                    Talla = d.Variante != null ? d.Variante.Talla : null,
                    Cantidad = d.Cantidad,
                    CostoUnitario = d.CostoUnitario,
                    Subtotal = d.Subtotal
                }).ToList() ?? new List<DetalleCompraDto>()
            })
            .ToListAsync();

        return Ok(compras);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CompraDto>> GetCompra(int id)
    {
        var compra = await _context.Compras
            .Include(p => p.Proveedor)
            .Include(p => p.Detalles)
                .ThenInclude(d => d.Producto)
            .Include(p => p.Detalles)
                .ThenInclude(d => d.Variante)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (compra == null)
        {
            return NotFound(new { message = "Compra no encontrada" });
        }

        var compraDto = new CompraDto
        {
            Id = compra.Id,
            ProveedorId = compra.ProveedorId,
            NombreProveedor = compra.Proveedor.RazonSocial,
            FechaCompra = compra.FechaCompra,
            NumeroFactura = compra.NumeroFactura,
            Total = compra.Total,
            Estado = compra.Estado,
            Notas = compra.Notas,
            Detalles = compra.Detalles.Select(d => new DetalleCompraDto
            {
                Id = d.Id,
                ProductoId = d.ProductoId,
                NombreProducto = d.Producto != null ? d.Producto.Nombre : "—",
                VarianteId = d.VarianteId,
                Talla = d.Variante?.Talla,
                Cantidad = d.Cantidad,
                CostoUnitario = d.CostoUnitario,
                Subtotal = d.Subtotal
            }).ToList() ?? new List<DetalleCompraDto>()
        };

        return Ok(compraDto);
    }

    /// <summary>
    /// Genera el siguiente número de compra correlativo: COMP-0001, COMP-0002, etc.
    /// </summary>
    private async Task<string> GenerarNumeroCompra()
    {
        var ultimaCompra = await _context.Compras
            .Where(c => c.NumeroFactura.StartsWith("COMP-"))
            .OrderByDescending(c => c.NumeroFactura)
            .Select(c => c.NumeroFactura)
            .FirstOrDefaultAsync();

        int siguiente = 1;
        if (ultimaCompra != null && ultimaCompra.Length > 5)
        {
            var parteNumerica = ultimaCompra.Substring(5);
            if (int.TryParse(parteNumerica, out int ultimo))
                siguiente = ultimo + 1;
        }

        return $"COMP-{siguiente:D4}";
    }

    [HttpGet("next-number")]
    [Authorize(Roles = "Administrador,Vendedor")]
    public async Task<ActionResult<object>> GetSiguienteNumero()
    {
        var numero = await GenerarNumeroCompra();
        return Ok(new { numeroCompra = numero });
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult<CompraDto>> CrearCompra(CrearCompraDto dto)
    {
        var proveedor = await _context.Proveedores.FindAsync(dto.ProveedorId);
        if (proveedor == null)
            return BadRequest(new { message = "Proveedor no encontrado" });

        // Generar número de compra automáticamente
        var numeroCompra = await GenerarNumeroCompra();

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int usuarioId))
            return Unauthorized(new { message = "Usuario no autenticado" });

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var productIds = dto.Detalles.Select(d => d.ProductoId).Distinct().ToList();
            var productos = await _context.Productos
                .Include(p => p.Variantes)
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            decimal total = 0;
            var detallesCompra = new List<DetalleCompra>();
            var ahora = DateTime.UtcNow;

            foreach (var detalle in dto.Detalles)
            {
                var producto = productos.FirstOrDefault(p => p.Id == detalle.ProductoId);
                if (producto == null)
                    return BadRequest(new { message = $"Producto con ID {detalle.ProductoId} no encontrado" });

                var subtotal = detalle.Cantidad * detalle.CostoUnitario;
                total += subtotal;

                VarianteProducto? variante = null;

                if (detalle.VarianteId.HasValue)
                {
                    variante = producto.Variantes.FirstOrDefault(v => v.Id == detalle.VarianteId.Value);
                    if (variante == null)
                        return BadRequest(new { message = $"Variante ID {detalle.VarianteId} no encontrada para el producto '{producto.Nombre}'" });
                }
                else if (!string.IsNullOrWhiteSpace(detalle.Talla))
                {
                    variante = producto.Variantes.FirstOrDefault(v => v.Talla == detalle.Talla.Trim());
                    if (variante == null)
                    {
                        variante = new VarianteProducto
                        {
                            ProductoId = producto.Id,
                            Talla = detalle.Talla.Trim(),
                            Stock = 0,
                            Activo = true,
                            FechaCreacion = ahora
                        };
                        _context.VariantesProducto.Add(variante);
                        producto.Variantes.Add(variante);
                    }
                }

                if (variante != null)
                {
                    variante.Stock += detalle.Cantidad;
                    variante.FechaActualizacion = ahora;
                }
                else
                {
                    producto.Stock += detalle.Cantidad;
                }

                if (producto.Variantes.Any())
                    producto.Stock = producto.Variantes.Sum(v => v.Stock);

                producto.FechaActualizacion = ahora;

                detallesCompra.Add(new DetalleCompra
                {
                    ProductoId = detalle.ProductoId,
                    VarianteId = variante?.Id,
                    Cantidad = detalle.Cantidad,
                    CostoUnitario = detalle.CostoUnitario,
                    Subtotal = subtotal
                });
            }

            var compra = new Compra
            {
                ProveedorId = dto.ProveedorId,
                UsuarioId = usuarioId,
                FechaCompra = dto.FechaCompra,
                NumeroFactura = numeroCompra,
                Total = total,
                Estado = "Completada",
                Notas = dto.Notas,
                Detalles = detallesCompra,
                FechaCreacion = ahora
            };

            _context.Compras.Add(compra);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            await _context.Entry(compra).Reference(p => p.Proveedor).LoadAsync();
            await _context.Entry(compra).Collection(p => p.Detalles)
                .Query().Include(d => d.Producto).LoadAsync();

            var compraDto = new CompraDto
            {
                Id = compra.Id,
                ProveedorId = compra.ProveedorId,
                NombreProveedor = compra.Proveedor.RazonSocial,
                FechaCompra = compra.FechaCompra,
                NumeroFactura = compra.NumeroFactura,
                Total = compra.Total,
                Estado = compra.Estado,
                Notas = compra.Notas,
                Detalles = compra.Detalles.Select(d => new DetalleCompraDto
                {
                    Id = d.Id,
                    ProductoId = d.ProductoId,
                    NombreProducto = d.Producto != null ? d.Producto.Nombre : "—",
                    VarianteId = d.VarianteId,
                    Talla = d.Variante?.Talla,
                    Cantidad = d.Cantidad,
                    CostoUnitario = d.CostoUnitario,
                    Subtotal = d.Subtotal
                }).ToList()
            };

            return CreatedAtAction(nameof(GetCompra), new { id = compra.Id }, compraDto);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpGet("Summary")]
    public async Task<ActionResult<object>> GetResumenCompras()
    {
        var totalCompras = await _context.Compras
            .Where(p => p.Estado == "Completada" || p.Estado == "Completed")
            .SumAsync(p => (decimal?)p.Total) ?? 0;

        var totalCount = await _context.Compras
            .Where(p => p.Estado == "Completada" || p.Estado == "Completed")
            .CountAsync();

        return Ok(new
        {
            totalPurchases = totalCompras,
            totalCount
        });
    }

    [HttpGet("ByDateRange")]
    public async Task<ActionResult<object>> GetComprasPorRangoFecha([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var compras = await _context.Compras
            .Include(p => p.Proveedor)
            .Where(p => p.FechaCompra >= startDate && p.FechaCompra <= endDate)
            .OrderByDescending(p => p.FechaCompra)
            .Select(p => new CompraDto
            {
                Id = p.Id,
                ProveedorId = p.ProveedorId,
                NombreProveedor = p.Proveedor.RazonSocial,
                FechaCompra = p.FechaCompra,
                NumeroFactura = p.NumeroFactura,
                Total = p.Total,
                Estado = p.Estado,
                Notas = p.Notas
            })
            .ToListAsync();

        var totalCompras = compras.Sum(p => p.Total);

        return Ok(new
        {
            purchases = compras,
            totalPurchases = totalCompras
        });
    }
}
