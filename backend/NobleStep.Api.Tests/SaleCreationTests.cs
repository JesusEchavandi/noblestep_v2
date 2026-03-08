using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Models;
using NobleStep.Api.Tests.Helpers;

namespace NobleStep.Api.Tests;

/// <summary>
/// Tests para la lógica de creación de ventas y descuento de stock.
/// Simula directamente la lógica del controlador usando EF Core InMemory.
/// </summary>
public class SaleCreationTests
{
    [Fact]
    public async Task CrearVenta_DescuentaStockDelProducto()
    {
        // Arrange
        var context = TestDbContextFactory.CreateWithSeedData();
        var producto = await context.Productos.FindAsync(100);
        var stockInicial = producto!.Stock;

        // Act — simular creación de venta con 3 unidades
        var venta = new Venta
        {
            ClienteId = 100,
            UsuarioId = 101,
            FechaVenta = DateTime.UtcNow,
            Estado = "Completada",
            FechaCreacion = DateTime.UtcNow
        };

        int cantidadVendida = 3;
        var detalle = new DetalleVenta
        {
            ProductoId = 100,
            Cantidad = cantidadVendida,
            PrecioUnitario = producto.Precio,
            Subtotal = producto.Precio * cantidadVendida
        };

        venta.DetallesVenta.Add(detalle);
        venta.Total = detalle.Subtotal;

        // Descontar stock (lógica del controller)
        producto.Stock -= cantidadVendida;
        producto.FechaActualizacion = DateTime.UtcNow;

        context.Ventas.Add(venta);
        await context.SaveChangesAsync();

        // Assert
        var productoActualizado = await context.Productos.FindAsync(100);
        productoActualizado!.Stock.Should().Be(stockInicial - cantidadVendida);
    }

    [Fact]
    public async Task CrearVenta_StockInsuficiente_NoPermite()
    {
        // Arrange
        var context = TestDbContextFactory.CreateWithSeedData();
        var producto = await context.Productos.FindAsync(100);
        int cantidadExcesiva = producto!.Stock + 1;

        // Act — verificar stock antes de venta (lógica del controller)
        bool stockSuficiente = producto.Stock >= cantidadExcesiva;

        // Assert
        stockSuficiente.Should().BeFalse("la cantidad excede el stock disponible");
    }

    [Fact]
    public async Task CrearVenta_ConPrecioOferta_UsaPrecioOferta()
    {
        // Arrange — producto 101 tiene precioOferta = 159.99
        var context = TestDbContextFactory.CreateWithSeedData();
        var producto = await context.Productos.FindAsync(101);

        // Act — calcular precio unitario (lógica del controller)
        var precioUnitario = producto!.PrecioOferta > 0 ? producto.PrecioOferta : producto.Precio;

        // Assert
        precioUnitario.Should().Be(159.99m);
    }

    [Fact]
    public async Task CrearVenta_CalculaTotalCorrecto()
    {
        // Arrange
        var context = TestDbContextFactory.CreateWithSeedData();
        var producto1 = await context.Productos.FindAsync(100);
        var producto2 = await context.Productos.FindAsync(101);

        int cant1 = 2;
        int cant2 = 1;
        var precio1 = producto1!.Precio; // 150.00 (sin oferta)
        var precio2 = producto2!.PrecioOferta > 0 ? producto2.PrecioOferta : producto2.Precio; // 159.99

        // Act
        var total = (precio1 * cant1) + (precio2 * cant2);

        // Assert
        total.Should().Be(459.99m);
    }

    [Fact]
    public async Task CrearVenta_ProductoInactivo_NoSeIncluye()
    {
        // Arrange
        var context = TestDbContextFactory.CreateWithSeedData();
        var producto = await context.Productos.FindAsync(100);
        producto!.Activo = false;
        await context.SaveChangesAsync();

        // Act — buscar productos activos (lógica del controller)
        var productosActivos = await context.Productos
            .Where(p => new[] { 100 }.Contains(p.Id) && p.Activo)
            .ToListAsync();

        // Assert
        productosActivos.Should().BeEmpty("el producto fue desactivado");
    }
}
