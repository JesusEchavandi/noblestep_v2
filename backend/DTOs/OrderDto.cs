namespace NobleStep.Api.DTOs;

public class CreateOrderDto
{
    // Cliente
    public string CustomerFullName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public string CustomerCity { get; set; } = string.Empty;
    public string CustomerDistrict { get; set; } = string.Empty;
    public string? CustomerReference { get; set; }
    public string? CustomerDocumentNumber { get; set; }
    
    // Pago
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentDetails { get; set; }
    public string? PaymentProofBase64 { get; set; } // Comprobante en Base64
    
    // Facturación
    public string InvoiceType { get; set; } = "Boleta";
    public string? CompanyName { get; set; }
    public string? CompanyRUC { get; set; }
    public string? CompanyAddress { get; set; }
    
    // Productos
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int ProductId { get; set; }

    /// <summary>
    /// ID de la variante (talla) seleccionada por el cliente.
    /// Si es null, se descuenta del stock legacy del producto directamente.
    /// </summary>
    public int? VariantId { get; set; }

    public int Quantity { get; set; }
    // UnitPrice eliminado: el precio siempre se calcula desde la BD en el backend.
    // El cliente NO puede enviar ni manipular el precio.
}

public class OrderResponseDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerFullName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public string CustomerCity { get; set; } = string.Empty;
    public string CustomerDistrict { get; set; } = string.Empty;
    public string? CustomerReference { get; set; }
    
    public decimal Subtotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal Total { get; set; }
    
    public string PaymentMethod { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
    public string? PaymentProofUrl { get; set; }
    public string? AdminNotes { get; set; }
    
    public string InvoiceType { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? CompanyRUC { get; set; }
    
    public DateTime OrderDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    
    public List<OrderDetailResponseDto> Items { get; set; } = new();
}

public class OrderDetailResponseDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string? ProductSize { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
}

public class UpdateOrderStatusDto
{
    public string OrderStatus { get; set; } = string.Empty;
    public string? PaymentStatus { get; set; }
    public string? AdminNotes { get; set; }
}

public class OrderFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? OrderStatus { get; set; }
    public string? PaymentStatus { get; set; }
    public string? PaymentMethod { get; set; }
    public string? SearchTerm { get; set; }
}
