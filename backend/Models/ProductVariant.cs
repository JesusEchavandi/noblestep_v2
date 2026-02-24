using System.ComponentModel.DataAnnotations;

namespace NobleStep.Api.Models;

public class ProductVariant
{
    public int Id { get; set; }
    public int ProductId { get; set; }

    /// <summary>Talla del calzado: "38", "39", "40", "41", "42", "43", "44"</summary>
    public string Size { get; set; } = string.Empty;

    [ConcurrencyCheck]
    public int Stock { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Product Product { get; set; } = null!;
}
