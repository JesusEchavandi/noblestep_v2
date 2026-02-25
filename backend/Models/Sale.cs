namespace NobleStep.Api.Models;

public class Sale
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int UserId { get; set; }
    public DateTime SaleDate { get; set; } = DateTime.UtcNow;
    public decimal Total { get; set; }
    public string Status { get; set; } = "Completed";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    /// <summary>Username del usuario que registró la venta.</summary>
    public string? CreatedBy { get; set; }

    // Navigation properties
    public Customer Customer { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<SaleDetail> SaleDetails { get; set; } = new List<SaleDetail>();
}
