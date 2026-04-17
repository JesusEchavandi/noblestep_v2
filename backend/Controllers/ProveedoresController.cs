using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Helpers;
using NobleStep.Api.Models;

namespace NobleStep.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/suppliers")]
public class ProveedoresController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProveedoresController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProveedorDto>>> GetProveedores()
    {
        var proveedores = await _context.Proveedores
            .Where(s => s.Activo)
            .OrderBy(s => s.RazonSocial)
            .Select(s => new ProveedorDto
            {
                Id = s.Id,
                NombreEmpresa = s.RazonSocial,
                NombreContacto = s.NombreContacto,
                NumeroDocumento = s.NumeroDocumento,
                Telefono = s.Telefono,
                Correo = s.Correo,
                Direccion = s.Direccion,
                Ciudad = s.Ciudad,
                Pais = s.Pais,
                Activo = s.Activo
            })
            .ToListAsync();

        return Ok(proveedores);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProveedorDto>> GetProveedor(int id)
    {
        var proveedor = await _context.Proveedores.FindAsync(id);

        if (proveedor == null)
        {
            return NotFound(new { message = "Proveedor no encontrado" });
        }

        var proveedorDto = new ProveedorDto
        {
            Id = proveedor.Id,
            NombreEmpresa = proveedor.RazonSocial,
            NombreContacto = proveedor.NombreContacto,
            NumeroDocumento = proveedor.NumeroDocumento,
            Telefono = proveedor.Telefono,
            Correo = proveedor.Correo,
            Direccion = proveedor.Direccion,
            Ciudad = proveedor.Ciudad,
            Pais = proveedor.Pais,
            Activo = proveedor.Activo
        };

        return Ok(proveedorDto);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult<ProveedorDto>> CrearProveedor(CrearProveedorDto dto)
    {
        var existente = await _context.Proveedores
            .FirstOrDefaultAsync(s => s.NumeroDocumento == dto.NumeroDocumento);

        if (existente != null)
        {
            return BadRequest(new { message = "Ya existe un proveedor con este número de documento" });
        }

        var proveedor = new Proveedor
        {
            RazonSocial = dto.NombreEmpresa,
            NombreContacto = dto.NombreContacto,
            NumeroDocumento = dto.NumeroDocumento,
            Telefono = dto.Telefono,
            Correo = dto.Correo,
            Direccion = dto.Direccion,
            Ciudad = dto.Ciudad,
            Pais = dto.Pais,
            Activo = true,
            FechaCreacion = DateTimeHelper.GetPeruDateTime()
        };

        _context.Proveedores.Add(proveedor);
        await _context.SaveChangesAsync();

        var proveedorDto = new ProveedorDto
        {
            Id = proveedor.Id,
            NombreEmpresa = proveedor.RazonSocial,
            NombreContacto = proveedor.NombreContacto,
            NumeroDocumento = proveedor.NumeroDocumento,
            Telefono = proveedor.Telefono,
            Correo = proveedor.Correo,
            Direccion = proveedor.Direccion,
            Ciudad = proveedor.Ciudad,
            Pais = proveedor.Pais,
            Activo = proveedor.Activo
        };

        return CreatedAtAction(nameof(GetProveedor), new { id = proveedor.Id }, proveedorDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ActualizarProveedor(int id, ActualizarProveedorDto dto)
    {
        var proveedor = await _context.Proveedores.FindAsync(id);

        if (proveedor == null)
        {
            return NotFound(new { message = "Proveedor no encontrado" });
        }

        var existente = await _context.Proveedores
            .FirstOrDefaultAsync(s => s.NumeroDocumento == dto.NumeroDocumento && s.Id != id);

        if (existente != null)
        {
            return BadRequest(new { message = "Ya existe otro proveedor con este número de documento" });
        }

        proveedor.RazonSocial = dto.NombreEmpresa;
        proveedor.NombreContacto = dto.NombreContacto;
        proveedor.NumeroDocumento = dto.NumeroDocumento;
        proveedor.Telefono = dto.Telefono;
        proveedor.Correo = dto.Correo;
        proveedor.Direccion = dto.Direccion;
        proveedor.Ciudad = dto.Ciudad;
        proveedor.Pais = dto.Pais;
        proveedor.Activo = dto.Activo;
        proveedor.FechaActualizacion = DateTimeHelper.GetPeruDateTime();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> EliminarProveedor(int id)
    {
        var proveedor = await _context.Proveedores.FindAsync(id);

        if (proveedor == null)
        {
            return NotFound(new { message = "Proveedor no encontrado" });
        }

        var tieneCompras = await _context.Compras.AnyAsync(p => p.ProveedorId == id);

        if (tieneCompras)
        {
            return BadRequest(new { message = "No se puede eliminar el proveedor porque tiene compras registradas" });
        }

        _context.Proveedores.Remove(proveedor);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
