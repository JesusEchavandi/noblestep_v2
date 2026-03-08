using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Models;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/products/{productId}/variants")]
[Authorize(Roles = "Administrador,Vendedor")]
public class VariantesProductoController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<VariantesProductoController> _logger;

    public VariantesProductoController(AppDbContext context, ILogger<VariantesProductoController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/products/{productId}/variants
    [HttpGet]
    public async Task<ActionResult<List<VarianteProductoDto>>> GetVariantes(int productId)
    {
        var producto = await _context.Productos.FindAsync(productId);
        if (producto == null)
            return NotFound(new { message = "Producto no encontrado" });

        var variantes = await _context.VariantesProducto
            .Where(v => v.ProductoId == productId)
            .OrderBy(v => v.Talla)
            .Select(v => new VarianteProductoDto
            {
                Id = v.Id,
                ProductoId = v.ProductoId,
                NombreProducto = producto.Nombre,
                Marca = producto.Marca,
                Talla = v.Talla,
                Stock = v.Stock,
                Activo = v.Activo
            })
            .ToListAsync();

        return Ok(variantes);
    }

    // GET: api/products/{productId}/variants/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<VarianteProductoDto>> GetVariante(int productId, int id)
    {
        var variante = await _context.VariantesProducto
            .Include(v => v.Producto)
            .FirstOrDefaultAsync(v => v.Id == id && v.ProductoId == productId);

        if (variante == null)
            return NotFound(new { message = "Variante no encontrada" });

        return Ok(new VarianteProductoDto
        {
            Id = variante.Id,
            ProductoId = variante.ProductoId,
            NombreProducto = variante.Producto.Nombre,
            Marca = variante.Producto.Marca,
            Talla = variante.Talla,
            Stock = variante.Stock,
            Activo = variante.Activo
        });
    }

    // POST: api/products/{productId}/variants
    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult<VarianteProductoDto>> CrearVariante(int productId, [FromBody] CrearVarianteProductoDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var producto = await _context.Productos.FindAsync(productId);
        if (producto == null)
            return NotFound(new { message = "Producto no encontrado" });

        var existe = await _context.VariantesProducto
            .AnyAsync(v => v.ProductoId == productId && v.Talla == dto.Talla.Trim());
        if (existe)
            return Conflict(new { message = $"Ya existe una variante con talla '{dto.Talla}' para este producto" });

        var variante = new VarianteProducto
        {
            ProductoId = productId,
            Talla = dto.Talla.Trim(),
            Stock = dto.Stock,
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };

        _context.VariantesProducto.Add(variante);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Variante creada: Producto {ProductoId} Talla {Talla} Stock {Stock}",
            productId, variante.Talla, variante.Stock);

        var result = new VarianteProductoDto
        {
            Id = variante.Id,
            ProductoId = variante.ProductoId,
            NombreProducto = producto.Nombre,
            Marca = producto.Marca,
            Talla = variante.Talla,
            Stock = variante.Stock,
            Activo = variante.Activo
        };

        return CreatedAtAction(nameof(GetVariante), new { productId, id = variante.Id }, result);
    }

    // POST: api/products/{productId}/variants/bulk
    [HttpPost("bulk")]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult> CrearVariantesMasivo(int productId, [FromBody] List<CrearVarianteProductoDto> dtos)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var producto = await _context.Productos.FindAsync(productId);
        if (producto == null)
            return NotFound(new { message = "Producto no encontrado" });

        if (dtos == null || !dtos.Any())
            return BadRequest(new { message = "Debe enviar al menos una variante" });

        var tallas = dtos.Select(d => d.Talla.Trim()).ToList();
        if (tallas.Distinct().Count() != tallas.Count)
            return BadRequest(new { message = "El request contiene tallas duplicadas" });

        var tallasExistentes = await _context.VariantesProducto
            .Where(v => v.ProductoId == productId && tallas.Contains(v.Talla))
            .Select(v => v.Talla)
            .ToListAsync();

        var nuevasVariantes = dtos
            .Where(d => !tallasExistentes.Contains(d.Talla.Trim()))
            .Select(d => new VarianteProducto
            {
                ProductoId = productId,
                Talla = d.Talla.Trim(),
                Stock = d.Stock,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            }).ToList();

        _context.VariantesProducto.AddRange(nuevasVariantes);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            created = nuevasVariantes.Count,
            skipped = tallasExistentes,
            message = $"{nuevasVariantes.Count} variante(s) creadas, {tallasExistentes.Count} ya existían"
        });
    }

    // PUT: api/products/{productId}/variants/{id}/stock
    [HttpPut("{id}/stock")]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult> ActualizarStock(int productId, int id, [FromBody] ActualizarStockVarianteDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var variante = await _context.VariantesProducto
            .FirstOrDefaultAsync(v => v.Id == id && v.ProductoId == productId);

        if (variante == null)
            return NotFound(new { message = "Variante no encontrada" });

        var stockAnterior = variante.Stock;
        variante.Stock = dto.Stock;
        variante.FechaActualizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Stock actualizado: Variante {VarianteId} Talla {Talla}: {Anterior} → {Nuevo}",
            id, variante.Talla, stockAnterior, dto.Stock);

        return Ok(new
        {
            variantId = variante.Id,
            size = variante.Talla,
            oldStock = stockAnterior,
            newStock = variante.Stock
        });
    }

    // DELETE: api/products/{productId}/variants/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult> EliminarVariante(int productId, int id)
    {
        var variante = await _context.VariantesProducto
            .FirstOrDefaultAsync(v => v.Id == id && v.ProductoId == productId);

        if (variante == null)
            return NotFound(new { message = "Variante no encontrada" });

        variante.Activo = false;
        variante.FechaActualizacion = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Talla '{variante.Talla}' desactivada correctamente" });
    }

    // GET: api/products/{productId}/variants/summary
    [HttpGet("summary")]
    public async Task<ActionResult> GetResumenStock(int productId)
    {
        var producto = await _context.Productos
            .Include(p => p.Variantes)
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (producto == null)
            return NotFound(new { message = "Producto no encontrado" });

        var variantesActivas = producto.Variantes.Where(v => v.Activo).OrderBy(v => v.Talla).ToList();

        return Ok(new
        {
            productId = producto.Id,
            productName = producto.Nombre,
            brand = producto.Marca,
            totalStock = variantesActivas.Sum(v => v.Stock),
            sizesAvailable = variantesActivas.Count(v => v.Stock > 0),
            sizes = variantesActivas.Select(v => new
            {
                variantId = v.Id,
                size = v.Talla,
                stock = v.Stock,
                available = v.Stock > 0,
                status = v.Stock == 0 ? "Agotado" : v.Stock <= 3 ? "Crítico" : v.Stock <= 10 ? "Bajo" : "Normal"
            })
        });
    }
}
