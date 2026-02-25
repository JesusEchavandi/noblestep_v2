using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.DTOs;

public class LoginDto
{
    [Required(ErrorMessage = "El usuario es requerido")]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}

public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateUserDto
{
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Employee"; // Administrator, Manager, Employee
}

public class UpdateUserDto
{
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; } // Optional - only update if provided
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class RegisterDto
{
    [Required(ErrorMessage = "El usuario es requerido")]
    [MaxLength(50, ErrorMessage = "El usuario no puede superar 50 caracteres")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
    [MaxLength(100, ErrorMessage = "La contraseña no puede superar 100 caracteres")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre completo es requerido")]
    [MaxLength(100, ErrorMessage = "El nombre no puede superar 100 caracteres")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "El formato de email no es válido")]
    [MaxLength(100, ErrorMessage = "El email no puede superar 100 caracteres")]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20, ErrorMessage = "El rol no puede superar 20 caracteres")]
    public string Role { get; set; } = "Seller";
}

public class RefreshTokenDto
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class LoginResponseWithRefreshDto
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime RefreshTokenExpiresAt { get; set; }
}
