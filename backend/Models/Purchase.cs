using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NobleStep.Api.Models;

public class Purchase
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int SupplierId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(50)]
    public string InvoiceNumber { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Total { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Completed"; // Completed, Pending, Cancelled

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Esta propiedad no está en la BD pero se usa en el controlador
    public string? Notes { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey("SupplierId")]
    public Supplier Supplier { get; set; } = null!;

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    public ICollection<PurchaseDetail> Details { get; set; } = new List<PurchaseDetail>();
}
