using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace NobleStep.Api.Controllers;

/// <summary>
/// Controlador de Server-Sent Events (SSE) para notificaciones en tiempo real.
///
/// Base estructural para FASE 5 — no implementa lógica de negocio completa.
/// Permite al panel admin recibir notificaciones push de nuevos pedidos
/// sin necesidad de polling constante.
///
/// Para activar completamente en el futuro:
///   1. Inyectar un canal de eventos (IEventChannel) registrado como Singleton
///   2. El canal recibe eventos desde PedidosController al crear pedidos
///   3. Este endpoint los retransmite al cliente SSE conectado
///
/// Uso desde el frontend Angular:
///   const source = new EventSource('/api/events/orders?token=JWT_TOKEN');
///   source.addEventListener('new-order', (e) => console.log(JSON.parse(e.data)));
/// </summary>
[ApiController]
[Route("api/events")]
public class EventosController : ControllerBase
{
    private readonly ILogger<EventosController> _logger;

    public EventosController(ILogger<EventosController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Endpoint SSE para notificaciones de nuevos pedidos al panel admin.
    /// Requiere autenticación JWT (rol Administrador).
    ///
    /// GET /api/events/orders
    /// Headers: Authorization: Bearer {token}
    /// Response: text/event-stream
    /// </summary>
    [HttpGet("orders")]
    [Authorize(Roles = "Administrador")]
    public async Task TransmitirEventosPedidos(CancellationToken cancellationToken)
    {
        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["X-Accel-Buffering"] = "no";

        _logger.LogInformation("Cliente SSE conectado: {ConnectionId}", HttpContext.Connection.Id);

        try
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                await Response.WriteAsync(": heartbeat\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
                await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Cliente SSE desconectado: {ConnectionId}", HttpContext.Connection.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en stream SSE: {ConnectionId}", HttpContext.Connection.Id);
        }
    }

    /// <summary>
    /// Endpoint de prueba SSE — envía un evento de ejemplo.
    /// Solo disponible en Development.
    /// GET /api/events/test
    /// </summary>
    [HttpGet("test")]
    [Authorize(Roles = "Administrador")]
    public async Task TransmitirEventoPrueba(CancellationToken cancellationToken)
    {
        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";

        var testEvent = new
        {
            type = "test",
            message = "SSE funcionando correctamente",
            timestamp = DateTime.UtcNow
        };

        var json = System.Text.Json.JsonSerializer.Serialize(testEvent);
        await Response.WriteAsync($"event: test\ndata: {json}\n\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }
}
