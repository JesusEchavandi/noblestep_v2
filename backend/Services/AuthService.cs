using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Models;

namespace NobleStep.Api.Services;

/// <summary>
/// Servicio de autenticación para usuarios del sistema administrativo.
/// Maneja login, registro, refresh token y revocación.
/// </summary>
public class AuthService
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;
    private const int DiasRefreshToken = 30;

    public AuthService(AppDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    /// <summary>
    /// Autentica un usuario con sus credenciales y genera tokens de acceso.
    /// </summary>
    public async Task<RespuestaInicioSesionConRefrescoDto?> LoginAsync(InicioSesionDto inicioSesionDto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.NombreUsuario == inicioSesionDto.NombreUsuario && u.Activo);

        if (usuario == null)
            return null;

        if (!VerificarContrasena(inicioSesionDto.Contrasena, usuario.HashContrasena))
            return null;

        var token = _tokenService.GenerarToken(usuario);
        var expiracion = _tokenService.ObtenerExpiracionToken();

        // Generar refresh token y guardarlo hasheado
        var (refreshTokenPlain, refreshTokenHash) = GenerarRefreshToken();
        usuario.HashTokenRefresco = refreshTokenHash;
        usuario.ExpiracionTokenRefresco = DateTime.UtcNow.AddDays(DiasRefreshToken);
        await _context.SaveChangesAsync();

        return new RespuestaInicioSesionConRefrescoDto
        {
            Token = token,
            TokenRefresco = refreshTokenPlain,
            NombreUsuario = usuario.NombreUsuario,
            NombreCompleto = usuario.NombreCompleto,
            Rol = usuario.Rol,
            ExpiraEn = expiracion,
            ExpiracionTokenRefresco = usuario.ExpiracionTokenRefresco.Value
        };
    }

    /// <summary>
    /// Renueva los tokens usando un refresh token válido (rotación de tokens).
    /// </summary>
    public async Task<RespuestaInicioSesionConRefrescoDto?> RefreshAsync(string refreshTokenPlain)
    {
        // Hashear el token recibido para comparar con el de la BD
        var tokenHash = HashearRefreshToken(refreshTokenPlain);

        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.HashTokenRefresco == tokenHash && u.Activo);

        if (usuario == null)
            return null;

        if (usuario.ExpiracionTokenRefresco == null || usuario.ExpiracionTokenRefresco < DateTime.UtcNow)
            return null;

        // Rotación: invalidar el token anterior, emitir uno nuevo
        var token = _tokenService.GenerarToken(usuario);
        var expiracion = _tokenService.ObtenerExpiracionToken();

        var (nuevoRefreshTokenPlain, nuevoRefreshTokenHash) = GenerarRefreshToken();
        usuario.HashTokenRefresco = nuevoRefreshTokenHash;
        usuario.ExpiracionTokenRefresco = DateTime.UtcNow.AddDays(DiasRefreshToken);
        await _context.SaveChangesAsync();

        return new RespuestaInicioSesionConRefrescoDto
        {
            Token = token,
            TokenRefresco = nuevoRefreshTokenPlain,
            NombreUsuario = usuario.NombreUsuario,
            NombreCompleto = usuario.NombreCompleto,
            Rol = usuario.Rol,
            ExpiraEn = expiracion,
            ExpiracionTokenRefresco = usuario.ExpiracionTokenRefresco.Value
        };
    }

    /// <summary>
    /// Revoca (invalida) un refresh token.
    /// </summary>
    public async Task<bool> RevokeAsync(string refreshTokenPlain)
    {
        var tokenHash = HashearRefreshToken(refreshTokenPlain);
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.HashTokenRefresco == tokenHash);

        if (usuario == null) return false;

        usuario.HashTokenRefresco = null;
        usuario.ExpiracionTokenRefresco = null;
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Registra un nuevo usuario en el sistema administrativo.
    /// </summary>
    public async Task<Usuario?> RegisterAsync(RegistroDto registroDto)
    {
        if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == registroDto.NombreUsuario))
            return null;

        var usuario = new Usuario
        {
            NombreUsuario = registroDto.NombreUsuario,
            HashContrasena = HashearContrasena(registroDto.Contrasena),
            NombreCompleto = registroDto.NombreCompleto,
            Correo = registroDto.Correo,
            Rol = registroDto.Rol,
            Activo = true
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return usuario;
    }

    private static (string plain, string hash) GenerarRefreshToken()
    {
        var plain = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var hash = HashearRefreshToken(plain);
        return (plain, hash);
    }

    private static string HashearRefreshToken(string token)
        => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private static string HashearContrasena(string contrasena)
        => BCrypt.Net.BCrypt.HashPassword(contrasena);

    private static bool VerificarContrasena(string contrasena, string hash)
    {
        try { return BCrypt.Net.BCrypt.Verify(contrasena, hash); }
        catch { return false; }
    }
}
