using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Helpers;
using NobleStep.Api.Models;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/products")]
[Authorize(Roles = "Administrador,Vendedor")]
public class ProductosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductoDto>>> GetProductos(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        if (pageSize > 200) pageSize = 200;
        if (pageSize < 1) pageSize = 1;
        if (page < 1) page = 1;

        var query = _context.Productos
            .Include(p => p.Categoria)
            .Include(p => p.Variantes)
            .Where(p => p.Activo);

        var total = await query.CountAsync();

        var productosRaw = await query
            .OrderBy(p => p.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var productos = productosRaw.Select(p => new ProductoDto
        {
            Id = p.Id,
            Nombre = p.Nombre,
            Marca = p.Marca,
            CategoriaId = p.CategoriaId,
            NombreCategoria = p.Categoria?.Nombre,
            Talla = p.Talla,
            Precio = p.Precio,
            PrecioVenta = p.PrecioOferta,
            Stock = p.Stock,
            UrlImagen = p.UrlImagen,
            Descripcion = p.Descripcion,
            Activo = p.Activo,
            Variantes = p.Variantes?
                .Where(v => v.Activo)
                .Select(v => new VarianteProductoDto
                {
                    Id = v.Id,
                    ProductoId = v.ProductoId,
                    NombreProducto = p.Nombre,
                    Marca = p.Marca,
                    Talla = v.Talla,
                    Stock = v.Stock,
                    Activo = v.Activo
                }).ToList() ?? new List<VarianteProductoDto>()
        }).ToList();

        return Ok(new
        {
            datos = productos,
            pagina = page,
            tamanoPagina = pageSize,
            total,
            totalPaginas = (int)Math.Ceiling((double)total / pageSize)
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductoDto>> GetProducto(int id)
    {
        var producto = await _context.Productos
            .Include(p => p.Categoria)
            .Include(p => p.Variantes)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (producto == null)
            return NotFound();

        var productoDto = new ProductoDto
        {
            Id = producto.Id,
            Nombre = producto.Nombre,
            Marca = producto.Marca,
            CategoriaId = producto.CategoriaId,
            NombreCategoria = producto.Categoria.Nombre,
            Talla = producto.Talla,
            Precio = producto.Precio,
            PrecioVenta = producto.PrecioOferta,
            Stock = producto.Stock,
            UrlImagen = producto.UrlImagen,
            Descripcion = producto.Descripcion,
            Activo = producto.Activo,
            Variantes = producto.Variantes
                .Where(v => v.Activo)
                .Select(v => new VarianteProductoDto
                {
                    Id = v.Id,
                    ProductoId = v.ProductoId,
                    NombreProducto = producto.Nombre,
                    Marca = producto.Marca,
                    Talla = v.Talla,
                    Stock = v.Stock,
                    Activo = v.Activo
                }).ToList()
        };

        return Ok(productoDto);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult<ProductoDto>> CrearProducto([FromBody] CrearProductoDto crearDto)
    {
        var producto = new Producto
        {
            Nombre = crearDto.Nombre,
            Marca = crearDto.Marca,
            CategoriaId = crearDto.CategoriaId,
            Talla = crearDto.Talla,
            Precio = crearDto.Precio,
            PrecioOferta = crearDto.PrecioVenta,
            Stock = crearDto.Stock,
            UrlImagen = crearDto.UrlImagen,
            Descripcion = crearDto.Descripcion,
            Activo = true
        };

        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();

        await _context.Entry(producto).Reference(p => p.Categoria).LoadAsync();

        var productoDto = new ProductoDto
        {
            Id = producto.Id,
            Nombre = producto.Nombre,
            Marca = producto.Marca,
            CategoriaId = producto.CategoriaId,
            NombreCategoria = producto.Categoria.Nombre,
            Talla = producto.Talla,
            Precio = producto.Precio,
            PrecioVenta = producto.PrecioOferta,
            Stock = producto.Stock,
            UrlImagen = producto.UrlImagen,
            Descripcion = producto.Descripcion,
            Activo = producto.Activo
        };

        return CreatedAtAction(nameof(GetProducto), new { id = producto.Id }, productoDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ActualizarProducto(int id, [FromBody] ActualizarProductoDto actualizarDto)
    {
        var producto = await _context.Productos.FindAsync(id);

        if (producto == null)
            return NotFound();

        producto.Nombre = actualizarDto.Nombre;
        producto.Marca = actualizarDto.Marca;
        producto.CategoriaId = actualizarDto.CategoriaId;
        producto.Talla = actualizarDto.Talla;
        producto.Precio = actualizarDto.Precio;
        producto.PrecioOferta = actualizarDto.PrecioVenta;
        producto.Stock = actualizarDto.Stock;
        producto.UrlImagen = actualizarDto.UrlImagen;
        producto.Descripcion = actualizarDto.Descripcion;
        producto.Activo = actualizarDto.Activo;
        producto.FechaActualizacion = DateTimeHelper.GetPeruDateTime();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> EliminarProducto(int id)
    {
        var producto = await _context.Productos.FindAsync(id);

        if (producto == null)
            return NotFound();

        // Eliminación lógica
        producto.Activo = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
