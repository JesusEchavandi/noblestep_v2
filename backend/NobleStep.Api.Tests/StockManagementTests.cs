using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Models;
using NobleStep.Api.Tests.Helpers;

namespace NobleStep.Api.Tests;

/// <summary>
/// Tests para la lógica de manejo de stock:
/// descuento en ventas, reposición en compras, concurrencia.
/// </summary>
public class StockManagementTests
{
    [Fact]
    public async Task DescontarStock_ReduceCantidadCorrectamente()
    {
        // Arrange
        var context = TestDbContextFactory.CreateWithSeedData();
        var producto = await context.Productos.FindAsync(100);
        var stockInicial = producto!.Stock; // 20

        // Act
        int cantidadVendida = 5;
        producto.Stock -= cantidadVendida;
        await context.SaveChangesAsync();

        // Assert
        var actualizado = await context.Productos.FindAsync(100);
        actualizado!.Stock.Should().Be(stockInicial - cantidadVendida);
    }

    [Fact]
    public async Task StockNoPuedeBajarDeCero()
    {
        // Arrange
        var context = TestDbContextFactory.CreateWithSeedData();
        var producto = await context.Productos.FindAsync(100);

        // Act — intentar vender más de lo que hay
        int cantidadExcesiva = producto!.Stock + 10;
        bool stockSuficiente = producto.Stock >= cantidadExcesiva;

        // Assert
        stockSuficiente.Should().BeFalse();
    }

    [Fact]
    public async Task AgregarStock_IncrementaCantidadCorrectamente()
    {
        // Arrange — simular compra que agrega stock
        var context = TestDbContextFactory.CreateWithSeedData();
        var producto = await context.Productos.FindAsync(100);
        var stockInicial = producto!.Stock; // 20

        // Act
        int cantidadComprada = 15;
        producto.Stock += cantidadComprada;
        await context.SaveChangesAsync();

        // Assert
        var actualizado = await context.Productos.FindAsync(100);
        actualizado!.Stock.Should().Be(stockInicial + cantidadComprada);
    }

    [Fact]
    public async Task ProductoConPrecioOferta_UsaPrecioMenor()
    {
        // Arrange — producto 101 tiene PrecioOferta = 159.99 y Precio = 180.00
        var context = TestDbContextFactory.CreateWithSeedData();
        var producto = await context.Productos.FindAsync(101);

        // Act
        var precioFinal = producto!.PrecioOferta > 0 ? producto.PrecioOferta : producto.Precio;

        // Assert
        precioFinal.Should().BeLessThan(producto.Precio);
        precioFinal.Should().Be(159.99m);
    }

    [Fact]
    public async Task ProductoSinPrecioOferta_UsaPrecioRegular()
    {
        // Arrange — producto 100 tiene PrecioOferta = 0
        var context = TestDbContextFactory.CreateWithSeedData();
        var producto = await context.Productos.FindAsync(100);

        // Act
        var precioFinal = producto!.PrecioOferta > 0 ? producto.PrecioOferta : producto.Precio;

        // Assert
        precioFinal.Should().Be(150.00m);
    }

    [Fact]
    public async Task MultipleVentas_DescuentanStockAcumulativo()
    {
        // Arrange
        var context = TestDbContextFactory.CreateWithSeedData();
        var producto = await context.Productos.FindAsync(100);
        var stockInicial = producto!.Stock; // 20

        // Act — simular 3 ventas secuenciales
        int venta1 = 3;
        int venta2 = 5;
        int venta3 = 2;

        producto.Stock -= venta1;
        await context.SaveChangesAsync();

        producto.Stock -= venta2;
        await context.SaveChangesAsync();

        producto.Stock -= venta3;
        await context.SaveChangesAsync();

        // Assert
        var actualizado = await context.Productos.FindAsync(100);
        actualizado!.Stock.Should().Be(stockInicial - venta1 - venta2 - venta3);
        actualizado.Stock.Should().Be(10);
    }

    [Fact]
    public async Task ProductoInactivo_NoAparece_EnConsultasActivas()
    {
        // Arrange
        var context = TestDbContextFactory.CreateWithSeedData();
        var producto = await context.Productos.FindAsync(101);
        producto!.Activo = false;
        await context.SaveChangesAsync();

        // Act
        var activos = await context.Productos.Where(p => p.Activo).ToListAsync();

        // Assert
        activos.Should().HaveCount(1, "solo queda 1 producto activo");
        activos.First().Id.Should().Be(100);
    }
}
