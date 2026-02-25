using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Models;

namespace NobleStep.Api.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;
    private const int RefreshTokenDays = 30;

    public AuthService(AppDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<LoginResponseWithRefreshDto?> LoginAsync(LoginDto loginDto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == loginDto.Username && u.IsActive);

        if (user == null)
            return null;

        if (!VerifyPassword(loginDto.Password, user.PasswordHash))
            return null;

        var token = _tokenService.GenerateToken(user);
        var expiration = _tokenService.GetTokenExpiration();

        // Generar refresh token y guardarlo hasheado
        var (refreshTokenPlain, refreshTokenHash) = GenerateRefreshToken();
        user.RefreshTokenHash = refreshTokenHash;
        user.RefreshTokenExpires = DateTime.UtcNow.AddDays(RefreshTokenDays);
        await _context.SaveChangesAsync();

        return new LoginResponseWithRefreshDto
        {
            Token = token,
            RefreshToken = refreshTokenPlain,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role,
            ExpiresAt = expiration,
            RefreshTokenExpiresAt = user.RefreshTokenExpires.Value
        };
    }

    public async Task<LoginResponseWithRefreshDto?> RefreshAsync(string refreshTokenPlain)
    {
        // Hashear el token recibido para comparar con el de la BD
        var tokenHash = HashRefreshToken(refreshTokenPlain);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.RefreshTokenHash == tokenHash && u.IsActive);

        if (user == null)
            return null;

        if (user.RefreshTokenExpires == null || user.RefreshTokenExpires < DateTime.UtcNow)
            return null;

        // Rotación: invalidar el token anterior, emitir uno nuevo
        var token = _tokenService.GenerateToken(user);
        var expiration = _tokenService.GetTokenExpiration();

        var (newRefreshTokenPlain, newRefreshTokenHash) = GenerateRefreshToken();
        user.RefreshTokenHash = newRefreshTokenHash;
        user.RefreshTokenExpires = DateTime.UtcNow.AddDays(RefreshTokenDays);
        await _context.SaveChangesAsync();

        return new LoginResponseWithRefreshDto
        {
            Token = token,
            RefreshToken = newRefreshTokenPlain,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role,
            ExpiresAt = expiration,
            RefreshTokenExpiresAt = user.RefreshTokenExpires.Value
        };
    }

    public async Task<bool> RevokeAsync(string refreshTokenPlain)
    {
        var tokenHash = HashRefreshToken(refreshTokenPlain);
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.RefreshTokenHash == tokenHash);

        if (user == null) return false;

        user.RefreshTokenHash = null;
        user.RefreshTokenExpires = null;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<User?> RegisterAsync(RegisterDto registerDto)
    {
        if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
            return null;

        var user = new User
        {
            Username = registerDto.Username,
            PasswordHash = HashPassword(registerDto.Password),
            FullName = registerDto.FullName,
            Email = registerDto.Email,
            Role = registerDto.Role,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;
    }

    private static (string plain, string hash) GenerateRefreshToken()
    {
        var plain = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var hash = HashRefreshToken(plain);
        return (plain, hash);
    }

    private static string HashRefreshToken(string token)
        => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private static string HashPassword(string password)
        => BCrypt.Net.BCrypt.HashPassword(password);

    private static bool VerifyPassword(string password, string hash)
    {
        try { return BCrypt.Net.BCrypt.Verify(password, hash); }
        catch { return false; }
    }
}
