using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Helpers;
using NobleStep.Api.Models;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize(Roles = "Administrador,Vendedor")]
public class ClientesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClientesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClienteDto>>> GetClientes(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (pageSize > 200) pageSize = 200;
        if (pageSize < 1) pageSize = 1;
        if (page < 1) page = 1;

        var query = _context.Clientes
            .Where(c => c.Activo)
            .OrderBy(c => c.NombreCompleto);

        var total = await query.CountAsync();

        var clientes = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ClienteDto
            {
                Id = c.Id,
                NombreCompleto = c.NombreCompleto,
                NumeroDocumento = c.NumeroDocumento,
                Telefono = c.Telefono,
                Correo = c.Correo,
                Activo = c.Activo
            })
            .ToListAsync();

        return Ok(new
        {
            datos = clientes,
            pagina = page,
            tamanoPagina = pageSize,
            total,
            totalPaginas = (int)Math.Ceiling((double)total / pageSize)
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClienteDto>> GetCliente(int id)
    {
        var cliente = await _context.Clientes.FindAsync(id);

        if (cliente == null)
            return NotFound();

        var clienteDto = new ClienteDto
        {
            Id = cliente.Id,
            NombreCompleto = cliente.NombreCompleto,
            NumeroDocumento = cliente.NumeroDocumento,
            Telefono = cliente.Telefono,
            Correo = cliente.Correo,
            Activo = cliente.Activo
        };

        return Ok(clienteDto);
    }

    [HttpPost]
    public async Task<ActionResult<ClienteDto>> CrearCliente([FromBody] CrearClienteDto crearDto)
    {
        var numeroDocumento = (crearDto.NumeroDocumento ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(numeroDocumento))
            return BadRequest(new { message = "El número de documento es requerido" });

        // Verificar si el número de documento ya existe
        if (await _context.Clientes.AnyAsync(c => c.NumeroDocumento == numeroDocumento))
            return BadRequest(new { message = "El número de documento ya existe" });

        var cliente = new Cliente
        {
            NombreCompleto = crearDto.NombreCompleto,
            NumeroDocumento = numeroDocumento,
            Telefono = crearDto.Telefono,
            Correo = crearDto.Correo,
            Activo = true
        };

        _context.Clientes.Add(cliente);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException dbEx) when (
            dbEx.InnerException?.Message.Contains("Duplicate", StringComparison.OrdinalIgnoreCase) == true ||
            dbEx.InnerException?.Message.Contains("duplicate", StringComparison.OrdinalIgnoreCase) == true ||
            dbEx.InnerException?.Message.Contains("uq_numero_documento", StringComparison.OrdinalIgnoreCase) == true)
        {
            return BadRequest(new { message = "El número de documento ya existe" });
        }

        var clienteDto = new ClienteDto
        {
            Id = cliente.Id,
            NombreCompleto = cliente.NombreCompleto,
            NumeroDocumento = cliente.NumeroDocumento,
            Telefono = cliente.Telefono,
            Correo = cliente.Correo,
            Activo = cliente.Activo
        };

        return CreatedAtAction(nameof(GetCliente), new { id = cliente.Id }, clienteDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarCliente(int id, [FromBody] CrearClienteDto actualizarDto)
    {
        var cliente = await _context.Clientes.FindAsync(id);

        if (cliente == null)
            return NotFound();

        var numeroDocumento = (actualizarDto.NumeroDocumento ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(numeroDocumento))
            return BadRequest(new { message = "El número de documento es requerido" });

        // Verificar si el número de documento ya lo tiene otro cliente
        if (await _context.Clientes.AnyAsync(c => c.NumeroDocumento == numeroDocumento && c.Id != id))
            return BadRequest(new { message = "El número de documento ya existe" });

        cliente.NombreCompleto = actualizarDto.NombreCompleto;
        cliente.NumeroDocumento = numeroDocumento;
        cliente.Telefono = actualizarDto.Telefono;
        cliente.Correo = actualizarDto.Correo;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> EliminarCliente(int id)
    {
        var cliente = await _context.Clientes.FindAsync(id);

        if (cliente == null)
            return NotFound();

        // Eliminación lógica
        cliente.Activo = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
