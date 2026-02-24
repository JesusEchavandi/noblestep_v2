using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Models;

namespace NobleStep.Api.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;

    public AuthService(AppDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == loginDto.Username && u.IsActive);

        if (user == null)
            return null;

        // Verify password (using BCrypt in production)
        if (!VerifyPassword(loginDto.Password, user.PasswordHash))
            return null;

        var token = _tokenService.GenerateToken(user);
        var expiration = _tokenService.GetTokenExpiration();

        return new LoginResponseDto
        {
            Token = token,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role,
            ExpiresAt = expiration
        };
    }

    public async Task<User?> RegisterAsync(RegisterDto registerDto)
    {
        // Check if username already exists
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

    private string HashPassword(string password)
    {
        // Simple hash for demo - in production use BCrypt.Net
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private bool VerifyPassword(string password, string hash)
    {
        // Use BCrypt verification only - no plaintext fallback
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch
        {
            return false;
        }
    }
}
