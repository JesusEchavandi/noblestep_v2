using System.Net;
using System.Net.Mail;
using NobleStep.Api.DTOs;

namespace NobleStep.Api.Services;

public interface IServicioCorreo
{
    Task EnviarCorreoRestablecimientoAsync(string correoDestino, string tokenRestablecimiento, string nombreCliente);
    Task EnviarCorreoConfirmacionPedidoAsync(string correoDestino, string numeroPedido, string nombreCliente, decimal total, List<RespuestaDetallePedidoDto> items);
    Task EnviarCorreoActualizacionEstadoPedidoAsync(string correoDestino, string numeroPedido, string nombreCliente, string nuevoEstado);
    Task EnviarCorreoBienvenidaAsync(string correoDestino, string nombreCliente);
}

public class ServicioCorreo : IServicioCorreo
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<ServicioCorreo> _logger;

    public ServicioCorreo(IConfiguration configuration, ILogger<ServicioCorreo> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task EnviarCorreoRestablecimientoAsync(string correoDestino, string tokenRestablecimiento, string nombreCliente)
    {
        try
        {
            var fromEmail = _configuration["Email:FromEmail"] ?? "noblestep@gmail.com";
            var fromName = _configuration["Email:FromName"] ?? "NobleStep Shop";
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUsername = _configuration["Email:SmtpUsername"] ?? fromEmail;
            var smtpPassword = _configuration["Email:SmtpPassword"] ?? "";
            
            var resetLink = $"{_configuration["App:FrontendUrl"]}/reset-password?token={tokenRestablecimiento}";

            var subject = "Restablecer tu contraseña - NobleStep";
            var body = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; }}
                        .content {{ padding: 20px; background-color: #f9f9f9; }}
                        .button {{ display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                        .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>NobleStep Shop</h1>
                        </div>
                        <div class='content'>
                            <h2>Hola {nombreCliente},</h2>
                            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                            <div style='text-align: center;'>
                                <a href='{resetLink}' class='button'>Restablecer Contraseña</a>
                            </div>
                            <p>O copia y pega este enlace en tu navegador:</p>
                            <p style='word-break: break-all; color: #2563eb;'>{resetLink}</p>
                            <p><strong>Este enlace expirará en 1 hora.</strong></p>
                            <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
                        </div>
                        <div class='footer'>
                            <p>&copy; 2025 NobleStep. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await EnviarCorreoAsync(fromEmail, fromName, correoDestino, subject, body, smtpHost, smtpPort, smtpUsername, smtpPassword);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enviando email de recuperación de contraseña a {Email}", correoDestino);
            throw;
        }
    }

    public async Task EnviarCorreoConfirmacionPedidoAsync(string correoDestino, string numeroPedido, string nombreCliente, decimal total, List<RespuestaDetallePedidoDto> items)
    {
        try
        {
            var fromEmail = _configuration["Email:FromEmail"] ?? "noblestep@gmail.com";
            var fromName = _configuration["Email:FromName"] ?? "NobleStep Shop";
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUsername = _configuration["Email:SmtpUsername"] ?? fromEmail;
            var smtpPassword = _configuration["Email:SmtpPassword"] ?? "";

            var itemsHtml = string.Join("", items.Select(item => $@"
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{item.NombreProducto} {(item.TallaProducto != null ? $"(Talla: {item.TallaProducto})" : "")}</td>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: center;'>{item.Cantidad}</td>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: right;'>S/ {item.PrecioUnitario:F2}</td>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: right;'><strong>S/ {item.Subtotal:F2}</strong></td>
                </tr>
            "));

            var subject = $"✅ Confirmación de Pedido #{numeroPedido} - NobleStep";
            var body = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }}
                        .container {{ max-width: 600px; margin: 20px auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }}
                        .header {{ background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; }}
                        .header h1 {{ margin: 0; font-size: 28px; }}
                        .content {{ padding: 30px; }}
                        .order-number {{ background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 5px; }}
                        .order-number h3 {{ margin: 0 0 5px 0; color: #2563eb; }}
                        .products-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                        .products-table th {{ background-color: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; color: #374151; }}
                        .total-section {{ background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                        .total-row {{ display: flex; justify-content: space-between; margin: 8px 0; }}
                        .total-amount {{ font-size: 24px; font-weight: bold; color: #2563eb; }}
                        .button {{ display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }}
                        .info-box {{ background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }}
                        .footer {{ padding: 20px; text-align: center; background-color: #f9fafb; color: #6b7280; font-size: 13px; }}
                        .checkmark {{ font-size: 48px; color: #10b981; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <div class='checkmark'>✓</div>
                            <h1>¡Pedido Confirmado!</h1>
                            <p style='margin: 10px 0 0 0; opacity: 0.9;'>NobleStep Shop</p>
                        </div>
                        <div class='content'>
                            <h2 style='color: #1f2937;'>¡Gracias por tu compra, {nombreCliente}!</h2>
                            <p>Hemos recibido tu pedido exitosamente y estamos preparándolo con mucho cuidado.</p>
                            
                            <div class='order-number'>
                                <h3>Número de Pedido</h3>
                                <p style='margin: 0; font-size: 24px; font-weight: bold; color: #2563eb;'>#{numeroPedido}</p>
                            </div>

                            <h3 style='color: #1f2937; margin-top: 30px;'>Resumen de tu pedido</h3>
                            <table class='products-table'>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th style='text-align: center;'>Cantidad</th>
                                        <th style='text-align: right;'>Precio Unit.</th>
                                        <th style='text-align: right;'>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsHtml}
                                </tbody>
                            </table>

                            <div class='total-section'>
                                <div class='total-row'>
                                    <span style='font-size: 18px; font-weight: 600;'>Total a pagar:</span>
                                    <span class='total-amount'>S/ {total:F2}</span>
                                </div>
                            </div>

                            <div class='info-box'>
                                <strong>📦 ¿Qué sigue?</strong>
                                <ul style='margin: 10px 0 0 0; padding-left: 20px;'>
                                    <li>Verificaremos tu pago en las próximas horas</li>
                                    <li>Prepararemos tu pedido con cuidado</li>
                                    <li>Te enviaremos actualizaciones por email</li>
                                    <li>Recibirás tu pedido en 2-5 días hábiles</li>
                                </ul>
                            </div>

                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{_configuration["App:FrontendUrl"]}/account' class='button'>Ver mi pedido</a>
                            </div>

                            <p style='color: #6b7280; font-size: 14px; margin-top: 30px;'>
                                Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos respondiendo este correo.
                            </p>
                        </div>
                        <div class='footer'>
                            <p style='margin: 5px 0;'><strong>NobleStep Shop</strong></p>
                            <p style='margin: 5px 0;'>Calzado de calidad para toda ocasión</p>
                            <p style='margin: 15px 0 5px 0;'>&copy; 2025 NobleStep. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await EnviarCorreoAsync(fromEmail, fromName, correoDestino, subject, body, smtpHost, smtpPort, smtpUsername, smtpPassword);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enviando email de confirmación de pedido a {Email}", correoDestino);
            // No lanzar excepción para no bloquear la creación del pedido
        }
    }

    public async Task EnviarCorreoActualizacionEstadoPedidoAsync(string correoDestino, string numeroPedido, string nombreCliente, string nuevoEstado)
    {
        try
        {
            var fromEmail = _configuration["Email:FromEmail"] ?? "noblestep@gmail.com";
            var fromName = _configuration["Email:FromName"] ?? "NobleStep Shop";
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUsername = _configuration["Email:SmtpUsername"] ?? fromEmail;
            var smtpPassword = _configuration["Email:SmtpPassword"] ?? "";

            var statusMessages = new Dictionary<string, (string icon, string title, string message, string color)>
            {
                { "Pendiente", ("⏳", "Pedido Recibido", "Hemos recibido tu pedido y estamos verificando el pago.", "#f59e0b") },
                { "Procesando", ("📦", "Preparando tu Pedido", "Tu pago ha sido confirmado y estamos preparando tu pedido.", "#3b82f6") },
                { "Enviado", ("🚚", "Pedido en Camino", "¡Tu pedido está en camino! Pronto lo tendrás contigo.", "#8b5cf6") },
                { "Entregado", ("✅", "Pedido Entregado", "¡Tu pedido ha sido entregado exitosamente!", "#10b981") },
                { "Cancelado", ("❌", "Pedido Cancelado", "Tu pedido ha sido cancelado.", "#ef4444") }
            };

            var (icon, title, message, color) = statusMessages.GetValueOrDefault(nuevoEstado, ("📋", "Actualización de Pedido", "El estado de tu pedido ha cambiado.", "#6b7280"));

            var subject = $"{icon} Actualización de Pedido #{numeroPedido} - NobleStep";
            var body = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }}
                        .container {{ max-width: 600px; margin: 20px auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }}
                        .header {{ background-color: {color}; color: white; padding: 30px 20px; text-align: center; }}
                        .header h1 {{ margin: 0; font-size: 24px; }}
                        .content {{ padding: 30px; }}
                        .status-icon {{ font-size: 64px; text-align: center; margin: 20px 0; }}
                        .order-box {{ background-color: #f0f9ff; border-left: 4px solid {color}; padding: 15px; margin: 20px 0; border-radius: 5px; }}
                        .button {{ display: inline-block; padding: 14px 28px; background-color: {color}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }}
                        .footer {{ padding: 20px; text-align: center; background-color: #f9fafb; color: #6b7280; font-size: 13px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>{title}</h1>
                        </div>
                        <div class='content'>
                            <div class='status-icon'>{icon}</div>
                            <h2 style='text-align: center; color: #1f2937;'>Hola {nombreCliente},</h2>
                            <p style='text-align: center; font-size: 16px;'>{message}</p>
                            
                            <div class='order-box'>
                                <p style='margin: 0;'><strong>Número de Pedido:</strong> #{numeroPedido}</p>
                                <p style='margin: 10px 0 0 0;'><strong>Nuevo Estado:</strong> <span style='color: {color}; font-weight: 600;'>{nuevoEstado}</span></p>
                            </div>

                            <div style='text-align: center;'>
                                <a href='{_configuration["App:FrontendUrl"]}/account' class='button'>Ver detalles del pedido</a>
                            </div>

                            <p style='color: #6b7280; text-align: center; margin-top: 30px;'>
                                Gracias por confiar en NobleStep Shop
                            </p>
                        </div>
                        <div class='footer'>
                            <p>&copy; 2025 NobleStep. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await EnviarCorreoAsync(fromEmail, fromName, correoDestino, subject, body, smtpHost, smtpPort, smtpUsername, smtpPassword);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enviando email de actualización de estado a {Email}", correoDestino);
        }
    }

    public async Task EnviarCorreoBienvenidaAsync(string correoDestino, string nombreCliente)
    {
        try
        {
            var fromEmail = _configuration["Email:FromEmail"] ?? "noblestep@gmail.com";
            var fromName = _configuration["Email:FromName"] ?? "NobleStep Shop";
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUsername = _configuration["Email:SmtpUsername"] ?? fromEmail;
            var smtpPassword = _configuration["Email:SmtpPassword"] ?? "";

            var subject = "🎉 ¡Bienvenido a NobleStep Shop!";
            var body = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }}
                        .container {{ max-width: 600px; margin: 20px auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }}
                        .header {{ background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 40px 20px; text-align: center; }}
                        .content {{ padding: 30px; }}
                        .feature-box {{ display: inline-block; width: 45%; margin: 10px 2%; padding: 15px; background-color: #f9fafb; border-radius: 8px; text-align: center; }}
                        .button {{ display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }}
                        .footer {{ padding: 20px; text-align: center; background-color: #f9fafb; color: #6b7280; font-size: 13px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1 style='font-size: 32px; margin: 0;'>¡Bienvenido a NobleStep!</h1>
                            <p style='margin: 10px 0 0 0; opacity: 0.9;'>El calzado perfecto para cada paso</p>
                        </div>
                        <div class='content'>
                            <h2 style='color: #1f2937;'>Hola {nombreCliente},</h2>
                            <p>¡Nos encanta tenerte aquí! Gracias por crear tu cuenta en NobleStep Shop.</p>
                            <p>Estamos comprometidos en ofrecerte la mejor experiencia de compra con calzado de alta calidad.</p>

                            <h3 style='color: #1f2937; margin-top: 30px; text-align: center;'>¿Qué puedes hacer ahora?</h3>
                            <div style='text-align: center; margin: 20px 0;'>
                                <div class='feature-box'>
                                    <div style='font-size: 36px;'>👟</div>
                                    <strong>Explorar Catálogo</strong>
                                    <p style='font-size: 13px; margin: 5px 0 0 0;'>Descubre nuestra colección</p>
                                </div>
                                <div class='feature-box'>
                                    <div style='font-size: 36px;'>🎁</div>
                                    <strong>Ofertas Especiales</strong>
                                    <p style='font-size: 13px; margin: 5px 0 0 0;'>Aprovecha descuentos</p>
                                </div>
                                <div class='feature-box'>
                                    <div style='font-size: 36px;'>🚚</div>
                                    <strong>Envío Gratis</strong>
                                    <p style='font-size: 13px; margin: 5px 0 0 0;'>En compras +S/100</p>
                                </div>
                                <div class='feature-box'>
                                    <div style='font-size: 36px;'>⭐</div>
                                    <strong>Calidad Premium</strong>
                                    <p style='font-size: 13px; margin: 5px 0 0 0;'>Garantía de satisfacción</p>
                                </div>
                            </div>

                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{_configuration["App:FrontendUrl"]}/catalog' class='button'>Explorar Productos</a>
                            </div>

                            <p style='color: #6b7280; text-align: center; margin-top: 30px;'>
                                Si tienes alguna pregunta, nuestro equipo está listo para ayudarte.
                            </p>
                        </div>
                        <div class='footer'>
                            <p style='margin: 5px 0;'><strong>NobleStep Shop</strong></p>
                            <p style='margin: 15px 0 5px 0;'>&copy; 2025 NobleStep. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await EnviarCorreoAsync(fromEmail, fromName, correoDestino, subject, body, smtpHost, smtpPort, smtpUsername, smtpPassword);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enviando email de bienvenida a {Email}", correoDestino);
        }
    }

    private async Task EnviarCorreoAsync(string fromEmail, string fromName, string correoDestino, string subject, string body, 
        string smtpHost, int smtpPort, string smtpUsername, string smtpPassword)
    {
        using var message = new MailMessage();
        message.From = new MailAddress(fromEmail, fromName);
        message.To.Add(new MailAddress(correoDestino));
        message.Subject = subject;
        message.Body = body;
        message.IsBodyHtml = true;

        using var smtpClient = new SmtpClient(smtpHost, smtpPort);
        smtpClient.Credentials = new NetworkCredential(smtpUsername, smtpPassword);
        smtpClient.EnableSsl = true;
        var timeoutSeconds = int.TryParse(_configuration["Email:SmtpTimeoutSeconds"], out var seconds) ? seconds : 10;
        smtpClient.Timeout = Math.Max(1, timeoutSeconds) * 1000;

        await smtpClient.SendMailAsync(message);
        _logger.LogInformation("Email enviado exitosamente a {Email}", correoDestino);
    }
}
