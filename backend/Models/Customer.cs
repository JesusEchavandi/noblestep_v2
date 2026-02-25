namespace NobleStep.Api.Models;

public class Customer
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    /// <summary>Username del admin que creó el registro.</summary>
    public string? CreatedBy { get; set; }

    // Navigation property
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
}
