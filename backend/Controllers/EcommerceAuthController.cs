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
public class EcommerceAuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly ILogger<EcommerceAuthController> _logger;
    private readonly IConfiguration _configuration;

    public EcommerceAuthController(
        AppDbContext context,
        TokenService tokenService,
        IEmailService emailService,
        ILogger<EcommerceAuthController> logger,
        IConfiguration configuration)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
        _logger = logger;
        _configuration = configuration;
    }

    // POST: api/ecommerce/auth/register
    [HttpPost("register")]
    [EnableRateLimiting("register")]
    public async Task<ActionResult<EcommerceAuthResponseDto>> Register([FromBody] EcommerceRegisterDto? dto)
    {
        try
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Datos de registro inválidos" });
            }

            // Validaciones
            if (string.IsNullOrWhiteSpace(dto.Email) || !dto.Email.Contains("@"))
            {
                return BadRequest(new { message = "Email inválido" });
            }

            if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            {
                return BadRequest(new { message = "La contraseña debe tener al menos 6 caracteres" });
            }

            if (string.IsNullOrWhiteSpace(dto.FullName))
            {
                return BadRequest(new { message = "El nombre completo es requerido" });
            }

            // Verificar email Y hacer hash en PARALELO para reducir tiempo de respuesta
            var emailCheckTask = _context.EcommerceCustomers
                .AnyAsync(c => c.Email.ToLower() == dto.Email.ToLower());

            var hashTask = Task.Run(() =>
                BCrypt.Net.BCrypt.HashPassword(dto.Password, workFactor: 10));

            await Task.WhenAll(emailCheckTask, hashTask);

            if (emailCheckTask.Result)
            {
                return BadRequest(new { message = "Este email ya está registrado" });
            }

            var passwordHash = hashTask.Result;

            // Crear nuevo cliente
            var customer = new EcommerceCustomer
            {
                Email = dto.Email.ToLower(),
                PasswordHash = passwordHash,
                FullName = dto.FullName,
                Phone = dto.Phone,
                IsActive = true,
                EmailVerified = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.EcommerceCustomers.Add(customer);

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
                _logger.LogWarning("Intento de registro con email duplicado (race condition): {Email}", dto.Email);
                return BadRequest(new { message = "Este email ya está registrado" });
            }

            // Enviar email de bienvenida de forma no bloqueante con timeout de 8 segundos
            _ = Task.Run(async () =>
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(8));
                try
                {
                    await Task.Run(() => _emailService.SendWelcomeEmailAsync(customer.Email, customer.FullName), cts.Token);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogWarning("Timeout enviando email de bienvenida a {Email} (8s)", customer.Email);
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "No se pudo enviar email de bienvenida a {Email}", customer.Email);
                }
            });

            // Generar token JWT + Refresh Token
            var token = _tokenService.GenerateEcommerceToken(customer);
            var (refreshToken, refreshHash, refreshExpires) = _tokenService.GenerateEcommerceRefreshToken();

            customer.RefreshTokenHash = refreshHash;
            customer.RefreshTokenExpires = refreshExpires;
            await _context.SaveChangesAsync();

            var response = new EcommerceAuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                RefreshTokenExpires = refreshExpires,
                Customer = new EcommerceCustomerDto
                {
                    Id = customer.Id,
                    Email = customer.Email,
                    FullName = customer.FullName,
                    Phone = customer.Phone,
                    DocumentNumber = customer.DocumentNumber,
                    Address = customer.Address,
                    City = customer.City,
                    District = customer.District,
                    EmailVerified = customer.EmailVerified,
                    CreatedAt = customer.CreatedAt
                }
            };

            _logger.LogInformation("Nuevo cliente registrado: {Email}", customer.Email);
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
    public async Task<ActionResult<EcommerceAuthResponseDto>> Login([FromBody] EcommerceLoginDto? dto)
    {
        try
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Datos de login inválidos" });
            }

            // Validaciones
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { message = "Email y contraseña son requeridos" });
            }

            // Buscar cliente
            var customer = await _context.EcommerceCustomers
                .FirstOrDefaultAsync(c => c.Email.ToLower() == dto.Email.ToLower());

            if (customer == null)
            {
                return Unauthorized(new { message = "Email o contraseña incorrectos" });
            }

            if (!customer.IsActive)
            {
                return Unauthorized(new { message = "Esta cuenta está desactivada" });
            }

            // Verificar contraseña
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, customer.PasswordHash))
            {
                return Unauthorized(new { message = "Email o contraseña incorrectos" });
            }

            // Generar token JWT + Refresh Token
            var token = _tokenService.GenerateEcommerceToken(customer);
            var (refreshToken, refreshHash, refreshExpires) = _tokenService.GenerateEcommerceRefreshToken();

            customer.RefreshTokenHash = refreshHash;
            customer.RefreshTokenExpires = refreshExpires;
            customer.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var response = new EcommerceAuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                RefreshTokenExpires = refreshExpires,
                Customer = new EcommerceCustomerDto
                {
                    Id = customer.Id,
                    Email = customer.Email,
                    FullName = customer.FullName,
                    Phone = customer.Phone,
                    DocumentNumber = customer.DocumentNumber,
                    Address = customer.Address,
                    City = customer.City,
                    District = customer.District,
                    EmailVerified = customer.EmailVerified,
                    CreatedAt = customer.CreatedAt
                }
            };

            _logger.LogInformation("Cliente autenticado: {Email}", customer.Email);
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
    public async Task<ActionResult<EcommerceAuthResponseDto>> RefreshToken([FromBody] EcommerceRefreshTokenDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.RefreshToken))
                return BadRequest(new { message = "Refresh token inválido" });

            var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(dto.RefreshToken)));

            var customer = await _context.EcommerceCustomers
                .FirstOrDefaultAsync(c => c.RefreshTokenHash == tokenHash);

            if (customer == null)
                return Unauthorized(new { message = "Refresh token inválido" });

            if (!customer.IsActive)
                return Unauthorized(new { message = "Esta cuenta está desactivada" });

            if (customer.RefreshTokenExpires == null || customer.RefreshTokenExpires < DateTime.UtcNow)
                return Unauthorized(new { message = "Refresh token expirado, inicia sesión nuevamente" });

            // Rotación: generar nuevo refresh token (invalida el anterior)
            var newJwt = _tokenService.GenerateEcommerceToken(customer);
            var (newRefreshToken, newRefreshHash, newRefreshExpires) = _tokenService.GenerateEcommerceRefreshToken();

            customer.RefreshTokenHash = newRefreshHash;
            customer.RefreshTokenExpires = newRefreshExpires;
            customer.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var response = new EcommerceAuthResponseDto
            {
                Token = newJwt,
                RefreshToken = newRefreshToken,
                RefreshTokenExpires = newRefreshExpires,
                Customer = new EcommerceCustomerDto
                {
                    Id = customer.Id,
                    Email = customer.Email,
                    FullName = customer.FullName,
                    Phone = customer.Phone,
                    DocumentNumber = customer.DocumentNumber,
                    Address = customer.Address,
                    City = customer.City,
                    District = customer.District,
                    EmailVerified = customer.EmailVerified,
                    CreatedAt = customer.CreatedAt
                }
            };

            _logger.LogInformation("Refresh token rotado para: {Email}", customer.Email);
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
    public async Task<ActionResult> Logout()
    {
        try
        {
            var customerId = GetCustomerIdFromToken();
            if (customerId == null)
                return Unauthorized(new { message = "No autorizado" });

            var customer = await _context.EcommerceCustomers
                .FirstOrDefaultAsync(c => c.Id == customerId.Value);

            if (customer != null)
            {
                // Invalidar refresh token
                customer.RefreshTokenHash = null;
                customer.RefreshTokenExpires = null;
                customer.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("Cliente cerró sesión: {CustomerId}", customerId);
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
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest(new { message = "El email es requerido" });
            }

            var customer = await _context.EcommerceCustomers
                .FirstOrDefaultAsync(c => c.Email.ToLower() == dto.Email.ToLower());

            // Por seguridad, siempre devolvemos éxito aunque el email no exista
            if (customer == null)
            {
                return Ok(new { message = "Si el email existe, recibirás un correo con instrucciones" });
            }

            // Generar token de recuperación
            var resetToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            // SEGURIDAD: guardamos el hash SHA-256 en BD, nunca el token plano.
            // El token plano viaja solo por email al usuario. Si la BD es comprometida,
            // el atacante no puede usar los hashes para resetear contraseñas.
            var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(resetToken)));
            customer.PasswordResetToken = tokenHash;
            customer.PasswordResetExpires = DateTime.UtcNow.AddHours(1);
            customer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Enviar email con el token PLANO (no el hash)
            await _emailService.SendPasswordResetEmailAsync(customer.Email, resetToken, customer.FullName);

            _logger.LogInformation("Token de recuperación generado para: {Email}", customer.Email);
            return Ok(new { message = "Si el email existe, recibirás un correo con instrucciones" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en forgot-password");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // POST: api/ecommerce/auth/reset-password
    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Token))
            {
                return BadRequest(new { message = "Token inválido" });
            }

            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "La contraseña debe tener al menos 6 caracteres" });
            }

            // SEGURIDAD: comparar contra el hash SHA-256, nunca contra el token plano
            var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(dto.Token)));
            var customer = await _context.EcommerceCustomers
                .FirstOrDefaultAsync(c => c.PasswordResetToken == tokenHash);

            if (customer == null)
            {
                return BadRequest(new { message = "Token inválido o expirado" });
            }

            if (customer.PasswordResetExpires == null || customer.PasswordResetExpires < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Token inválido o expirado" });
            }

            // Actualizar contraseña
            customer.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            customer.PasswordResetToken = null;
            customer.PasswordResetExpires = null;
            customer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Contraseña restablecida para: {Email}", customer.Email);
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
    public async Task<ActionResult<EcommerceCustomerDto>> GetProfile()
    {
        try
        {
            var customerId = GetCustomerIdFromToken();
            if (customerId == null)
            {
                return Unauthorized(new { message = "No autorizado" });
            }

            var customer = await _context.EcommerceCustomers
                .FirstOrDefaultAsync(c => c.Id == customerId.Value);

            if (customer == null)
            {
                return NotFound(new { message = "Cliente no encontrado" });
            }

            var response = new EcommerceCustomerDto
            {
                Id = customer.Id,
                Email = customer.Email,
                FullName = customer.FullName,
                Phone = customer.Phone,
                DocumentNumber = customer.DocumentNumber,
                Address = customer.Address,
                City = customer.City,
                District = customer.District,
                EmailVerified = customer.EmailVerified,
                CreatedAt = customer.CreatedAt
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
    public async Task<ActionResult<EcommerceCustomerDto>> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        try
        {
            var customerId = GetCustomerIdFromToken();
            if (customerId == null)
            {
                return Unauthorized(new { message = "No autorizado" });
            }

            var customer = await _context.EcommerceCustomers
                .FirstOrDefaultAsync(c => c.Id == customerId.Value);

            if (customer == null)
            {
                return NotFound(new { message = "Cliente no encontrado" });
            }

            // Actualizar datos
            if (!string.IsNullOrWhiteSpace(dto.FullName))
                customer.FullName = dto.FullName;
            
            customer.Phone = dto.Phone;
            customer.DocumentNumber = dto.DocumentNumber;
            customer.Address = dto.Address;
            customer.City = dto.City;
            customer.District = dto.District;
            customer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var response = new EcommerceCustomerDto
            {
                Id = customer.Id,
                Email = customer.Email,
                FullName = customer.FullName,
                Phone = customer.Phone,
                DocumentNumber = customer.DocumentNumber,
                Address = customer.Address,
                City = customer.City,
                District = customer.District,
                EmailVerified = customer.EmailVerified,
                CreatedAt = customer.CreatedAt
            };

            _logger.LogInformation("Perfil actualizado para: {Email}", customer.Email);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error actualizando perfil");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    // POST: api/ecommerce/auth/set-cookie
    // Activa cuando tengas HTTPS + dominio propio: establece el JWT en una cookie HttpOnly.
    // En producción con SSL: Auth:UseCookieAuth = true, Auth:CookieSecure = true
    [Authorize]
    [HttpPost("set-cookie")]
    public IActionResult SetCookie()
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

    private int? GetCustomerIdFromToken()
    {
        var customerIdClaim = User.FindFirst("customerId");
        if (customerIdClaim != null && int.TryParse(customerIdClaim.Value, out var customerId))
        {
            return customerId;
        }
        return null;
    }
}
