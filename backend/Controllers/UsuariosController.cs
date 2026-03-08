using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Helpers;
using NobleStep.Api.Models;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Administrador")]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<UsuariosController> _logger;

    public UsuariosController(AppDbContext context, ILogger<UsuariosController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetUsuarios()
    {
        var usuarios = await _context.Usuarios
            .Select(u => new UsuarioDto
            {
                Id = u.Id,
                NombreUsuario = u.NombreUsuario,
                NombreCompleto = u.NombreCompleto,
                Correo = u.Correo,
                Rol = u.Rol,
                Activo = u.Activo,
                CreadoEn = u.FechaCreacion
            })
            .ToListAsync();

        return Ok(usuarios);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioDto>> GetUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
            return NotFound();

        var usuarioDto = new UsuarioDto
        {
            Id = usuario.Id,
            NombreUsuario = usuario.NombreUsuario,
            NombreCompleto = usuario.NombreCompleto,
            Correo = usuario.Correo,
            Rol = usuario.Rol,
            Activo = usuario.Activo,
            CreadoEn = usuario.FechaCreacion
        };

        return Ok(usuarioDto);
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> CrearUsuario([FromBody] CrearUsuarioDto crearDto)
    {
        // Verificar si el nombre de usuario ya existe
        if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == crearDto.NombreUsuario))
        {
            return BadRequest(new { message = "El nombre de usuario ya existe" });
        }

        // Verificar si el email ya existe
        if (await _context.Usuarios.AnyAsync(u => u.Correo == crearDto.Correo))
        {
            return BadRequest(new { message = "El email ya está registrado" });
        }

        var usuario = new Usuario
        {
            NombreUsuario = crearDto.NombreUsuario,
            NombreCompleto = crearDto.NombreCompleto,
            Correo = crearDto.Correo,
            HashContrasena = BCrypt.Net.BCrypt.HashPassword(crearDto.Contrasena),
            Rol = crearDto.Rol,
            Activo = true
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        var usuarioDto = new UsuarioDto
        {
            Id = usuario.Id,
            NombreUsuario = usuario.NombreUsuario,
            NombreCompleto = usuario.NombreCompleto,
            Correo = usuario.Correo,
            Rol = usuario.Rol,
            Activo = usuario.Activo,
            CreadoEn = usuario.FechaCreacion
        };

        return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, usuarioDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarUsuario(int id, [FromBody] ActualizarUsuarioDto actualizarDto)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
            return NotFound();

        // Verificar si el nombre de usuario ya lo tiene otro usuario
        if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == actualizarDto.NombreUsuario && u.Id != id))
        {
            return BadRequest(new { message = "El nombre de usuario ya existe" });
        }

        // Verificar si el email ya lo tiene otro usuario
        if (await _context.Usuarios.AnyAsync(u => u.Correo == actualizarDto.Correo && u.Id != id))
        {
            return BadRequest(new { message = "El email ya está registrado" });
        }

        usuario.NombreUsuario = actualizarDto.NombreUsuario;
        usuario.NombreCompleto = actualizarDto.NombreCompleto;
        usuario.Correo = actualizarDto.Correo;
        usuario.Rol = actualizarDto.Rol;
        usuario.Activo = actualizarDto.Activo;

        // Actualizar contraseña solo si se proporciona
        if (!string.IsNullOrEmpty(actualizarDto.Contrasena))
        {
            usuario.HashContrasena = BCrypt.Net.BCrypt.HashPassword(actualizarDto.Contrasena);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
            return NotFound();

        // Obtener el ID del usuario que ejecuta la acción (admin logueado)
        var adminIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(adminIdClaim) || !int.TryParse(adminIdClaim, out int adminId))
            return Unauthorized();

        // No permitir que un admin se elimine a sí mismo
        if (id == adminId)
            return BadRequest(new { message = "No puedes eliminarte a ti mismo" });

        // Evitar eliminar al último administrador activo
        if (usuario.Rol == RolesUsuario.Administrador && usuario.Activo)
        {
            var cantidadAdmins = await _context.Usuarios.CountAsync(u => u.Rol == RolesUsuario.Administrador && u.Activo && u.Id != id);
            if (cantidadAdmins < 1)
            {
                return BadRequest(new { message = "No se puede eliminar el único administrador activo del sistema" });
            }
        }

        // Reasignar ventas y compras al admin que ejecuta la acción
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var ventasUsuario = await _context.Ventas.Where(v => v.UsuarioId == id).ToListAsync();
            foreach (var venta in ventasUsuario)
                venta.UsuarioId = adminId;

            var comprasUsuario = await _context.Compras.Where(c => c.UsuarioId == id).ToListAsync();
            foreach (var compra in comprasUsuario)
                compra.UsuarioId = adminId;

            // Eliminación física
            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var totalReasignados = ventasUsuario.Count + comprasUsuario.Count;
            if (totalReasignados > 0)
                return Ok(new { message = $"Usuario eliminado. Se reasignaron {ventasUsuario.Count} venta(s) y {comprasUsuario.Count} compra(s) a tu cuenta." });

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error al eliminar usuario {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar el usuario. La operación fue revertida." });
        }
    }

    [HttpPost("{id}/activate")]
    public async Task<IActionResult> ActivarUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
            return NotFound();

        usuario.Activo = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/deactivate")]
    public async Task<IActionResult> DesactivarUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
            return NotFound();

        // Evitar desactivar al último administrador
        if (usuario.Rol == RolesUsuario.Administrador)
        {
            var cantidadAdmins = await _context.Usuarios.CountAsync(u => u.Rol == RolesUsuario.Administrador && u.Activo);
            if (cantidadAdmins <= 1)
            {
                return BadRequest(new { message = "No se puede desactivar el último administrador del sistema" });
            }
        }

        usuario.Activo = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
