using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NobleStep.Api.Data;
using NobleStep.Api.Helpers;
using NobleStep.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Variables de entorno (sobreescriben appsettings en producción) ────────────
// En producción, configurar estas variables de entorno en el servidor/VPS:
//   NOBLESTEP_DB_CONNECTION   → cadena de conexión MySQL completa
//   NOBLESTEP_JWT_SECRET      → clave secreta JWT (mínimo 32 caracteres)
//   NOBLESTEP_SMTP_PASSWORD   → contraseña de app Gmail
//   NOBLESTEP_API_TOKEN       → token de ApiConsulta.pe
//   NOBLESTEP_FRONTEND_URL    → URL del frontend ecommerce (ej: https://tudominio.com)
//   NOBLESTEP_CORS_ORIGINS    → dominios permitidos separados por coma
var isDev = builder.Environment.IsDevelopment();

// Sobreescribir cadena de conexión si existe la variable de entorno
var envDbConnection = Environment.GetEnvironmentVariable("NOBLESTEP_DB_CONNECTION");
if (!string.IsNullOrWhiteSpace(envDbConnection))
    builder.Configuration["ConnectionStrings:DefaultConnection"] = envDbConnection;

// Sobreescribir JWT SecretKey
var envJwtSecret = Environment.GetEnvironmentVariable("NOBLESTEP_JWT_SECRET");
if (!string.IsNullOrWhiteSpace(envJwtSecret))
    builder.Configuration["JwtSettings:SecretKey"] = envJwtSecret;

// Sobreescribir SMTP Password
var envSmtpPassword = Environment.GetEnvironmentVariable("NOBLESTEP_SMTP_PASSWORD");
if (!string.IsNullOrWhiteSpace(envSmtpPassword))
    builder.Configuration["Email:SmtpPassword"] = envSmtpPassword;

// Sobreescribir token de ApiConsulta
var envApiToken = Environment.GetEnvironmentVariable("NOBLESTEP_API_TOKEN");
if (!string.IsNullOrWhiteSpace(envApiToken))
    builder.Configuration["ApiConsulta:Token"] = envApiToken;

// Sobreescribir FrontendUrl
var envFrontendUrl = Environment.GetEnvironmentVariable("NOBLESTEP_FRONTEND_URL");
if (!string.IsNullOrWhiteSpace(envFrontendUrl))
    builder.Configuration["App:FrontendUrl"] = envFrontendUrl;

// Sobreescribir CORS origins
var envCorsOrigins = Environment.GetEnvironmentVariable("NOBLESTEP_CORS_ORIGINS");
if (!string.IsNullOrWhiteSpace(envCorsOrigins))
    builder.Configuration["Cors:AllowedOrigins"] = envCorsOrigins;

// ── Validar secretos críticos en producción ───────────────────────────────────
if (!isDev)
{
    var jwtSecretCheck = builder.Configuration["JwtSettings:SecretKey"];
    if (string.IsNullOrWhiteSpace(jwtSecretCheck) || jwtSecretCheck.Length < 32)
        throw new InvalidOperationException("NOBLESTEP_JWT_SECRET debe tener al menos 32 caracteres en producción.");

    var dbCheck = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(dbCheck))
        throw new InvalidOperationException("NOBLESTEP_DB_CONNECTION no está configurado en producción.");
}

// Configurar zona horaria peruana
Environment.SetEnvironmentVariable("TZ", "America/Lima");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpClient("DniApi", client =>
{
    client.BaseAddress = new Uri("https://api.apiconsulta.pe/");
    client.Timeout = TimeSpan.FromSeconds(10);
});

// Configure Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Configure JWT Settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
var key = Encoding.UTF8.GetBytes(jwtSettings!.SecretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Rate Limiting — protección contra brute force y abuso de endpoints
builder.Services.AddRateLimiter(options =>
{
    // Login admin: 5 intentos por minuto por IP
    options.AddFixedWindowLimiter("login", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
    // Forgot password: 3 intentos cada 5 minutos por IP
    options.AddFixedWindowLimiter("forgot-password", opt =>
    {
        opt.PermitLimit = 3;
        opt.Window = TimeSpan.FromMinutes(5);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
    // Crear pedido: 10 por minuto por IP
    options.AddFixedWindowLimiter("create-order", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
    // Catálogo público: 60 por minuto por IP
    options.AddFixedWindowLimiter("catalog", opt =>
    {
        opt.PermitLimit = 60;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
    options.RejectionStatusCode = 429;
});

// Register Services
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        if (isDev)
        {
            // Development: permitir localhost en cualquier puerto
            policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrEmpty(origin)) return false;
                var uri = new Uri(origin);
                return uri.Host == "localhost" || uri.Host == "127.0.0.1";
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
        }
        else
        {
            // Producción: solo dominios explícitos definidos en NOBLESTEP_CORS_ORIGINS
            // Ejemplo: "https://noblestep.com,https://admin.noblestep.com"
            var allowedOriginsRaw = builder.Configuration["Cors:AllowedOrigins"] ?? "";
            var allowedOrigins = allowedOriginsRaw
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(o => !string.IsNullOrWhiteSpace(o))
                .ToArray();

            if (allowedOrigins.Length == 0)
                throw new InvalidOperationException("NOBLESTEP_CORS_ORIGINS no está configurado en producción.");

            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
        }
    });
});

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "NobleStep API",
        Version = "v1",
        Description = "API del Sistema de Gestión de Ventas de Calzado",
        Contact = new OpenApiContact
        {
            Name = "NobleStep",
            Email = "support@noblestep.com"
        }
    });

    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Encabezado de autorización JWT usando el esquema Bearer. Ingrese 'Bearer' [espacio] y luego su token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ── Middleware de Correlation ID ──────────────────────────────────────────────
// Genera un ID único por request, lo adjunta a la respuesta y al scope de log.
// Permite correlacionar logs de un mismo request distribuido.
app.Use(async (ctx, next) =>
{
    var correlationId = ctx.Request.Headers["X-Correlation-Id"].FirstOrDefault()
                        ?? Guid.NewGuid().ToString("N");
    ctx.Response.Headers["X-Correlation-Id"] = correlationId;
    ctx.Items["CorrelationId"] = correlationId;

    var logger = ctx.RequestServices.GetRequiredService<ILogger<Program>>();
    using (logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = correlationId }))
    {
        await next();
    }
});

// ── Manejo global de excepciones ──────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    // Producción: log estructurado + respuesta genérica sin detalles internos
    app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
    {
        var correlationId = ctx.Items["CorrelationId"]?.ToString() ?? "unknown";
        var logger = ctx.RequestServices.GetRequiredService<ILogger<Program>>();
        var exceptionFeature = ctx.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (exceptionFeature?.Error is not null)
        {
            logger.LogError(
                exceptionFeature.Error,
                "Unhandled exception. CorrelationId={CorrelationId} Path={Path} Method={Method}",
                correlationId,
                ctx.Request.Path,
                ctx.Request.Method);
        }
        ctx.Response.StatusCode = 500;
        ctx.Response.ContentType = "application/json";
        await ctx.Response.WriteAsJsonAsync(new
        {
            message = "Error interno del servidor",
            correlationId
        });
    }));
}

// ── HTTPS y HSTS (solo producción) ───────────────────────────────────────────
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseHsts();
}

// Swagger solo disponible en Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "NobleStep API v1");
        c.RoutePrefix = "swagger";
    });
}

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { 
    status = "healthy", 
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName 
}));

// CORS must be before authentication and authorization
app.UseCors("AllowAngular");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();

