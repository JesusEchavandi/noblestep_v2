using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NobleStep.Api.Helpers;
using NobleStep.Api.Models;

namespace NobleStep.Api.Services;

/// <summary>
/// Servicio para generación y gestión de tokens JWT.
/// </summary>
public class TokenService
{
    private readonly JwtSettings _jwtSettings;

    public TokenService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
    }

    /// <summary>
    /// Genera un token JWT para un usuario del sistema administrativo.
    /// </summary>
    public string GenerarToken(Usuario usuario)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.NombreUsuario),
            new Claim(ClaimTypes.Email, usuario.Correo),
            new Claim(ClaimTypes.Role, usuario.Rol),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Genera un token JWT para clientes del ecommerce.
    /// Usa la misma clave y configuración que los tokens de admin (JwtSettings),
    /// garantizando que el middleware de autenticación los valide correctamente.
    /// </summary>
    public string GenerarTokenEcommerce(ClienteEcommerce cliente)
    {
        var claims = new[]
        {
            new Claim("customerId", cliente.Id.ToString()),
            new Claim(ClaimTypes.Email, cliente.Correo),
            new Claim(ClaimTypes.Name, cliente.NombreCompleto),
            new Claim("type", "ecommerce"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Obtiene la fecha de expiración del token según la configuración.
    /// </summary>
    public DateTime ObtenerExpiracionToken()
    {
        return DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);
    }

    /// <summary>
    /// Genera un refresh token seguro (token plano para el cliente + hash SHA256 para la BD).
    /// </summary>
    public (string token, string hash, DateTime expiracion) GenerarRefreshTokenEcommerce()
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
        var expiracion = DateTime.UtcNow.AddDays(30);
        return (token, hash, expiracion);
    }
}
