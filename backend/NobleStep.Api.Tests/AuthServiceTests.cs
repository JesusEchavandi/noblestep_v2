using FluentAssertions;
using Microsoft.Extensions.Options;
using NobleStep.Api.DTOs;
using NobleStep.Api.Helpers;
using NobleStep.Api.Services;
using NobleStep.Api.Tests.Helpers;

namespace NobleStep.Api.Tests;

/// <summary>
/// Tests para el flujo de autenticación: login, contraseña incorrecta, usuario inactivo, registro duplicado.
/// </summary>
public class AuthServiceTests
{
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var context = TestDbContextFactory.CreateWithSeedData();
        var jwtSettings = Options.Create(new JwtSettings
        {
            SecretKey = "TestSecretKeyAtLeast32CharactersLong!!",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            ExpirationMinutes = 60
        });
        var tokenService = new TokenService(jwtSettings);
        _authService = new AuthService(context, tokenService);
    }

    [Fact]
    public async Task Login_ConCredencialesCorrectas_RetornaTokens()
    {
        // Arrange
        var loginDto = new InicioSesionDto
        {
            NombreUsuario = "admin_test",
            Contrasena = "Admin123!"
        };

        // Act
        var resultado = await _authService.LoginAsync(loginDto);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Token.Should().NotBeNullOrEmpty();
        resultado.TokenRefresco.Should().NotBeNullOrEmpty();
        resultado.NombreUsuario.Should().Be("admin_test");
        resultado.Rol.Should().Be("Administrador");
    }

    [Fact]
    public async Task Login_ConContrasenaIncorrecta_RetornaNull()
    {
        // Arrange
        var loginDto = new InicioSesionDto
        {
            NombreUsuario = "admin",
            Contrasena = "ContraseñaMala"
        };

        // Act
        var resultado = await _authService.LoginAsync(loginDto);

        // Assert
        resultado.Should().BeNull();
    }

    [Fact]
    public async Task Login_ConUsuarioInexistente_RetornaNull()
    {
        // Arrange
        var loginDto = new InicioSesionDto
        {
            NombreUsuario = "noExiste",
            Contrasena = "loquesea"
        };

        // Act
        var resultado = await _authService.LoginAsync(loginDto);

        // Assert
        resultado.Should().BeNull();
    }

    [Fact]
    public async Task Registro_ConUsuarioDuplicado_RetornaNull()
    {
        // Arrange — "admin_test" ya existe en seed
        var registroDto = new RegistroDto
        {
            NombreUsuario = "admin_test",
            Contrasena = "Otra123!",
            NombreCompleto = "Duplicado",
            Correo = "dup@test.com",
            Rol = "Vendedor"
        };

        // Act
        var resultado = await _authService.RegisterAsync(registroDto);

        // Assert
        resultado.Should().BeNull();
    }

    [Fact]
    public async Task Registro_ConDatosValidos_CreaUsuario()
    {
        // Arrange
        var registroDto = new RegistroDto
        {
            NombreUsuario = "nuevovendedor",
            Contrasena = "Segura123!",
            NombreCompleto = "Nuevo Vendedor",
            Correo = "nuevo@test.com",
            Rol = "Vendedor"
        };

        // Act
        var resultado = await _authService.RegisterAsync(registroDto);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.NombreUsuario.Should().Be("nuevovendedor");
        resultado.NombreCompleto.Should().Be("Nuevo Vendedor");
        resultado.Activo.Should().BeTrue();
    }

    [Fact]
    public async Task Refresh_ConTokenInvalido_RetornaNull()
    {
        // Act
        var resultado = await _authService.RefreshAsync("tokenFalsoInvalido");

        // Assert
        resultado.Should().BeNull();
    }

    [Fact]
    public async Task Login_LuegoRefresh_RetornaNuevosTokens()
    {
        // Arrange — login primero para obtener refresh token
        var loginDto = new InicioSesionDto { NombreUsuario = "vendedor_test", Contrasena = "Vendedor123!" };
        var loginResult = await _authService.LoginAsync(loginDto);
        loginResult.Should().NotBeNull();

        // Act — refresh con el token obtenido
        var refreshResult = await _authService.RefreshAsync(loginResult!.TokenRefresco);

        // Assert
        refreshResult.Should().NotBeNull();
        refreshResult!.Token.Should().NotBeNullOrEmpty();
        refreshResult.TokenRefresco.Should().NotBe(loginResult.TokenRefresco, "el token de refresco debe rotar");
    }
}
