using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace NobleStep.Api.Controllers;

/// <summary>
/// Controlador de Server-Sent Events (SSE) para notificaciones en tiempo real.
///
/// Base estructural para FASE 5 — no implementa lógica de negocio completa.
/// Permite al panel admin recibir notificaciones push de nuevos pedidos
/// sin necesidad de polling constante (reemplaza el polling actual del NotificationService).
///
/// Para activar completamente en el futuro:
///   1. Inyectar un canal de eventos (IEventChannel) registrado como Singleton
///   2. El canal recibe eventos desde OrdersController al crear pedidos
///   3. Este endpoint los retransmite al cliente SSE conectado
///
/// Uso desde el frontend Angular:
///   const source = new EventSource('/api/events/orders?token=JWT_TOKEN');
///   source.addEventListener('new-order', (e) => console.log(JSON.parse(e.data)));
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly ILogger<EventsController> _logger;

    public EventsController(ILogger<EventsController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Endpoint SSE para notificaciones de nuevos pedidos al panel admin.
    /// Requiere autenticación JWT (rol Administrator).
    ///
    /// GET /api/events/orders
    /// Headers: Authorization: Bearer {token}
    /// Response: text/event-stream
    /// </summary>
    [HttpGet("orders")]
    [Authorize(Roles = "Administrator")]
    public async Task StreamOrderEvents(CancellationToken cancellationToken)
    {
        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["X-Accel-Buffering"] = "no"; // Nginx: deshabilitar buffering para SSE

        _logger.LogInformation("Cliente SSE conectado: {ConnectionId}", HttpContext.Connection.Id);

        try
        {
            // Heartbeat: mantener la conexión viva enviando un comentario cada 30 segundos.
            // Los comentarios SSE (líneas con ':') son ignorados por los clientes pero
            // evitan que proxies y firewalls cierren la conexión por timeout.
            while (!cancellationToken.IsCancellationRequested)
            {
                // Enviar heartbeat como comentario SSE
                await Response.WriteAsync(": heartbeat\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);

                // Esperar 30 segundos o hasta que el cliente se desconecte
                await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
            }
        }
        catch (OperationCanceledException)
        {
            // Cliente desconectado — comportamiento esperado, no es un error
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
    [Authorize(Roles = "Administrator")]
    public async Task StreamTestEvent(CancellationToken cancellationToken)
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
