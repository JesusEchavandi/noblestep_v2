using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Models;
using NobleStep.Api.Services;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/ecommerce/auth")]
public class AutenticacionEcommerceController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;
    private readonly IServicioCorreo _servicioCorreo;
    private readonly ILogger<AutenticacionEcommerceController> _logger;
    private readonly IConfiguration _configuration;

    public AutenticacionEcommerceController(
        AppDbContext context,
        TokenService tokenService,
        IServicioCorreo servicioCorreo,
        ILogger<AutenticacionEcommerceController> logger,
        IConfiguration configuration)
    {
        _context = context;
        _tokenService = tokenService;
        _servicioCorreo = servicioCorreo;
        _logger = logger;
        _configuration = configuration;
    }

    // POST: api/ecommerce/auth/register
    [HttpPost("register")]
    [EnableRateLimiting("register")]
    public async Task<ActionResult<RespuestaAutenticacionEcommerceDto>> Registrar([FromBody] RegistroEcommerceDto? dto)
    {
        try
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Datos de registro inválidos" });
            }

            if (string.IsNullOrWhiteSpace(dto.Correo) || !dto.Correo.Contains("@"))
            {
                return BadRequest(new { message = "Email inválido" });
            }

            if (string.IsNullOrWhiteSpace(dto.Contrasena) || dto.Contrasena.Length < 6)
            {
                return BadRequest(new { message = "La contraseña debe tener al menos 6 caracteres" });
            }

            if (string.IsNullOrWhiteSpace(dto.NombreCompleto))
            {
                return BadRequest(new { message = "El nombre completo es requerido" });
            }

            // Verificar email Y hacer hash en PARALELO
            var emailCheckTask = _context.ClientesEcommerce
                .AnyAsync(c => c.Correo.ToLower() == dto.Correo.ToLower());

            var hashTask = Task.Run(() =>
                BCrypt.Net.BCrypt.HashPassword(dto.Contrasena, workFactor: 10));

            await Task.WhenAll(emailCheckTask, hashTask);

            if (emailCheckTask.Result)
            {
                return BadRequest(new { message = "Este email ya está registrado" });
            }

            var hashContrasena = hashTask.Result;

            var cliente = new ClienteEcommerce
            {
                Correo = dto.Correo.ToLower(),
                HashContrasena = hashContrasena,
                NombreCompleto = dto.NombreCompleto,
                Telefono = dto.Telefono,
                Activo = true,
                CorreoVerificado = false,
                FechaCreacion = DateTime.UtcNow,
                FechaActualizacion = DateTime.UtcNow
            };

            _context.ClientesEcommerce.Add(cliente);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException dbEx) when (
                dbEx.InnerException?.Message.Contains("Duplicate entry") == true ||
                dbEx.InnerException?.Message.Contains("UNIQUE constraint") == true ||
                dbEx.InnerException?.Message.Contains("unique_email") == true ||
                dbEx.InnerException?.Message.Contains("IX_") == true)
            {
                _logger.LogWarning("Intento de registro con email duplicado (race condition): {Correo}", dto.Correo);
                return BadRequest(new { message = "Este email ya está registrado" });
            }

            // Enviar email de bienvenida de forma no bloqueante
            _ = Task.Run(async () =>
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(8));
                try
                {
                    await Task.Run(() => _servicioCorreo.EnviarCorreoBienvenidaAsync(cliente.Correo, cliente.NombreCompleto), cts.Token);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogWarning("Timeout enviando email de bienvenida a {Correo} (8s)", cliente.Correo);
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "No se pudo enviar email de bienvenida a {Correo}", cliente.Correo);
                }
            });

            // Generar token JWT + Refresh Token
            var token = _tokenService.GenerarTokenEcommerce(cliente);
            var (refreshToken, refreshHash, refreshExpires) = _tokenService.GenerarRefreshTokenEcommerce();

            cliente.HashTokenRefresco = refreshHash;
            cliente.ExpiracionTokenRefresco = refreshExpires;
            await _context.SaveChangesAsync();

            var response = new RespuestaAutenticacionEcommerceDto
            {
                Token = token,
                TokenRefresco = refreshToken,
                ExpiracionTokenRefresco = refreshExpires,
                Cliente = new ClienteEcommerceDto
                {
                    Id = cliente.Id,
                    Correo = cliente.Correo,
                    NombreCompleto = cliente.NombreCompleto,
                    Telefono = cliente.Telefono,
                    NumeroDocumento = cliente.NumeroDocumento,
                    Direccion = cliente.Direccion,
                    Ciudad = cliente.Ciudad,
                    Distrito = cliente.Distrito,
                    CorreoVerificado = cliente.CorreoVerificado,
                    CreadoEn = cliente.FechaCreacion
                }
            };

            _logger.LogInformation("Nuevo cliente registrado: {Correo}", cliente.Correo);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error durante el registro");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // POST: api/ecommerce/auth/login
    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<RespuestaAutenticacionEcommerceDto>> IniciarSesion([FromBody] InicioSesionEcommerceDto? dto)
    {
        try
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Datos de login inválidos" });
            }

            if (string.IsNullOrWhiteSpace(dto.Correo) || string.IsNullOrWhiteSpace(dto.Contrasena))
            {
                return BadRequest(new { message = "Email y contraseña son requeridos" });
            }

            var cliente = await _context.ClientesEcommerce
                .FirstOrDefaultAsync(c => c.Correo.ToLower() == dto.Correo.ToLower());

            if (cliente == null)
            {
                return Unauthorized(new { message = "Email o contraseña incorrectos" });
            }

            if (!cliente.Activo)
            {
                return Unauthorized(new { message = "Esta cuenta está desactivada" });
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.Contrasena, cliente.HashContrasena))
            {
                return Unauthorized(new { message = "Email o contraseña incorrectos" });
            }

            var token = _tokenService.GenerarTokenEcommerce(cliente);
            var (refreshToken, refreshHash, refreshExpires) = _tokenService.GenerarRefreshTokenEcommerce();

            cliente.HashTokenRefresco = refreshHash;
            cliente.ExpiracionTokenRefresco = refreshExpires;
            cliente.FechaActualizacion = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var response = new RespuestaAutenticacionEcommerceDto
            {
                Token = token,
                TokenRefresco = refreshToken,
                ExpiracionTokenRefresco = refreshExpires,
                Cliente = new ClienteEcommerceDto
                {
                    Id = cliente.Id,
                    Correo = cliente.Correo,
                    NombreCompleto = cliente.NombreCompleto,
                    Telefono = cliente.Telefono,
                    NumeroDocumento = cliente.NumeroDocumento,
                    Direccion = cliente.Direccion,
                    Ciudad = cliente.Ciudad,
                    Distrito = cliente.Distrito,
                    CorreoVerificado = cliente.CorreoVerificado,
                    CreadoEn = cliente.FechaCreacion
                }
            };

            _logger.LogInformation("Cliente autenticado: {Correo}", cliente.Correo);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error durante el login");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // POST: api/ecommerce/auth/refresh-token
    [HttpPost("refresh-token")]
    public async Task<ActionResult<RespuestaAutenticacionEcommerceDto>> RefrescarToken([FromBody] TokenRefrescoEcommerceDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.TokenRefresco))
                return BadRequest(new { message = "Refresh token inválido" });

            var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(dto.TokenRefresco)));

            var cliente = await _context.ClientesEcommerce
                .FirstOrDefaultAsync(c => c.HashTokenRefresco == tokenHash);

            if (cliente == null)
                return Unauthorized(new { message = "Refresh token inválido" });

            if (!cliente.Activo)
                return Unauthorized(new { message = "Esta cuenta está desactivada" });

            if (cliente.ExpiracionTokenRefresco == null || cliente.ExpiracionTokenRefresco < DateTime.UtcNow)
                return Unauthorized(new { message = "Refresh token expirado, inicia sesión nuevamente" });

            var nuevoJwt = _tokenService.GenerarTokenEcommerce(cliente);
            var (nuevoRefreshToken, nuevoRefreshHash, nuevaExpiracion) = _tokenService.GenerarRefreshTokenEcommerce();

            cliente.HashTokenRefresco = nuevoRefreshHash;
            cliente.ExpiracionTokenRefresco = nuevaExpiracion;
            cliente.FechaActualizacion = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var response = new RespuestaAutenticacionEcommerceDto
            {
                Token = nuevoJwt,
                TokenRefresco = nuevoRefreshToken,
                ExpiracionTokenRefresco = nuevaExpiracion,
                Cliente = new ClienteEcommerceDto
                {
                    Id = cliente.Id,
                    Correo = cliente.Correo,
                    NombreCompleto = cliente.NombreCompleto,
                    Telefono = cliente.Telefono,
                    NumeroDocumento = cliente.NumeroDocumento,
                    Direccion = cliente.Direccion,
                    Ciudad = cliente.Ciudad,
                    Distrito = cliente.Distrito,
                    CorreoVerificado = cliente.CorreoVerificado,
                    CreadoEn = cliente.FechaCreacion
                }
            };

            _logger.LogInformation("Refresh token rotado para: {Correo}", cliente.Correo);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en refresh-token");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // POST: api/ecommerce/auth/logout
    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult> CerrarSesion()
    {
        try
        {
            var clienteId = ObtenerClienteIdDesdeToken();
            if (clienteId == null)
                return Unauthorized(new { message = "No autorizado" });

            var cliente = await _context.ClientesEcommerce
                .FirstOrDefaultAsync(c => c.Id == clienteId.Value);

            if (cliente != null)
            {
                cliente.HashTokenRefresco = null;
                cliente.ExpiracionTokenRefresco = null;
                cliente.FechaActualizacion = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("Cliente cerró sesión: {ClienteId}", clienteId);
            return Ok(new { message = "Sesión cerrada exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en logout");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // POST: api/ecommerce/auth/forgot-password
    [HttpPost("forgot-password")]
    [EnableRateLimiting("forgot-password")]
    public async Task<ActionResult> OlvidoContrasena([FromBody] OlvidoContrasenaDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Correo))
            {
                return BadRequest(new { message = "El email es requerido" });
            }

            var cliente = await _context.ClientesEcommerce
                .FirstOrDefaultAsync(c => c.Correo.ToLower() == dto.Correo.ToLower());

            var minutosExpiracion = _configuration.GetValue<int?>("App:PasswordResetTokenMinutes") ?? 5;
            if (minutosExpiracion < 1)
            {
                minutosExpiracion = 5;
            }

            if (cliente != null)
            {
                var tokenRestablecimiento = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
                var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(tokenRestablecimiento)));

                cliente.TokenRecuperacion = tokenHash;
                cliente.ExpiracionRecuperacion = DateTime.UtcNow.AddMinutes(minutosExpiracion);
                cliente.FechaActualizacion = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _servicioCorreo.EnviarCorreoRestablecimientoAsync(
                            cliente.Correo,
                            tokenRestablecimiento,
                            string.IsNullOrWhiteSpace(cliente.NombreCompleto) ? "cliente" : cliente.NombreCompleto);

                        _logger.LogInformation("Correo de recuperación enviado a: {Correo}", cliente.Correo);
                    }
                    catch (Exception emailEx)
                    {
                        _logger.LogError(emailEx, "No se pudo enviar correo de recuperación a: {Correo}", cliente.Correo);
                    }
                });
            }

            return Ok(new OlvidoContrasenaRespuestaDto
            {
                Message = "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
                ExpiraEnMinutos = minutosExpiracion
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en forgot-password");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // POST: api/ecommerce/auth/reset-password
    [HttpPost("reset-password")]
    public async Task<ActionResult> RestablecerContrasena([FromBody] RestablecerContrasenaDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Token))
            {
                return BadRequest(new { message = "Token inválido" });
            }

            if (string.IsNullOrWhiteSpace(dto.NuevaContrasena) || dto.NuevaContrasena.Length < 6)
            {
                return BadRequest(new { message = "La contraseña debe tener al menos 6 caracteres" });
            }

            var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(dto.Token)));
            var cliente = await _context.ClientesEcommerce
                .FirstOrDefaultAsync(c => c.TokenRecuperacion == tokenHash);

            if (cliente == null)
            {
                return BadRequest(new { message = "Token inválido o expirado" });
            }

            if (cliente.ExpiracionRecuperacion == null || cliente.ExpiracionRecuperacion < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Token inválido o expirado" });
            }

            cliente.HashContrasena = BCrypt.Net.BCrypt.HashPassword(dto.NuevaContrasena);
            cliente.TokenRecuperacion = null;
            cliente.ExpiracionRecuperacion = null;
            cliente.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Contraseña restablecida para: {Correo}", cliente.Correo);
            return Ok(new { message = "Contraseña restablecida exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en reset-password");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // GET: api/ecommerce/auth/profile
    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<ClienteEcommerceDto>> ObtenerPerfil()
    {
        try
        {
            var clienteId = ObtenerClienteIdDesdeToken();
            if (clienteId == null)
            {
                return Unauthorized(new { message = "No autorizado" });
            }

            var cliente = await _context.ClientesEcommerce
                .FirstOrDefaultAsync(c => c.Id == clienteId.Value);

            if (cliente == null)
            {
                return NotFound(new { message = "Cliente no encontrado" });
            }

            var response = new ClienteEcommerceDto
            {
                Id = cliente.Id,
                Correo = cliente.Correo,
                NombreCompleto = cliente.NombreCompleto,
                Telefono = cliente.Telefono,
                NumeroDocumento = cliente.NumeroDocumento,
                Direccion = cliente.Direccion,
                Ciudad = cliente.Ciudad,
                Distrito = cliente.Distrito,
                CorreoVerificado = cliente.CorreoVerificado,
                CreadoEn = cliente.FechaCreacion
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obteniendo perfil");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // PUT: api/ecommerce/auth/profile
    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<ClienteEcommerceDto>> ActualizarPerfil([FromBody] ActualizarPerfilDto dto)
    {
        try
        {
            var clienteId = ObtenerClienteIdDesdeToken();
            if (clienteId == null)
            {
                return Unauthorized(new { message = "No autorizado" });
            }

            var cliente = await _context.ClientesEcommerce
                .FirstOrDefaultAsync(c => c.Id == clienteId.Value);

            if (cliente == null)
            {
                return NotFound(new { message = "Cliente no encontrado" });
            }

            if (!string.IsNullOrWhiteSpace(dto.NombreCompleto))
                cliente.NombreCompleto = dto.NombreCompleto;

            cliente.Telefono = dto.Telefono;
            cliente.NumeroDocumento = dto.NumeroDocumento;
            cliente.Direccion = dto.Direccion;
            cliente.Ciudad = dto.Ciudad;
            cliente.Distrito = dto.Distrito;
            cliente.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var response = new ClienteEcommerceDto
            {
                Id = cliente.Id,
                Correo = cliente.Correo,
                NombreCompleto = cliente.NombreCompleto,
                Telefono = cliente.Telefono,
                NumeroDocumento = cliente.NumeroDocumento,
                Direccion = cliente.Direccion,
                Ciudad = cliente.Ciudad,
                Distrito = cliente.Distrito,
                CorreoVerificado = cliente.CorreoVerificado,
                CreadoEn = cliente.FechaCreacion
            };

            _logger.LogInformation("Perfil actualizado para: {Correo}", cliente.Correo);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error actualizando perfil");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // POST: api/ecommerce/auth/set-cookie
    [Authorize]
    [HttpPost("set-cookie")]
    public IActionResult EstablecerCookie()
    {
        var useCookie = _configuration.GetValue<bool>("Auth:UseCookieAuth");
        if (!useCookie)
            return BadRequest(new { message = "Cookie auth no está habilitado en este entorno" });

        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        if (string.IsNullOrWhiteSpace(token))
            return BadRequest(new { message = "Token requerido" });

        var secure = _configuration.GetValue<bool>("Auth:CookieSecure");
        var sameSite = _configuration.GetValue<string>("Auth:CookieSameSite") ?? "Lax";
        var domain = _configuration.GetValue<string>("Auth:CookieDomain");

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = sameSite == "Strict" ? SameSiteMode.Strict
                      : sameSite == "None" ? SameSiteMode.None
                      : SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddDays(7),
            Path = "/"
        };

        if (!string.IsNullOrWhiteSpace(domain))
            cookieOptions.Domain = domain;

        Response.Cookies.Append("ecommerce_token", token, cookieOptions);
        return Ok(new { message = "Cookie establecida correctamente" });
    }

    private int? ObtenerClienteIdDesdeToken()
    {
        var clienteIdClaim = User.FindFirst("customerId");
        if (clienteIdClaim != null && int.TryParse(clienteIdClaim.Value, out var clienteId))
        {
            return clienteId;
        }
        return null;
    }
}
