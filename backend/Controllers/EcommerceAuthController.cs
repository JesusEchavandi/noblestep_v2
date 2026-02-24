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

    public EcommerceAuthController(
        AppDbContext context,
        TokenService tokenService,
        IEmailService emailService,
        ILogger<EcommerceAuthController> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
        _logger = logger;
    }

    // POST: api/ecommerce/auth/register
    [HttpPost("register")]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<EcommerceAuthResponseDto>> Register([FromBody] EcommerceRegisterDto dto)
    {
        try
        {
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

            // Verificar si el email ya existe
            var existingCustomer = await _context.EcommerceCustomers
                .FirstOrDefaultAsync(c => c.Email.ToLower() == dto.Email.ToLower());

            if (existingCustomer != null)
            {
                return BadRequest(new { message = "Este email ya está registrado" });
            }

            // Crear hash de contraseña
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

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
            await _context.SaveChangesAsync();

            // Enviar email de bienvenida
            try
            {
                await _emailService.SendWelcomeEmailAsync(customer.Email, customer.FullName);
            }
            catch (Exception emailEx)
            {
                _logger.LogWarning(emailEx, "No se pudo enviar email de bienvenida a {Email}", customer.Email);
            }

            // Generar token JWT
            var token = _tokenService.GenerateEcommerceToken(customer);

            var response = new EcommerceAuthResponseDto
            {
                Token = token,
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
    public async Task<ActionResult<EcommerceAuthResponseDto>> Login([FromBody] EcommerceLoginDto dto)
    {
        try
        {
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

            // Generar token JWT
            var token = _tokenService.GenerateEcommerceToken(customer);

            var response = new EcommerceAuthResponseDto
            {
                Token = token,
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
