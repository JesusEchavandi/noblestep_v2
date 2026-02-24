using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NobleStep.Api.Models;

public class PurchaseDetail
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int PurchaseId { get; set; }

    [Required]
    public int ProductId { get; set; }

    /// <summary>Variante (talla) a la que se suma el stock. Null = producto sin variantes.</summary>
    public int? VariantId { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitCost { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }

    // Navigation properties
    [ForeignKey("PurchaseId")]
    public Purchase Purchase { get; set; } = null!;

    [ForeignKey("ProductId")]
    public Product Product { get; set; } = null!;

    [ForeignKey("VariantId")]
    public ProductVariant? Variant { get; set; }
}
