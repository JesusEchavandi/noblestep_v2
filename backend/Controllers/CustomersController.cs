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
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
    {
        var customers = await _context.Customers
            .Where(c => c.IsActive)
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                FullName = c.FullName,
                DocumentNumber = c.DocumentNumber,
                Phone = c.Phone,
                Email = c.Email,
                IsActive = c.IsActive
            })
            .ToListAsync();

        return Ok(customers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(int id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
            return NotFound();

        var customerDto = new CustomerDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            DocumentNumber = customer.DocumentNumber,
            Phone = customer.Phone,
            Email = customer.Email,
            IsActive = customer.IsActive
        };

        return Ok(customerDto);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> CreateCustomer([FromBody] CreateCustomerDto createDto)
    {
        // Check if document number already exists
        if (await _context.Customers.AnyAsync(c => c.DocumentNumber == createDto.DocumentNumber))
            return BadRequest(new { message = "Document number already exists" });

        var customer = new Customer
        {
            FullName = createDto.FullName,
            DocumentNumber = createDto.DocumentNumber,
            Phone = createDto.Phone,
            Email = createDto.Email,
            IsActive = true
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        var customerDto = new CustomerDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            DocumentNumber = customer.DocumentNumber,
            Phone = customer.Phone,
            Email = customer.Email,
            IsActive = customer.IsActive
        };

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customerDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCustomer(int id, [FromBody] CreateCustomerDto updateDto)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
            return NotFound();

        // Check if document number already exists for another customer
        if (await _context.Customers.AnyAsync(c => c.DocumentNumber == updateDto.DocumentNumber && c.Id != id))
            return BadRequest(new { message = "Document number already exists" });

        customer.FullName = updateDto.FullName;
        customer.DocumentNumber = updateDto.DocumentNumber;
        customer.Phone = updateDto.Phone;
        customer.Email = updateDto.Email;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
            return NotFound();

        // Logical delete
        customer.IsActive = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
