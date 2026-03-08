using System.Security.Claims;
using NobleStep.Api.Data;
using NobleStep.Api.Models;

namespace NobleStep.Api.Services;

/// <summary>
/// Servicio para registrar acciones de auditoría en la base de datos.
/// Registra acciones críticas como login, CRUD de entidades, eliminaciones, etc.
/// </summary>
public class AuditService
{
    private readonly AppDbContext _context;
    private readonly ILogger<AuditService> _logger;

    public AuditService(AppDbContext context, ILogger<AuditService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>Registra una acción de auditoría</summary>
    public async Task RegistrarAsync(
        string accion,
        string entidad,
        int? entidadId = null,
        string? descripcion = null,
        int? usuarioId = null,
        string? nombreUsuario = null,
        string? direccionIp = null,
        string? datosAdicionales = null)
    {
        try
        {
            var log = new AuditLog
            {
                FechaUtc = DateTime.UtcNow,
                Accion = accion,
                Entidad = entidad,
                EntidadId = entidadId,
                Descripcion = descripcion ?? string.Empty,
                UsuarioId = usuarioId,
                NombreUsuario = nombreUsuario,
                DireccionIp = direccionIp,
                DatosAdicionales = datosAdicionales
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // Nunca dejar que un error de auditoría rompa el flujo principal
            _logger.LogWarning(ex, "Error registrando auditoría: {Accion} {Entidad} {EntidadId}",
                accion, entidad, entidadId);
        }
    }

    /// <summary>Registra auditoría extrayendo usuario del HttpContext</summary>
    public async Task RegistrarDesdeContextoAsync(
        HttpContext httpContext,
        string accion,
        string entidad,
        int? entidadId = null,
        string? descripcion = null,
        string? datosAdicionales = null)
    {
        var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = httpContext.User.FindFirst(ClaimTypes.Name)?.Value;
        var ip = httpContext.Connection.RemoteIpAddress?.ToString();

        await RegistrarAsync(
            accion, entidad, entidadId, descripcion,
            userId != null ? int.Parse(userId) : null,
            userName, ip, datosAdicionales);
    }
}
