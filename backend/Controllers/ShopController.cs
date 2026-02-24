using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShopController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ShopController> _logger;

    public ShopController(AppDbContext context, ILogger<ShopController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/shop/products
    [HttpGet("products")]
    [EnableRateLimiting("catalog")]
    public async Task<ActionResult<IEnumerable<ProductShopDto>>> GetProducts(
        [FromQuery] int? categoryId = null,
        [FromQuery] string? search = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] bool? inStock = null)
    {
        try
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive && p.Stock > 0)
                .AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p => p.Name.Contains(search) || p.Brand.Contains(search));

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            // Cargar productos con sus variantes activas
            var rawProducts = await query
                .Include(p => p.Variants.Where(v => v.IsActive))
                .OrderByDescending(p => p.UpdatedAt)
                .ToListAsync();

            var products = rawProducts.Select(p =>
            {
                var activeVariants = p.Variants.Where(v => v.IsActive).OrderBy(v => v.Size).ToList();
                var totalStock = activeVariants.Any()
                    ? activeVariants.Sum(v => v.Stock)
                    : p.Stock;

                return new ProductShopDto
                {
                    Id          = p.Id,
                    Code        = p.Brand,  // TODO: usar p.Code cuando se agregue campo Code
                    Brand       = p.Brand,
                    Size        = p.Size,   // legacy — talla única si no hay variantes
                    Price       = p.Price,
                    Name        = p.Name,
                    Description = p.Description ?? string.Empty,
                    SalePrice   = p.SalePrice > 0 ? p.SalePrice : p.Price,
                    Stock       = totalStock,
                    CategoryId  = p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.Name : "Sin categoría",
                    ImageUrl    = p.ImageUrl,
                    Sizes       = activeVariants.Select(v => new ProductSizeDto
                    {
                        VariantId = v.Id,
                        Size      = v.Size,
                        Stock     = v.Stock
                    }).ToList()
                };
            })
            // Solo mostrar productos que tengan stock (por variantes o por campo legacy)
            .Where(p => p.Stock > 0)
            .ToList();

            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo productos para el catálogo");
            return StatusCode(500, new { message = ex.Message, inner = ex.InnerException?.Message, stack = ex.StackTrace });
        }
    }

    // GET: api/shop/products/{id}
    [HttpGet("products/{id}")]
    [EnableRateLimiting("catalog")]
    public async Task<ActionResult<ProductShopDto>> GetProduct(int id)
    {
        try
        {
            if (id <= 0)
                return BadRequest(new { message = "ID de producto inválido" });

            var p = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Variants.Where(v => v.IsActive))
                .Where(p => p.Id == id && p.IsActive)
                .FirstOrDefaultAsync();

            if (p == null)
                return NotFound(new { message = "Producto no encontrado" });

            var activeVariants = p.Variants.Where(v => v.IsActive).OrderBy(v => v.Size).ToList();
            var totalStock = activeVariants.Any() ? activeVariants.Sum(v => v.Stock) : p.Stock;

            var product = new ProductShopDto
            {
                Id          = p.Id,
                Code        = p.Brand,
                Brand       = p.Brand,
                Size        = p.Size,
                Price       = p.Price,
                Name        = p.Name,
                Description = p.Description ?? string.Empty,
                SalePrice   = p.SalePrice > 0 ? p.SalePrice : p.Price,
                Stock       = totalStock,
                CategoryId  = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : "Sin categoría",
                ImageUrl    = p.ImageUrl,
                Sizes       = activeVariants.Select(v => new ProductSizeDto
                {
                    VariantId = v.Id,
                    Size      = v.Size,
                    Stock     = v.Stock
                }).ToList()
            };

            if (product == null)
                return NotFound(new { message = "Producto no encontrado" });

            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo detalle del producto {ProductId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // GET: api/shop/categories
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<CategoryShopDto>>> GetCategories()
    {
        try
        {
            var categories = await _context.Categories
                .Where(c => c.Products.Any(p => p.IsActive && p.Stock > 0))
                .Select(c => new CategoryShopDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    ProductCount = c.Products.Count(p => p.IsActive && p.Stock > 0)
                })
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo categorías");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    // GET: api/shop/products/featured
    [HttpGet("products/featured")]
    [EnableRateLimiting("catalog")]
    public async Task<ActionResult<IEnumerable<ProductShopDto>>> GetFeaturedProducts([FromQuery] int limit = 8)
    {
        try
        {
            if (limit <= 0 || limit > 50) limit = 8;

            var rawFeatured = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Variants.Where(v => v.IsActive))
                .Where(p => p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var products = rawFeatured
                .Select(p =>
                {
                    var activeVariants = p.Variants.Where(v => v.IsActive).OrderBy(v => v.Size).ToList();
                    var totalStock = activeVariants.Any() ? activeVariants.Sum(v => v.Stock) : p.Stock;
                    return new ProductShopDto
                    {
                        Id          = p.Id,
                        Code        = p.Brand,
                        Brand       = p.Brand,
                        Size        = p.Size,
                        Price       = p.Price,
                        Name        = p.Name,
                        Description = p.Description ?? string.Empty,
                        SalePrice   = p.SalePrice > 0 ? p.SalePrice : p.Price,
                        Stock       = totalStock,
                        CategoryId  = p.CategoryId,
                        CategoryName = p.Category != null ? p.Category.Name : "Sin categoría",
                        ImageUrl    = p.ImageUrl,
                        Sizes       = activeVariants.Select(v => new ProductSizeDto
                        {
                            VariantId = v.Id,
                            Size      = v.Size,
                            Stock     = v.Stock
                        }).ToList()
                    };
                })
                .Where(p => p.Stock > 0)
                .Take(limit)
                .ToList();

            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo productos destacados");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // POST: api/shop/contact
    [HttpPost("contact")]
    public async Task<ActionResult> SubmitContact([FromBody] ContactDto contact)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(contact.Name))
                return BadRequest(new { message = "El nombre es requerido" });
            if (string.IsNullOrWhiteSpace(contact.Email))
                return BadRequest(new { message = "El email es requerido" });
            if (string.IsNullOrWhiteSpace(contact.Message))
                return BadRequest(new { message = "El mensaje es requerido" });
            if (!contact.Email.Contains("@"))
                return BadRequest(new { message = "Email inválido" });

            _logger.LogInformation(
                "Consulta recibida - {Name} ({Email}): {Message}",
                contact.Name, contact.Email, contact.Message);

            return Ok(new { success = true, message = "Consulta enviada exitosamente." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error procesando consulta de contacto");
            return StatusCode(500, new { success = false, message = "Error interno del servidor" });
        }
    }
}
