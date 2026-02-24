using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Models;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/products/{productId}/variants")]
[Authorize(Roles = "Administrator,Seller")]
public class ProductVariantsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ProductVariantsController> _logger;

    public ProductVariantsController(AppDbContext context, ILogger<ProductVariantsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/products/{productId}/variants
    // Devuelve todas las variantes (tallas) de un producto con su stock
    [HttpGet]
    public async Task<ActionResult<List<ProductVariantDto>>> GetVariants(int productId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null)
            return NotFound(new { message = "Producto no encontrado" });

        var variants = await _context.ProductVariants
            .Where(v => v.ProductId == productId)
            .OrderBy(v => v.Size)
            .Select(v => new ProductVariantDto
            {
                Id         = v.Id,
                ProductId  = v.ProductId,
                ProductName = product.Name,
                Brand      = product.Brand,
                Size       = v.Size,
                Stock      = v.Stock,
                IsActive   = v.IsActive
            })
            .ToListAsync();

        return Ok(variants);
    }

    // GET: api/products/{productId}/variants/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductVariantDto>> GetVariant(int productId, int id)
    {
        var variant = await _context.ProductVariants
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == id && v.ProductId == productId);

        if (variant == null)
            return NotFound(new { message = "Variante no encontrada" });

        return Ok(new ProductVariantDto
        {
            Id          = variant.Id,
            ProductId   = variant.ProductId,
            ProductName = variant.Product.Name,
            Brand       = variant.Product.Brand,
            Size        = variant.Size,
            Stock       = variant.Stock,
            IsActive    = variant.IsActive
        });
    }

    // POST: api/products/{productId}/variants
    // Agrega una nueva talla al producto
    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<ProductVariantDto>> CreateVariant(int productId, [FromBody] CreateProductVariantDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var product = await _context.Products.FindAsync(productId);
        if (product == null)
            return NotFound(new { message = "Producto no encontrado" });

        // Verificar que no exista ya esa talla para el producto
        var exists = await _context.ProductVariants
            .AnyAsync(v => v.ProductId == productId && v.Size == dto.Size.Trim());
        if (exists)
            return Conflict(new { message = $"Ya existe una variante con talla '{dto.Size}' para este producto" });

        var variant = new ProductVariant
        {
            ProductId = productId,
            Size      = dto.Size.Trim(),
            Stock     = dto.Stock,
            IsActive  = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.ProductVariants.Add(variant);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Variante creada: Producto {ProductId} Talla {Size} Stock {Stock}",
            productId, variant.Size, variant.Stock);

        var result = new ProductVariantDto
        {
            Id          = variant.Id,
            ProductId   = variant.ProductId,
            ProductName = product.Name,
            Brand       = product.Brand,
            Size        = variant.Size,
            Stock       = variant.Stock,
            IsActive    = variant.IsActive
        };

        return CreatedAtAction(nameof(GetVariant), new { productId, id = variant.Id }, result);
    }

    // POST: api/products/{productId}/variants/bulk
    // Crea múltiples tallas a la vez (ej: 38,39,40,41,42 con stock inicial)
    [HttpPost("bulk")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult> CreateVariantsBulk(int productId, [FromBody] List<CreateProductVariantDto> dtos)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var product = await _context.Products.FindAsync(productId);
        if (product == null)
            return NotFound(new { message = "Producto no encontrado" });

        if (dtos == null || !dtos.Any())
            return BadRequest(new { message = "Debe enviar al menos una variante" });

        // Verificar duplicados en el request mismo
        var sizes = dtos.Select(d => d.Size.Trim()).ToList();
        if (sizes.Distinct().Count() != sizes.Count)
            return BadRequest(new { message = "El request contiene tallas duplicadas" });

        // Verificar cuáles ya existen en BD
        var existingSizes = await _context.ProductVariants
            .Where(v => v.ProductId == productId && sizes.Contains(v.Size))
            .Select(v => v.Size)
            .ToListAsync();

        var newVariants = dtos
            .Where(d => !existingSizes.Contains(d.Size.Trim()))
            .Select(d => new ProductVariant
            {
                ProductId = productId,
                Size      = d.Size.Trim(),
                Stock     = d.Stock,
                IsActive  = true,
                CreatedAt = DateTime.UtcNow
            }).ToList();

        _context.ProductVariants.AddRange(newVariants);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            created  = newVariants.Count,
            skipped  = existingSizes,
            message  = $"{newVariants.Count} variante(s) creadas, {existingSizes.Count} ya existían"
        });
    }

    // PUT: api/products/{productId}/variants/{id}/stock
    // Actualiza el stock de una talla específica
    [HttpPut("{id}/stock")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult> UpdateStock(int productId, int id, [FromBody] UpdateVariantStockDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var variant = await _context.ProductVariants
            .FirstOrDefaultAsync(v => v.Id == id && v.ProductId == productId);

        if (variant == null)
            return NotFound(new { message = "Variante no encontrada" });

        var oldStock = variant.Stock;
        variant.Stock     = dto.Stock;
        variant.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Stock actualizado: Variante {VariantId} Talla {Size}: {Old} → {New}",
            id, variant.Size, oldStock, dto.Stock);

        return Ok(new
        {
            variantId = variant.Id,
            size      = variant.Size,
            oldStock,
            newStock  = variant.Stock
        });
    }

    // DELETE: api/products/{productId}/variants/{id}
    // Desactiva (soft delete) una talla — no la elimina físicamente
    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult> DeleteVariant(int productId, int id)
    {
        var variant = await _context.ProductVariants
            .FirstOrDefaultAsync(v => v.Id == id && v.ProductId == productId);

        if (variant == null)
            return NotFound(new { message = "Variante no encontrada" });

        variant.IsActive  = false;
        variant.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Talla '{variant.Size}' desactivada correctamente" });
    }

    // GET: api/products/{productId}/variants/summary
    // Resumen de stock total y disponibilidad de tallas
    [HttpGet("summary")]
    public async Task<ActionResult> GetStockSummary(int productId)
    {
        var product = await _context.Products
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null)
            return NotFound(new { message = "Producto no encontrado" });

        var activeVariants = product.Variants.Where(v => v.IsActive).OrderBy(v => v.Size).ToList();

        return Ok(new
        {
            productId   = product.Id,
            productName = product.Name,
            brand       = product.Brand,
            totalStock  = activeVariants.Sum(v => v.Stock),
            sizesAvailable = activeVariants.Count(v => v.Stock > 0),
            sizes = activeVariants.Select(v => new
            {
                variantId = v.Id,
                size      = v.Size,
                stock     = v.Stock,
                available = v.Stock > 0,
                status    = v.Stock == 0 ? "Agotado" : v.Stock <= 3 ? "Crítico" : v.Stock <= 10 ? "Bajo" : "Normal"
            })
        });
    }
}
