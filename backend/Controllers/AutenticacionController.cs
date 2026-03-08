using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NobleStep.Api.DTOs;
using NobleStep.Api.Helpers;
using NobleStep.Api.Services;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AutenticacionController : ControllerBase
{
    private readonly AuthService _authService;

    public AutenticacionController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<RespuestaInicioSesionConRefrescoDto>> Login([FromBody] InicioSesionDto inicioSesionDto)
    {
        var resultado = await _authService.LoginAsync(inicioSesionDto);
        if (resultado == null)
            return Unauthorized(new { message = "Credenciales inválidas" });

        return Ok(resultado);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<RespuestaInicioSesionConRefrescoDto>> Refresh([FromBody] TokenRefrescoDto tokenRefrescoDto)
    {
        var resultado = await _authService.RefreshAsync(tokenRefrescoDto.TokenRefresco);
        if (resultado == null)
            return Unauthorized(new { message = "Refresh token inválido o expirado" });

        return Ok(resultado);
    }

    [HttpPost("revoke")]
    [Authorize]
    public async Task<ActionResult> Revoke([FromBody] TokenRefrescoDto tokenRefrescoDto)
    {
        var revocado = await _authService.RevokeAsync(tokenRefrescoDto.TokenRefresco);
        if (!revocado)
            return NotFound(new { message = "Token no encontrado" });

        return Ok(new { message = "Token revocado exitosamente" });
    }

    [HttpPost("register")]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult> Register([FromBody] RegistroDto registroDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var usuario = await _authService.RegisterAsync(registroDto);
        if (usuario == null)
            return Conflict(new { message = "El usuario ya existe" });

        return Ok(new { message = "Usuario registrado exitosamente" });
    }
}
