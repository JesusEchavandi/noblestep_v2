using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Models;
using NobleStep.Api.Helpers;

namespace NobleStep.Api.Controllers;

[Authorize(Roles = "Administrator,Seller")]
[ApiController]
[Route("api/[controller]")]
public class PurchasesController : ControllerBase
{
    private readonly AppDbContext _context;

    public PurchasesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Purchases
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PurchaseDto>>> GetPurchases()
    {
        var purchases = await _context.Purchases
            .Include(p => p.Supplier)
            .Include(p => p.Details)
                .ThenInclude(d => d.Product)
            .Include(p => p.Details)
                .ThenInclude(d => d.Variant)
            .OrderByDescending(p => p.PurchaseDate)
            .Select(p => new PurchaseDto
            {
                Id = p.Id,
                SupplierId = p.SupplierId,
                SupplierName = p.Supplier.CompanyName,
                PurchaseDate = p.PurchaseDate,
                InvoiceNumber = p.InvoiceNumber,
                Total = p.Total,
                Status = p.Status,
                Notes = p.Notes,
                Details = p.Details.Select(d => new PurchaseDetailDto
                {
                    Id = d.Id,
                    ProductId = d.ProductId,
                    ProductName = d.Product != null ? d.Product.Name : "—",
                    VariantId = d.VariantId,
                    Size = d.Variant != null ? d.Variant.Size : null,
                    Quantity = d.Quantity,
                    UnitCost = d.UnitCost,
                    Subtotal = d.Subtotal
                }).ToList() ?? new List<PurchaseDetailDto>()
            })
            .ToListAsync();

        return Ok(purchases);
    }

    // GET: api/Purchases/5
    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseDto>> GetPurchase(int id)
    {
        var purchase = await _context.Purchases
            .Include(p => p.Supplier)
            .Include(p => p.Details)
                .ThenInclude(d => d.Product)
            .Include(p => p.Details)
                .ThenInclude(d => d.Variant)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (purchase == null)
        {
            return NotFound(new { message = "Compra no encontrada" });
        }

        var purchaseDto = new PurchaseDto
        {
            Id = purchase.Id,
            SupplierId = purchase.SupplierId,
            SupplierName = purchase.Supplier.CompanyName,
            PurchaseDate = purchase.PurchaseDate,
            InvoiceNumber = purchase.InvoiceNumber,
            Total = purchase.Total,
            Status = purchase.Status,
            Notes = purchase.Notes,
            Details = purchase.Details.Select(d => new PurchaseDetailDto
            {
                Id = d.Id,
                ProductId = d.ProductId,
                ProductName = d.Product != null ? d.Product.Name : "—",
                VariantId = d.VariantId,
                Size = d.Variant?.Size,
                Quantity = d.Quantity,
                UnitCost = d.UnitCost,
                Subtotal = d.Subtotal
            }).ToList() ?? new List<PurchaseDetailDto>()
        };

        return Ok(purchaseDto);
    }

