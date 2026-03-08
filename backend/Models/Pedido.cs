namespace NobleStep.Api.Models;

/// <summary>
/// Representa un pedido realizado a través de la tienda en línea (ecommerce).
/// Tabla: pedidos
/// </summary>
public class Pedido
{
    public int Id { get; set; }

    /// <summary>ID del cliente ecommerce (null si fue compra como invitado).</summary>
    public int? ClienteEcommerceId { get; set; }

    // Información del cliente (snapshot al momento del pedido)
    /// <summary>Nombre completo del cliente.</summary>
    public string NombreCompletoCliente { get; set; } = string.Empty;

    /// <summary>Correo electrónico del cliente.</summary>
    public string CorreoCliente { get; set; } = string.Empty;

    /// <summary>Teléfono del cliente.</summary>
    public string TelefonoCliente { get; set; } = string.Empty;

    /// <summary>Dirección de envío.</summary>
    public string DireccionCliente { get; set; } = string.Empty;

    /// <summary>Ciudad del cliente.</summary>
    public string CiudadCliente { get; set; } = string.Empty;

    /// <summary>Distrito del cliente.</summary>
    public string DistritoCliente { get; set; } = string.Empty;

    /// <summary>Referencia de la dirección.</summary>
    public string? ReferenciaCliente { get; set; }

    /// <summary>Número de documento del cliente.</summary>
    public string? DocumentoCliente { get; set; }

    // Información del pedido
    /// <summary>Número único del pedido (ej: ORD-20260206-DD13BED5).</summary>
    public string NumeroPedido { get; set; } = string.Empty;

    /// <summary>Subtotal antes de envío.</summary>
    public decimal Subtotal { get; set; }

    /// <summary>Costo de envío.</summary>
    public decimal CostoEnvio { get; set; }

    /// <summary>Total del pedido (Subtotal + CostoEnvio).</summary>
    public decimal Total { get; set; }

    // Pago
    /// <summary>Método de pago: yape, tarjeta, transferencia.</summary>
    public string MetodoPago { get; set; } = string.Empty;

    /// <summary>Detalles del pago en formato JSON.</summary>
    public string? DetallePago { get; set; }

    /// <summary>Estado del pago: Pendiente, Confirmado, Rechazado.</summary>
    public string EstadoPago { get; set; } = "Pendiente";

    /// <summary>URL del comprobante de pago subido por el cliente.</summary>
    public string? UrlComprobantePago { get; set; }

    /// <summary>Notas del administrador sobre el pedido.</summary>
    public string? NotasAdmin { get; set; }

    // Estado del pedido
    /// <summary>Estado del pedido: Pendiente, EnProceso, Enviado, Entregado, Cancelado.</summary>
    public string EstadoPedido { get; set; } = "Pendiente";

    // Facturación
    /// <summary>Tipo de comprobante: Boleta o Factura.</summary>
    public string TipoComprobante { get; set; } = "Boleta";

    /// <summary>Razón social de la empresa (para factura).</summary>
    public string? RazonSocialEmpresa { get; set; }

    /// <summary>RUC de la empresa (para factura).</summary>
    public string? RucEmpresa { get; set; }

    /// <summary>Dirección fiscal de la empresa (para factura).</summary>
    public string? DireccionEmpresa { get; set; }

    // Fechas
    /// <summary>Fecha del pedido.</summary>
    public DateTime FechaPedido { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha en que se procesó el pedido.</summary>
    public DateTime? FechaProcesado { get; set; }

    /// <summary>Fecha en que se envió el pedido.</summary>
    public DateTime? FechaEnviado { get; set; }

    /// <summary>Fecha en que se entregó el pedido.</summary>
    public DateTime? FechaEntregado { get; set; }

    /// <summary>Fecha y hora de creación del registro.</summary>
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha y hora de la última actualización.</summary>
    public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

    // Soft delete — no se elimina físicamente, se marca como eliminado
    /// <summary>Indica si el pedido fue eliminado (soft delete).</summary>
    public bool Eliminado { get; set; } = false;

    /// <summary>Fecha en que se eliminó el pedido.</summary>
    public DateTime? FechaEliminacion { get; set; }

    // Propiedades de navegación
    /// <summary>Cliente ecommerce que realizó el pedido.</summary>
    public ClienteEcommerce? ClienteEcommerce { get; set; }

    /// <summary>Detalles (líneas) del pedido.</summary>
    public ICollection<DetallePedido> DetallesPedido { get; set; } = new List<DetallePedido>();
}
