namespace NobleStep.Api.Helpers;

/// <summary>
/// Constantes de estado para órdenes del ecommerce.
/// Centraliza los strings de estado para evitar errores tipográficos.
/// </summary>
public static class OrderStatus
{
    public const string Pending = "Pending";
    public const string Processing = "Processing";
    public const string Shipped = "Shipped";
    public const string Delivered = "Delivered";
    public const string Cancelled = "Cancelled";
    public const string Refunded = "Refunded";
}

/// <summary>
/// Constantes de estado de pago.
/// </summary>
public static class PaymentStatus
{
    public const string Pending = "Pending";
    public const string Paid = "Paid";
    public const string Failed = "Failed";
    public const string Refunded = "Refunded";
}

/// <summary>
/// Constantes de roles de usuario.
/// </summary>
public static class UserRoles
{
    public const string Administrator = "Administrator";
    public const string Seller = "Seller";
}
