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
        var nombreCompleto = (crearDto.NombreCompleto ?? string.Empty).Trim();
        var numeroDocumento = (crearDto.NumeroDocumento ?? string.Empty).Trim();
        var telefono = (crearDto.Telefono ?? string.Empty).Trim();
        var correo = (crearDto.Correo ?? string.Empty).Trim();

        if (string.IsNullOrWhiteSpace(numeroDocumento))
            return BadRequest(new { message = "El número de documento es requerido" });

        // Flujo idempotente por DNI para no bloquear la venta:
        // - Si existe y está activo: devolver cliente existente.
        // - Si existe y está inactivo: reactivar y devolver.
        var existente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.NumeroDocumento == numeroDocumento);

        if (existente != null)
        {
            if (!existente.Activo)
            {
                existente.Activo = true;
                existente.FechaActualizacion = DateTime.UtcNow;

                if (!string.IsNullOrWhiteSpace(crearDto.NombreCompleto))
                    existente.NombreCompleto = nombreCompleto;

                if (!string.IsNullOrWhiteSpace(crearDto.Telefono))
                    existente.Telefono = telefono;

                if (!string.IsNullOrWhiteSpace(crearDto.Correo))
                    existente.Correo = correo;

                await _context.SaveChangesAsync();
            }

            var existenteDto = new ClienteDto
            {
                Id = existente.Id,
                NombreCompleto = existente.NombreCompleto,
                NumeroDocumento = existente.NumeroDocumento,
                Telefono = existente.Telefono,
                Correo = existente.Correo,
                Activo = existente.Activo
            };

            return Ok(existenteDto);
        }

        var cliente = new Cliente
        {
            NombreCompleto = nombreCompleto,
            NumeroDocumento = numeroDocumento,
            Telefono = telefono,
            Correo = correo,
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
            // Fallback ante condición de carrera: devolver existente y continuar flujo.
            var clienteExistente = await _context.Clientes
                .FirstOrDefaultAsync(c => c.NumeroDocumento == numeroDocumento);

            if (clienteExistente != null)
            {
                return Ok(new ClienteDto
                {
                    Id = clienteExistente.Id,
                    NombreCompleto = clienteExistente.NombreCompleto,
                    NumeroDocumento = clienteExistente.NumeroDocumento,
                    Telefono = clienteExistente.Telefono,
                    Correo = clienteExistente.Correo,
                    Activo = clienteExistente.Activo
                });
            }

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

        var nombreCompleto = (actualizarDto.NombreCompleto ?? string.Empty).Trim();
        var numeroDocumento = (actualizarDto.NumeroDocumento ?? string.Empty).Trim();
        var telefono = (actualizarDto.Telefono ?? string.Empty).Trim();
        var correo = (actualizarDto.Correo ?? string.Empty).Trim();

        // Verificar si el número de documento ya lo tiene otro cliente
        if (await _context.Clientes.AnyAsync(c => c.NumeroDocumento == numeroDocumento && c.Id != id))
            return BadRequest(new { message = "El número de documento ya existe" });

        cliente.NombreCompleto = nombreCompleto;
        cliente.NumeroDocumento = numeroDocumento;
        cliente.Telefono = telefono;
        cliente.Correo = correo;

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
