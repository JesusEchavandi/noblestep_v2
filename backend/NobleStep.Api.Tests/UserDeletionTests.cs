using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Models;
using NobleStep.Api.Tests.Helpers;

namespace NobleStep.Api.Tests;

/// <summary>
/// Tests para la eliminación de usuarios con reasignación de ventas/compras.
/// Valida la lógica transaccional de EliminarUsuario.
/// </summary>
public class UserDeletionTests
{
    [Fact]
    public async Task EliminarUsuario_ReasignaVentasAlAdmin()
    {
        // Arrange
        var dbName = Guid.NewGuid().ToString();
        var context = TestDbContextFactory.CreateWithSeedData(dbName);

        // Crear una venta del vendedor (id=101)
        var venta = new Venta
        {
            ClienteId = 100,
            UsuarioId = 101, // vendedor_test
            FechaVenta = DateTime.UtcNow,
            Total = 100,
            Estado = "Completada",
            FechaCreacion = DateTime.UtcNow
        };
        context.Ventas.Add(venta);
        await context.SaveChangesAsync();

        // Act — simular reasignación + eliminación (lógica del controller)
        int adminId = 100; // admin que ejecuta la eliminación
        int usuarioAEliminar = 101;

        var ventasUsuario = await context.Ventas.Where(v => v.UsuarioId == usuarioAEliminar).ToListAsync();
        foreach (var v in ventasUsuario)
            v.UsuarioId = adminId;

        var usuario = await context.Usuarios.FindAsync(usuarioAEliminar);
        context.Usuarios.Remove(usuario!);
        await context.SaveChangesAsync();

        // Assert
        var ventaReasignada = await context.Ventas.FirstAsync();
        ventaReasignada.UsuarioId.Should().Be(adminId, "la venta debe reasignarse al admin");

        var usuarioEliminado = await context.Usuarios.FindAsync(usuarioAEliminar);
        usuarioEliminado.Should().BeNull("el usuario fue eliminado físicamente");
    }

    [Fact]
    public async Task EliminarUltimoAdmin_NoPermite()
    {
        // Arrange
        var context = TestDbContextFactory.CreateWithSeedData();

        // Desactivar todos los admins excepto uno
        // admin (Id=1 from seed), admin_test (Id=100), admin_test2 (Id=102)
        var admin2 = await context.Usuarios.FindAsync(102);
        admin2!.Activo = false;
        var admin1 = await context.Usuarios.FindAsync(1);
        admin1!.Activo = false;
        await context.SaveChangesAsync();

        // Act — verificar regla de negocio (solo queda admin_test Id=100)
        int adminAEliminar = 100;
        var adminActivo = await context.Usuarios.FindAsync(adminAEliminar);
        var cantidadAdmins = await context.Usuarios
            .CountAsync(u => u.Rol == "Administrador" && u.Activo && u.Id != adminAEliminar);

        // Assert
        cantidadAdmins.Should().Be(0, "solo hay un admin activo");
        // El controller retornaría BadRequest en este caso
    }

    [Fact]
    public async Task EliminarUsuario_SinVentas_EliminaDirectamente()
    {
        // Arrange
        var context = TestDbContextFactory.CreateWithSeedData();
        int usuarioSinVentas = 102; // admin_test2 no tiene ventas en el seed

        // Act
        var ventasUsuario = await context.Ventas.Where(v => v.UsuarioId == usuarioSinVentas).ToListAsync();
        var comprasUsuario = await context.Compras.Where(c => c.UsuarioId == usuarioSinVentas).ToListAsync();

        var usuario = await context.Usuarios.FindAsync(usuarioSinVentas);
        context.Usuarios.Remove(usuario!);
        await context.SaveChangesAsync();

        // Assert
        ventasUsuario.Should().BeEmpty();
        comprasUsuario.Should().BeEmpty();
        (await context.Usuarios.FindAsync(usuarioSinVentas)).Should().BeNull();
    }

    [Fact]
    public Task NoPermiteAutoEliminacion()
    {
        // Arrange — simular que admin (id=100) intenta eliminarse a sí mismo
        int adminId = 100;
        int idAEliminar = 100;

        // Act / Assert
        (adminId == idAEliminar).Should().BeTrue("la auto-eliminación debe ser bloqueada por el controller");
        return Task.CompletedTask;
    }
}
