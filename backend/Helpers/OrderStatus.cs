namespace NobleStep.Api.Helpers;

/// <summary>
/// Constantes de estado para pedidos del ecommerce.
/// Centraliza los strings de estado para evitar errores tipográficos.
/// </summary>
public static class EstadoPedido
{
    public const string Pendiente = "Pendiente";
    public const string EnProceso = "EnProceso";
    public const string Enviado = "Enviado";
    public const string Entregado = "Entregado";
    public const string Cancelado = "Cancelado";
    public const string Reembolsado = "Reembolsado";
}

/// <summary>
/// Constantes de estado de pago.
/// </summary>
public static class EstadoPago
{
    public const string Pendiente = "Pendiente";
    public const string Pagado = "Pagado";
    public const string Fallido = "Fallido";
    public const string Reembolsado = "Reembolsado";
}

/// <summary>
/// Constantes de roles de usuario del sistema administrativo.
/// </summary>
public static class RolesUsuario
{
    public const string Administrador = "Administrador";
    public const string Vendedor = "Vendedor";
}
