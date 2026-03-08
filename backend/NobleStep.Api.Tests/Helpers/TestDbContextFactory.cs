using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.Models;

namespace NobleStep.Api.Tests.Helpers;

/// <summary>
/// Factory para crear instancias de AppDbContext con InMemory database para tests.
/// </summary>
public static class TestDbContextFactory
{
    /// <summary>
    /// Crea un AppDbContext con InMemory database y datos de prueba pre-cargados.
    /// </summary>
    public static AppDbContext Create(string? dbName = null)
    {
        dbName ??= Guid.NewGuid().ToString();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();

        return context;
    }

    /// <summary>
    /// Crea un contexto con datos de prueba estándar para la mayoría de tests.
    /// </summary>
    public static AppDbContext CreateWithSeedData(string? dbName = null)
    {
        var context = Create(dbName);
        SeedData(context);
        return context;
    }

    public static void SeedData(AppDbContext context)
    {
        // NOTA: AppDbContext.OnModelCreating ya crea seed data:
        //   - Categorías: Id 1-4
        //   - Usuarios: Id 1 (admin), Id 2 (vendedor1)
        // Usamos IDs >= 100 para evitar conflictos.

        // ── Usuarios adicionales ──
        var admin2 = new Usuario
        {
            Id = 100,
            NombreUsuario = "admin_test",
            HashContrasena = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            NombreCompleto = "Admin Test",
            Correo = "admin_test@test.com",
            Rol = "Administrador",
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };

        var vendedor = new Usuario
        {
            Id = 101,
            NombreUsuario = "vendedor_test",
            HashContrasena = BCrypt.Net.BCrypt.HashPassword("Vendedor123!"),
            NombreCompleto = "Vendedor Test",
            Correo = "vendedor_test@test.com",
            Rol = "Vendedor",
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };

        var admin3 = new Usuario
        {
            Id = 102,
            NombreUsuario = "admin_test2",
            HashContrasena = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            NombreCompleto = "Admin Dos Test",
            Correo = "admin2_test@test.com",
            Rol = "Administrador",
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };

        context.Usuarios.AddRange(admin2, vendedor, admin3);

        // ── Productos (categoría Id=1 ya existe por seed) ──
        var producto1 = new Producto
        {
            Id = 100,
            Nombre = "Nike Air Max 90",
            Marca = "Nike",
            CategoriaId = 1,
            Talla = "42",
            Precio = 150.00m,
            PrecioOferta = 0,
            Stock = 20,
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };

        var producto2 = new Producto
        {
            Id = 101,
            Nombre = "Adidas Ultraboost",
            Marca = "Adidas",
            CategoriaId = 1,
            Talla = "41",
            Precio = 180.00m,
            PrecioOferta = 159.99m,
            Stock = 10,
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };

        context.Productos.AddRange(producto1, producto2);

        // ── Clientes ──
        var cliente = new Cliente
        {
            Id = 100,
            NombreCompleto = "Cliente Test",
            NumeroDocumento = "12345678",
            Telefono = "999999999",
            Correo = "cliente@test.com",
            FechaCreacion = DateTime.UtcNow
        };
        context.Clientes.Add(cliente);

        // ── Proveedores ──
        var proveedor = new Proveedor
        {
            Id = 100,
            RazonSocial = "Proveedor Test S.A.C.",
            NombreContacto = "Contacto Test",
            NumeroDocumento = "20123456789",
            Telefono = "999888777",
            Correo = "proveedor@test.com",
            FechaCreacion = DateTime.UtcNow
        };
        context.Proveedores.Add(proveedor);

        context.SaveChanges();
    }
}
