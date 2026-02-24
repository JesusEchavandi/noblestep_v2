using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Models;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator,Seller")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        // Límite máximo para evitar abuso de memoria
        if (pageSize > 200) pageSize = 200;
        if (pageSize < 1) pageSize = 1;
        if (page < 1) page = 1;

        var query = _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive);

        var total = await query.CountAsync();

        var products = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Brand = p.Brand,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                Size = p.Size,
                Price = p.Price,
                SalePrice = p.SalePrice,
                Stock = p.Stock,
                ImageUrl = p.ImageUrl,
                Description = p.Description,
                IsActive = p.IsActive
            })
            .ToListAsync();

        return Ok(new
        {
            data = products,
            page,
            pageSize,
            total,
            totalPages = (int)Math.Ceiling((double)total / pageSize)
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound();

        var productDto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Brand = product.Brand,
            CategoryId = product.CategoryId,
            CategoryName = product.Category.Name,
            Size = product.Size,
            Price = product.Price,
            SalePrice = product.SalePrice,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            Description = product.Description,
            IsActive = product.IsActive
        };

        return Ok(productDto);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createDto)
    {
        var product = new Product
        {
            Name = createDto.Name,
            Brand = createDto.Brand,
            CategoryId = createDto.CategoryId,
            Size = createDto.Size,
            Price = createDto.Price,
            SalePrice = createDto.SalePrice,
            Stock = createDto.Stock,
            ImageUrl = createDto.ImageUrl,
            Description = createDto.Description,
            IsActive = true
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        await _context.Entry(product).Reference(p => p.Category).LoadAsync();

        var productDto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Brand = product.Brand,
            CategoryId = product.CategoryId,
            CategoryName = product.Category.Name,
            Size = product.Size,
            Price = product.Price,
            SalePrice = product.SalePrice,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            Description = product.Description,
            IsActive = product.IsActive
        };

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto updateDto)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
            return NotFound();

        product.Name = updateDto.Name;
        product.Brand = updateDto.Brand;
        product.CategoryId = updateDto.CategoryId;
        product.Size = updateDto.Size;
        product.Price = updateDto.Price;
        product.SalePrice = updateDto.SalePrice;
        product.Stock = updateDto.Stock;
        product.ImageUrl = updateDto.ImageUrl;
        product.Description = updateDto.Description;
        product.IsActive = updateDto.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
            return NotFound();

        // Logical delete
        product.IsActive = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
