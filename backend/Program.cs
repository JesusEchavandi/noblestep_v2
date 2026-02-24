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

// Configurar zona horaria peruana
TimeZoneInfo peruTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time"); // UTC-5 (Perú)
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
        // TEMPORAL: Permitir todos los orígenes de Vercel para debugging
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrEmpty(origin)) return false;

            var uri = new Uri(origin);
            var isLocalhost = uri.Host == "localhost" || uri.Host == "127.0.0.1";
            // Permitir Vercel para deploy de prueba
            // TODO: Limitar a dominios específicos antes de ir a producción real
            var isVercel = uri.Host.EndsWith(".vercel.app");

            return isLocalhost || isVercel;
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
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