    // POST: api/Purchases
    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<PurchaseDto>> CreatePurchase(CreatePurchaseDto dto)
    {
        // Validate supplier exists
        var supplier = await _context.Suppliers.FindAsync(dto.SupplierId);
        if (supplier == null)
            return BadRequest(new { message = "Proveedor no encontrado" });

        // Verificar factura duplicada antes de abrir transacción
        var existingPurchase = await _context.Purchases
            .Where(p => p.InvoiceNumber == dto.InvoiceNumber)
            .FirstOrDefaultAsync();
        if (existingPurchase != null)
            return BadRequest(new { message = "Ya existe una compra con este número de factura" });

        // Get authenticated user ID
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            return Unauthorized(new { message = "Usuario no autenticado" });

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Cargar todos los productos en una sola consulta (evitar N+1)
            var productIds = dto.Details.Select(d => d.ProductId).Distinct().ToList();
            var products = await _context.Products
                .Include(p => p.Variants)
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            decimal total = 0;
            var purchaseDetails = new List<PurchaseDetail>();
            var now = DateTime.UtcNow;

            foreach (var detail in dto.Details)
            {
                var product = products.FirstOrDefault(p => p.Id == detail.ProductId);
                if (product == null)
                    return BadRequest(new { message = $"Producto con ID {detail.ProductId} no encontrado" });

                var subtotal = detail.Quantity * detail.UnitCost;
                total += subtotal;

                ProductVariant? variant = null;

                if (detail.VariantId.HasValue)
                {
                    // Caso 1: admin especificó ID de variante directamente
                    variant = product.Variants.FirstOrDefault(v => v.Id == detail.VariantId.Value);
                    if (variant == null)
                        return BadRequest(new { message = $"Variante ID {detail.VariantId} no encontrada para el producto '{product.Name}'" });
                }
                else if (!string.IsNullOrWhiteSpace(detail.Size))
                {
                    // Caso 2: talla por nombre — buscar o crear la variante
                    variant = product.Variants.FirstOrDefault(v => v.Size == detail.Size.Trim());
                    if (variant == null)
                    {
                        variant = new ProductVariant
                        {
                            ProductId = product.Id,
                            Size = detail.Size.Trim(),
                            Stock = 0,
                            IsActive = true,
                            CreatedAt = now
                        };
                        _context.ProductVariants.Add(variant);
                        product.Variants.Add(variant);
                    }
                }

                if (variant != null)
                {
                    variant.Stock += detail.Quantity;
                    variant.UpdatedAt = now;
                }
                else
                {
                    // Sin variante: descontar/reponer directamente del stock del producto
                    product.Stock += detail.Quantity;
                }

                // Si el producto tiene variantes, el stock total es siempre la suma de sus variantes
                if (product.Variants.Any())
                    product.Stock = product.Variants.Sum(v => v.Stock);

                product.UpdatedAt = now;

                purchaseDetails.Add(new PurchaseDetail
                {
                    ProductId = detail.ProductId,
                    VariantId = variant?.Id,
                    Quantity = detail.Quantity,
                    UnitCost = detail.UnitCost,
                    Subtotal = subtotal
                });
            }

            var purchase = new Purchase
            {
                SupplierId = dto.SupplierId,
                UserId = userId,
                PurchaseDate = dto.PurchaseDate,
                InvoiceNumber = dto.InvoiceNumber,
                Total = total,
                Status = "Completed",
                Notes = dto.Notes,
                Details = purchaseDetails,
                CreatedAt = now
            };

            _context.Purchases.Add(purchase);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Cargar datos relacionados para la respuesta
            await _context.Entry(purchase).Reference(p => p.Supplier).LoadAsync();
            await _context.Entry(purchase).Collection(p => p.Details)
                .Query().Include(d => d.Product).LoadAsync();

            var purchaseDto = new PurchaseDto
            {
                Id = purchase.Id,
                SupplierId = purchase.SupplierId,
                SupplierName = purchase.Supplier.CompanyName,
                PurchaseDate = purchase.PurchaseDate,
                InvoiceNumber = purchase.InvoiceNumber,
                Total = purchase.Total,
                Status = purchase.Status,
                Notes = purchase.Notes,
                Details = purchase.Details.Select(d => new PurchaseDetailDto
                {
                    Id = d.Id,
                    ProductId = d.ProductId,
                    ProductName = d.Product != null ? d.Product.Name : "—",
                    VariantId = d.VariantId,
                    Size = d.Variant?.Size,
                    Quantity = d.Quantity,
                    UnitCost = d.UnitCost,
                    Subtotal = d.Subtotal
                }).ToList()
            };

            return CreatedAtAction(nameof(GetPurchase), new { id = purchase.Id }, purchaseDto);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    // GET: api/Purchases/Summary
    [HttpGet("Summary")]
    public async Task<ActionResult<object>> GetPurchasesSummary()
    {
        var totalPurchases = await _context.Purchases
            .Where(p => p.Status == "Completada" || p.Status == "Completed")
            .SumAsync(p => (decimal?)p.Total) ?? 0;

        var totalCount = await _context.Purchases
            .Where(p => p.Status == "Completada" || p.Status == "Completed")
            .CountAsync();

        return Ok(new
        {
            totalPurchases,
            totalCount
        });
    }

    // GET: api/Purchases/ByDateRange
    [HttpGet("ByDateRange")]
    public async Task<ActionResult<object>> GetPurchasesByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var purchases = await _context.Purchases
            .Include(p => p.Supplier)
            .Where(p => p.PurchaseDate >= startDate && p.PurchaseDate <= endDate)
            .OrderByDescending(p => p.PurchaseDate)
            .Select(p => new PurchaseDto
            {
                Id = p.Id,
                SupplierId = p.SupplierId,
                SupplierName = p.Supplier.CompanyName,
                PurchaseDate = p.PurchaseDate,
                InvoiceNumber = p.InvoiceNumber,
                Total = p.Total,
                Status = p.Status,
                Notes = p.Notes
            })
            .ToListAsync();

        var totalPurchases = purchases.Sum(p => p.Total);

        return Ok(new
        {
            purchases,
            totalPurchases
        });
    }
}
