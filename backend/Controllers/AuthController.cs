using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using NobleStep.Api.DTOs;
using NobleStep.Api.Services;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto);

        if (result == null)
            return Unauthorized(new { message = "Invalid username or password" });

        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
            return BadRequest(new { message = "Refresh token requerido" });

        var result = await _authService.RefreshAsync(dto.RefreshToken);

        if (result == null)
            return Unauthorized(new { message = "Refresh token inválido o expirado" });

        return Ok(result);
    }

    [HttpPost("revoke")]
    [Authorize]
    public async Task<IActionResult> Revoke([FromBody] RefreshTokenDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
            return BadRequest(new { message = "Refresh token requerido" });

        await _authService.RevokeAsync(dto.RefreshToken);
        return Ok(new { message = "Sesión cerrada exitosamente" });
    }

    [HttpPost("register")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var user = await _authService.RegisterAsync(registerDto);

        if (user == null)
            return BadRequest(new { message = "Username already exists" });

        return Ok(new { message = "User registered successfully", userId = user.Id });
    }
}
