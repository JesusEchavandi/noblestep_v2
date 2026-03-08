using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/shop")]
public class TiendaController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TiendaController> _logger;
    private readonly IMemoryCache _cache;

    // Tiempos de caché por endpoint
    private static readonly TimeSpan DuracionCacheCatalogo = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan DuracionCacheDestacados = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan DuracionCacheCategorias = TimeSpan.FromMinutes(15);

    public TiendaController(AppDbContext context, ILogger<TiendaController> logger, IMemoryCache cache)
    {
        _context = context;
        _logger = logger;
        _cache = cache;
    }

    // GET: api/shop/products
    [HttpGet("products")]
    [EnableRateLimiting("catalog")]
    public async Task<ActionResult> GetProductos(
        [FromQuery] int? categoryId = null,
        [FromQuery] string? search = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] bool? inStock = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 1;
            if (pageSize > 100) pageSize = 100;

            var query = _context.Productos
                .AsNoTracking()
                .Include(p => p.Categoria)
                .Where(p => p.Activo && p.Stock > 0)
                .AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoriaId == categoryId.Value);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p => p.Nombre.Contains(search) || p.Marca.Contains(search));

            if (minPrice.HasValue)
                query = query.Where(p => p.Precio >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Precio <= maxPrice.Value);

            // Contar total antes de paginar
            var totalItems = await query.CountAsync();

            // Cargar productos con sus variantes activas, paginados en BD
            var rawProductos = await query
                .Include(p => p.Variantes.Where(v => v.Activo))
                .OrderByDescending(p => p.FechaActualizacion)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var productos = rawProductos.Select(p =>
            {
                var variantesActivas = p.Variantes.Where(v => v.Activo).OrderBy(v => v.Talla).ToList();
                var stockTotal = variantesActivas.Any()
                    ? variantesActivas.Sum(v => v.Stock)
                    : p.Stock;

                return new ProductoTiendaDto
                {
                    Id = p.Id,
                    Codigo = p.Marca,
                    Marca = p.Marca,
                    Talla = p.Talla,
                    Precio = p.Precio,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion ?? string.Empty,
                    PrecioVenta = p.PrecioOferta > 0 ? p.PrecioOferta : p.Precio,
                    Stock = stockTotal,
                    CategoriaId = p.CategoriaId,
                    NombreCategoria = p.Categoria != null ? p.Categoria.Nombre : "Sin categoría",
                    UrlImagen = p.UrlImagen,
                    Tallas = variantesActivas.Select(v => new TallaProductoDto
                    {
                        VarianteId = v.Id,
                        Talla = v.Talla,
                        Stock = v.Stock
                    }).ToList()
                };
            })
            .Where(p => p.Stock > 0)
            .ToList();

            var response = new PaginatedResponse<ProductoTiendaDto>
            {
                Items = productos,
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo productos para el catálogo");
            return StatusCode(500, new { message = "Error interno del servidor. Intente nuevamente más tarde." });
        }
    }

    // GET: api/shop/products/{id}
    [HttpGet("products/{id}")]
    [EnableRateLimiting("catalog")]
    public async Task<ActionResult<ProductoTiendaDto>> GetProducto(int id)
    {
        try
        {
            if (id <= 0)
                return BadRequest(new { message = "ID de producto inválido" });

            var p = await _context.Productos
                .AsNoTracking()
                .Include(p => p.Categoria)
                .Include(p => p.Variantes.Where(v => v.Activo))
                .Where(p => p.Id == id && p.Activo)
                .FirstOrDefaultAsync();

            if (p == null)
                return NotFound(new { message = "Producto no encontrado" });

            var variantesActivas = p.Variantes.Where(v => v.Activo).OrderBy(v => v.Talla).ToList();
            var stockTotal = variantesActivas.Any() ? variantesActivas.Sum(v => v.Stock) : p.Stock;

            var producto = new ProductoTiendaDto
            {
                Id = p.Id,
                Codigo = p.Marca,
                Marca = p.Marca,
                Talla = p.Talla,
                Precio = p.Precio,
                Nombre = p.Nombre,
                Descripcion = p.Descripcion ?? string.Empty,
                PrecioVenta = p.PrecioOferta > 0 ? p.PrecioOferta : p.Precio,
                Stock = stockTotal,
                CategoriaId = p.CategoriaId,
                NombreCategoria = p.Categoria != null ? p.Categoria.Nombre : "Sin categoría",
                UrlImagen = p.UrlImagen,
                Tallas = variantesActivas.Select(v => new TallaProductoDto
                {
                    VarianteId = v.Id,
                    Talla = v.Talla,
                    Stock = v.Stock
                }).ToList()
            };

            return Ok(producto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo detalle del producto {ProductoId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // GET: api/shop/categories
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<CategoriaTiendaDto>>> GetCategorias()
    {
        try
        {
            const string cacheKey = "shop:categories";
            if (_cache.TryGetValue(cacheKey, out List<CategoriaTiendaDto>? cached) && cached != null)
                return Ok(cached);

            var categorias = await _context.Categorias
                .AsNoTracking()
                .Where(c => c.Productos.Any(p => p.Activo && p.Stock > 0))
                .Select(c => new CategoriaTiendaDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion,
                    CantidadProductos = c.Productos.Count(p => p.Activo && p.Stock > 0)
                })
                .OrderBy(c => c.Nombre)
                .ToListAsync();

            _cache.Set(cacheKey, categorias, DuracionCacheCategorias);
            return Ok(categorias);
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
    public async Task<ActionResult<IEnumerable<ProductoTiendaDto>>> GetProductosDestacados([FromQuery] int limit = 8)
    {
        try
        {
            if (limit <= 0 || limit > 50) limit = 8;

            var cacheKey = $"shop:featured:{limit}";
            if (_cache.TryGetValue(cacheKey, out List<ProductoTiendaDto>? cached) && cached != null)
                return Ok(cached);

            var rawDestacados = await _context.Productos
                .AsNoTracking()
                .Include(p => p.Categoria)
                .Include(p => p.Variantes.Where(v => v.Activo))
                .Where(p => p.Activo)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();

            var productos = rawDestacados
                .Select(p =>
                {
                    var variantesActivas = p.Variantes.Where(v => v.Activo).OrderBy(v => v.Talla).ToList();
                    var stockTotal = variantesActivas.Any() ? variantesActivas.Sum(v => v.Stock) : p.Stock;
                    return new ProductoTiendaDto
                    {
                        Id = p.Id,
                        Codigo = p.Marca,
                        Marca = p.Marca,
                        Talla = p.Talla,
                        Precio = p.Precio,
                        Nombre = p.Nombre,
                        Descripcion = p.Descripcion ?? string.Empty,
                        PrecioVenta = p.PrecioOferta > 0 ? p.PrecioOferta : p.Precio,
                        Stock = stockTotal,
                        CategoriaId = p.CategoriaId,
                        NombreCategoria = p.Categoria != null ? p.Categoria.Nombre : "Sin categoría",
                        UrlImagen = p.UrlImagen,
                        Tallas = variantesActivas.Select(v => new TallaProductoDto
                        {
                            VarianteId = v.Id,
                            Talla = v.Talla,
                            Stock = v.Stock
                        }).ToList()
                    };
                })
                .Where(p => p.Stock > 0)
                .Take(limit)
                .ToList();

            _cache.Set(cacheKey, productos, DuracionCacheDestacados);
            return Ok(productos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo productos destacados");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // POST: api/shop/contact
    [HttpPost("contact")]
    public async Task<ActionResult> EnviarContacto([FromBody] ContactoDto contacto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(contacto.Nombre))
                return BadRequest(new { message = "El nombre es requerido" });
            if (string.IsNullOrWhiteSpace(contacto.Correo))
                return BadRequest(new { message = "El email es requerido" });
            if (string.IsNullOrWhiteSpace(contacto.Mensaje))
                return BadRequest(new { message = "El mensaje es requerido" });
            if (!contacto.Correo.Contains("@"))
                return BadRequest(new { message = "Email inválido" });

            _logger.LogInformation(
                "Consulta recibida - {Nombre} ({Correo}): {Mensaje}",
                contacto.Nombre, contacto.Correo, contacto.Mensaje);

            return Ok(new { success = true, message = "Consulta enviada exitosamente." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error procesando consulta de contacto");
            return StatusCode(500, new { success = false, message = "Error interno del servidor" });
        }
    }
}
