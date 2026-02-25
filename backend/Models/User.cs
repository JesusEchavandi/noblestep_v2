namespace NobleStep.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Seller"; // Administrator or Seller
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    /// <summary>Username del admin que creó este usuario.</summary>
    public string? CreatedBy { get; set; }

    // Refresh Token
    public string? RefreshTokenHash { get; set; }
    public DateTime? RefreshTokenExpires { get; set; }
}
