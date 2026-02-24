using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string Size { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal SalePrice { get; set; } = 0;
    [ConcurrencyCheck]
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Category Category { get; set; } = null!;
    public ICollection<SaleDetail> SaleDetails { get; set; } = new List<SaleDetail>();
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
}
