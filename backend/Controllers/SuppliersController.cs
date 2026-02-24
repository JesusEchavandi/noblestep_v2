using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Models;

namespace NobleStep.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly AppDbContext _context;

    public SuppliersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Suppliers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SupplierDto>>> GetSuppliers()
    {
        var suppliers = await _context.Suppliers
            .Where(s => s.IsActive)
            .OrderBy(s => s.CompanyName)
            .Select(s => new SupplierDto
            {
                Id = s.Id,
                CompanyName = s.CompanyName,
                ContactName = s.ContactName,
                DocumentNumber = s.DocumentNumber,
                Phone = s.Phone,
                Email = s.Email,
                Address = s.Address,
                City = s.City,
                Country = s.Country,
                IsActive = s.IsActive
            })
            .ToListAsync();

        return Ok(suppliers);
    }

    // GET: api/Suppliers/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SupplierDto>> GetSupplier(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);

        if (supplier == null)
        {
            return NotFound(new { message = "Proveedor no encontrado" });
        }

        var supplierDto = new SupplierDto
        {
            Id = supplier.Id,
            CompanyName = supplier.CompanyName,
            ContactName = supplier.ContactName,
            DocumentNumber = supplier.DocumentNumber,
            Phone = supplier.Phone,
            Email = supplier.Email,
            Address = supplier.Address,
            City = supplier.City,
            Country = supplier.Country,
            IsActive = supplier.IsActive
        };

        return Ok(supplierDto);
    }

    // POST: api/Suppliers
    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<SupplierDto>> CreateSupplier(CreateSupplierDto dto)
    {
        // Check if supplier with same document already exists
        var existingSupplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.DocumentNumber == dto.DocumentNumber);

        if (existingSupplier != null)
        {
            return BadRequest(new { message = "Ya existe un proveedor con este número de documento" });
        }

        var supplier = new Supplier
        {
            CompanyName = dto.CompanyName,
            ContactName = dto.ContactName,
            DocumentNumber = dto.DocumentNumber,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address,
            City = dto.City,
            Country = dto.Country,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();

        var supplierDto = new SupplierDto
        {
            Id = supplier.Id,
            CompanyName = supplier.CompanyName,
            ContactName = supplier.ContactName,
            DocumentNumber = supplier.DocumentNumber,
            Phone = supplier.Phone,
            Email = supplier.Email,
            Address = supplier.Address,
            City = supplier.City,
            Country = supplier.Country,
            IsActive = supplier.IsActive
        };

        return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplierDto);
    }

    // PUT: api/Suppliers/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> UpdateSupplier(int id, UpdateSupplierDto dto)
    {
        var supplier = await _context.Suppliers.FindAsync(id);

        if (supplier == null)
        {
            return NotFound(new { message = "Proveedor no encontrado" });
        }

        // Check if another supplier has the same document
        var existingSupplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.DocumentNumber == dto.DocumentNumber && s.Id != id);

        if (existingSupplier != null)
        {
            return BadRequest(new { message = "Ya existe otro proveedor con este número de documento" });
        }

        supplier.CompanyName = dto.CompanyName;
        supplier.ContactName = dto.ContactName;
        supplier.DocumentNumber = dto.DocumentNumber;
        supplier.Phone = dto.Phone;
        supplier.Email = dto.Email;
        supplier.Address = dto.Address;
        supplier.City = dto.City;
        supplier.Country = dto.Country;
        supplier.IsActive = dto.IsActive;
        supplier.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Suppliers/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);

        if (supplier == null)
        {
            return NotFound(new { message = "Proveedor no encontrado" });
        }

        // Check if supplier has purchases
        var hasPurchases = await _context.Purchases.AnyAsync(p => p.SupplierId == id);

        if (hasPurchases)
        {
            return BadRequest(new { message = "No se puede eliminar el proveedor porque tiene compras registradas" });
        }

        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
