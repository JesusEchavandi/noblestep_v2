using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Models;

namespace NobleStep.Api.Data;

/// <summary>
/// Contexto de base de datos principal de NobleStep.
/// Mapea todas las entidades a sus tablas correspondientes en MySQL.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // ── Tablas del sistema administrativo ─────────────────────────────────────
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<Producto> Productos { get; set; }
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Venta> Ventas { get; set; }
    public DbSet<DetalleVenta> DetallesVenta { get; set; }
    public DbSet<Proveedor> Proveedores { get; set; }
    public DbSet<Compra> Compras { get; set; }
    public DbSet<DetalleCompra> DetallesCompra { get; set; }

    // Variantes de producto (tallas con stock individual)
    public DbSet<VarianteProducto> VariantesProducto { get; set; }

    // ── Tablas del ecommerce ─────────────────────────────────────────────────
    public DbSet<ClienteEcommerce> ClientesEcommerce { get; set; }
    public DbSet<Pedido> Pedidos { get; set; }
    public DbSet<DetallePedido> DetallesPedido { get; set; }

    // ── Auditoría ─────────────────────────────────────────────────────────────
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ══════════════════════════════════════════════════════════════════════
        // MAPEO DE TABLAS — nombres en español, snake_case
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<Usuario>().ToTable("usuarios");
        modelBuilder.Entity<Categoria>().ToTable("categorias");
        modelBuilder.Entity<Producto>().ToTable("productos");
        modelBuilder.Entity<Cliente>().ToTable("clientes");
        modelBuilder.Entity<Proveedor>().ToTable("proveedores");
        modelBuilder.Entity<Venta>().ToTable("ventas");
        modelBuilder.Entity<DetalleVenta>().ToTable("detalle_ventas");
        modelBuilder.Entity<Compra>().ToTable("compras");
        modelBuilder.Entity<DetalleCompra>().ToTable("detalle_compras");
        modelBuilder.Entity<VarianteProducto>().ToTable("variantes_producto");
        modelBuilder.Entity<ClienteEcommerce>().ToTable("clientes_ecommerce");
        modelBuilder.Entity<Pedido>().ToTable("pedidos");
        modelBuilder.Entity<DetallePedido>().ToTable("detalle_pedidos");
        modelBuilder.Entity<AuditLog>().ToTable("audit_logs");

        // Configuración AuditLog
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasIndex(e => e.FechaUtc);
            entity.HasIndex(e => e.UsuarioId);
            entity.HasIndex(e => new { e.Entidad, e.EntidadId });
        });

        // ══════════════════════════════════════════════════════════════════════
        // CONFIGURACIÓN DE USUARIO
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<Usuario>(entidad =>
        {
            entidad.HasKey(e => e.Id);
            entidad.Property(e => e.Id).HasColumnName("id");
            entidad.Property(e => e.NombreUsuario).IsRequired().HasMaxLength(50).HasColumnName("nombre_usuario");
            entidad.HasIndex(e => e.NombreUsuario).IsUnique();
            entidad.Property(e => e.HashContrasena).IsRequired().HasColumnName("hash_contrasena");
            entidad.Property(e => e.Correo).IsRequired().HasMaxLength(100).HasColumnName("correo");
            entidad.Property(e => e.NombreCompleto).IsRequired().HasMaxLength(100).HasColumnName("nombre_completo");
            entidad.Property(e => e.Rol).IsRequired().HasMaxLength(20).HasColumnName("rol");
            entidad.Property(e => e.Activo).HasColumnName("activo");
            entidad.Property(e => e.FechaCreacion).HasColumnName("fecha_creacion");
            entidad.Property(e => e.FechaActualizacion).HasColumnName("fecha_actualizacion");
            entidad.Property(e => e.CreadoPor).HasColumnName("creado_por");
            entidad.Property(e => e.HashTokenRefresco).HasColumnName("hash_token_refresco");
            entidad.Property(e => e.ExpiracionTokenRefresco).HasColumnName("expiracion_token_refresco");
        });

        // ══════════════════════════════════════════════════════════════════════
        // CONFIGURACIÓN DE CATEGORÍA
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<Categoria>(entidad =>
        {
            entidad.HasKey(e => e.Id);
            entidad.Property(e => e.Id).HasColumnName("id");
            entidad.Property(e => e.Nombre).IsRequired().HasMaxLength(100).HasColumnName("nombre");
            entidad.Property(e => e.Descripcion).HasMaxLength(500).HasColumnName("descripcion");
            entidad.Property(e => e.Activo).HasColumnName("activo");
            entidad.Property(e => e.FechaCreacion).HasColumnName("fecha_creacion");
        });

        // ══════════════════════════════════════════════════════════════════════
        // CONFIGURACIÓN DE PRODUCTO
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<Producto>(entidad =>
        {
            entidad.HasKey(e => e.Id);
            entidad.Property(e => e.Id).HasColumnName("id");
            entidad.Property(e => e.Nombre).IsRequired().HasMaxLength(200).HasColumnName("nombre");
            entidad.Property(e => e.Marca).IsRequired().HasMaxLength(100).HasColumnName("marca");
            entidad.Property(e => e.CategoriaId).HasColumnName("categoria_id");
            entidad.Property(e => e.Talla).IsRequired().HasMaxLength(20).HasColumnName("talla");
            entidad.Property(e => e.Precio).HasColumnType("decimal(18,2)").HasColumnName("precio");
            entidad.Property(e => e.PrecioOferta).HasColumnType("decimal(18,2)").HasColumnName("precio_oferta");
            entidad.Property(e => e.Stock).HasColumnName("stock");
            entidad.Property(e => e.UrlImagen).HasMaxLength(500).HasColumnName("url_imagen");
            entidad.Property(e => e.Descripcion).HasMaxLength(1000).HasColumnName("descripcion");
            entidad.Property(e => e.Activo).HasColumnName("activo");
            entidad.Property(e => e.FechaCreacion).HasColumnName("fecha_creacion");
            entidad.Property(e => e.FechaActualizacion).HasColumnName("fecha_actualizacion");

            entidad.HasOne(e => e.Categoria)
                .WithMany(c => c.Productos)
                .HasForeignKey(e => e.CategoriaId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ══════════════════════════════════════════════════════════════════════
        // CONFIGURACIÓN DE CLIENTE
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<Cliente>(entidad =>
        {
            entidad.HasKey(e => e.Id);
            entidad.Property(e => e.Id).HasColumnName("id");
            entidad.Property(e => e.NombreCompleto).IsRequired().HasMaxLength(100).HasColumnName("nombre_completo");
            entidad.Property(e => e.NumeroDocumento).IsRequired().HasMaxLength(20).HasColumnName("numero_documento");
            entidad.HasIndex(e => e.NumeroDocumento).IsUnique();
            entidad.Property(e => e.Telefono).HasMaxLength(20).HasColumnName("telefono");
            entidad.Property(e => e.Correo).HasMaxLength(100).HasColumnName("correo");
            entidad.Property(e => e.Activo).HasColumnName("activo");
            entidad.Property(e => e.FechaCreacion).HasColumnName("fecha_creacion");
            entidad.Property(e => e.FechaActualizacion).HasColumnName("fecha_actualizacion");
            entidad.Property(e => e.CreadoPor).HasColumnName("creado_por");
        });

        // ══════════════════════════════════════════════════════════════════════
        // CONFIGURACIÓN DE VENTA
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<Venta>(entidad =>
        {
            entidad.HasKey(e => e.Id);
            entidad.Property(e => e.Id).HasColumnName("id");
            entidad.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entidad.Property(e => e.UsuarioId).HasColumnName("usuario_id");
            entidad.Property(e => e.FechaVenta).HasColumnName("fecha_venta");
            entidad.Property(e => e.Total).HasColumnType("decimal(18,2)").HasColumnName("total");
            entidad.Property(e => e.Estado).IsRequired().HasMaxLength(20).HasColumnName("estado");
            entidad.Property(e => e.FechaCreacion).HasColumnName("fecha_creacion");
            entidad.Property(e => e.FechaActualizacion).HasColumnName("fecha_actualizacion");
            entidad.Property(e => e.CreadoPor).HasColumnName("creado_por");

            entidad.HasOne(e => e.Cliente)
                .WithMany(c => c.Ventas)
                .HasForeignKey(e => e.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            entidad.HasOne(e => e.Usuario)
                .WithMany()
                .HasForeignKey(e => e.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ══════════════════════════════════════════════════════════════════════
        // CONFIGURACIÓN DE DETALLE DE VENTA
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<DetalleVenta>(entidad =>
        {
            entidad.HasKey(e => e.Id);
            entidad.Property(e => e.Id).HasColumnName("id");
            entidad.Property(e => e.VentaId).HasColumnName("venta_id");
            entidad.Property(e => e.ProductoId).HasColumnName("producto_id");
            entidad.Property(e => e.VarianteId).HasColumnName("variante_id");
            entidad.Property(e => e.Cantidad).HasColumnName("cantidad");
            entidad.Property(e => e.PrecioUnitario).HasColumnType("decimal(18,2)").HasColumnName("precio_unitario");
            entidad.Property(e => e.Subtotal).HasColumnType("decimal(18,2)").HasColumnName("subtotal");

            entidad.HasOne(e => e.Venta)
                .WithMany(s => s.DetallesVenta)
                .HasForeignKey(e => e.VentaId)
                .OnDelete(DeleteBehavior.Cascade);

            entidad.HasOne(e => e.Producto)
                .WithMany(p => p.DetallesVenta)
                .HasForeignKey(e => e.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);

            entidad.HasOne(e => e.Variante)
                .WithMany()
                .HasForeignKey(e => e.VarianteId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
        });

        // ══════════════════════════════════════════════════════════════════════
        // CONFIGURACIÓN DE PROVEEDOR
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<Proveedor>(entidad =>
        {
            entidad.HasKey(e => e.Id);
            entidad.Property(e => e.Id).HasColumnName("id");
            entidad.Property(e => e.RazonSocial).IsRequired().HasMaxLength(100).HasColumnName("razon_social");
            entidad.Property(e => e.NombreContacto).IsRequired().HasMaxLength(100).HasColumnName("nombre_contacto");
            entidad.Property(e => e.NumeroDocumento).IsRequired().HasMaxLength(20).HasColumnName("numero_documento");
            entidad.HasIndex(e => e.NumeroDocumento).IsUnique();
            entidad.Property(e => e.Telefono).HasMaxLength(15).HasColumnName("telefono");
            entidad.Property(e => e.Correo).HasMaxLength(100).HasColumnName("correo");
            entidad.Property(e => e.Direccion).HasMaxLength(200).HasColumnName("direccion");
            entidad.Property(e => e.Ciudad).HasMaxLength(100).HasColumnName("ciudad");
            entidad.Property(e => e.Pais).HasMaxLength(100).HasColumnName("pais");
            entidad.Property(e => e.Activo).HasColumnName("activo");
            entidad.Property(e => e.FechaCreacion).HasColumnName("fecha_creacion");
            entidad.Property(e => e.FechaActualizacion).HasColumnName("fecha_actualizacion");
        });

        // ══════════════════════════════════════════════════════════════════════
        // CONFIGURACIÓN DE COMPRA
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<Compra>(entidad =>
        {
            entidad.HasKey(e => e.Id);
            entidad.Property(e => e.Id).HasColumnName("id");
            entidad.Property(e => e.ProveedorId).HasColumnName("proveedor_id");
            entidad.Property(e => e.UsuarioId).HasColumnName("usuario_id");
            entidad.Property(e => e.FechaCompra).HasColumnName("fecha_compra");
            entidad.Property(e => e.Total).HasColumnType("decimal(18,2)").HasColumnName("total");
            entidad.Property(e => e.Estado).IsRequired().HasMaxLength(50).HasColumnName("estado");
            entidad.Property(e => e.NumeroFactura).IsRequired().HasMaxLength(50).HasColumnName("numero_factura");
            // NumeroFactura debe ser único globalmente — evita duplicados de facturas
            entidad.HasIndex(e => e.NumeroFactura).IsUnique();
            entidad.Property(e => e.FechaCreacion).HasColumnName("fecha_creacion");
            entidad.Property(e => e.Notas).HasColumnName("notas");
            entidad.Property(e => e.FechaActualizacion).HasColumnName("fecha_actualizacion");

            entidad.HasOne(e => e.Proveedor)
                .WithMany(s => s.Compras)
                .HasForeignKey(e => e.ProveedorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ══════════════════════════════════════════════════════════════════════
        // CONFIGURACIÓN DE DETALLE DE COMPRA
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<DetalleCompra>(entidad =>
        {
            entidad.HasKey(e => e.Id);
            entidad.Property(e => e.Id).HasColumnName("id");
            entidad.Property(e => e.CompraId).HasColumnName("compra_id");
            entidad.Property(e => e.ProductoId).HasColumnName("producto_id");
            entidad.Property(e => e.VarianteId).HasColumnName("variante_id");
            entidad.Property(e => e.Cantidad).HasColumnName("cantidad");
            entidad.Property(e => e.CostoUnitario).HasColumnType("decimal(18,2)").HasColumnName("costo_unitario");
            entidad.Property(e => e.Subtotal).HasColumnType("decimal(18,2)").HasColumnName("subtotal");

            entidad.HasOne(e => e.Compra)
                .WithMany(p => p.Detalles)
                .HasForeignKey(e => e.CompraId)
                .OnDelete(DeleteBehavior.Cascade);

            entidad.HasOne(e => e.Producto)
                .WithMany()
                .HasForeignKey(e => e.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);

            entidad.HasOne(e => e.Variante)
                .WithMany()
                .HasForeignKey(e => e.VarianteId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
        });

        // ══════════════════════════════════════════════════════════════════════
        // CONFIGURACIÓN DE VARIANTE DE PRODUCTO
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<VarianteProducto>(entidad =>
        {
            entidad.HasKey(e => e.Id);
            entidad.Property(e => e.Id).HasColumnName("id");
            entidad.Property(e => e.ProductoId).HasColumnName("producto_id");
            entidad.Property(e => e.Talla).IsRequired().HasMaxLength(20).HasColumnName("talla");
            entidad.Property(e => e.Stock).HasColumnName("stock");
            entidad.Property(e => e.Activo).HasColumnName("activo");
            entidad.Property(e => e.FechaCreacion).HasColumnName("fecha_creacion");
            entidad.Property(e => e.FechaActualizacion).HasColumnName("fecha_actualizacion");

            // Un producto no puede tener dos variantes con la misma talla
            entidad.HasIndex(e => new { e.ProductoId, e.Talla }).IsUnique();

            entidad.HasOne(e => e.Producto)
                .WithMany(p => p.Variantes)
                .HasForeignKey(e => e.ProductoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ══════════════════════════════════════════════════════════════════════
        // CONFIGURACIÓN DE CLIENTE ECOMMERCE
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<ClienteEcommerce>(entidad =>
        {
            entidad.HasKey(e => e.Id);
            entidad.Property(e => e.Id).HasColumnName("id");
            entidad.Property(e => e.Correo).IsRequired().HasMaxLength(100).HasColumnName("correo");
            // Índice único en Correo: evita duplicados a nivel DB
            entidad.HasIndex(e => e.Correo).IsUnique().HasDatabaseName("IX_clientes_ecommerce_correo");
            entidad.Property(e => e.HashContrasena).IsRequired().HasColumnName("hash_contrasena");
            entidad.Property(e => e.NombreCompleto).IsRequired().HasMaxLength(100).HasColumnName("nombre_completo");
            entidad.Property(e => e.Telefono).HasMaxLength(20).HasColumnName("telefono");
            entidad.Property(e => e.NumeroDocumento).HasMaxLength(20).HasColumnName("numero_documento");
            entidad.Property(e => e.Direccion).HasMaxLength(300).HasColumnName("direccion");
            entidad.Property(e => e.Ciudad).HasMaxLength(100).HasColumnName("ciudad");
            entidad.Property(e => e.Distrito).HasMaxLength(100).HasColumnName("distrito");
            entidad.Property(e => e.Activo).HasColumnName("activo");
            entidad.Property(e => e.CorreoVerificado).HasColumnName("correo_verificado");
            entidad.Property(e => e.TokenRecuperacion).HasColumnName("token_recuperacion");
            entidad.Property(e => e.ExpiracionRecuperacion).HasColumnName("expiracion_recuperacion");
            entidad.Property(e => e.FechaCreacion).HasColumnName("fecha_creacion");
            entidad.Property(e => e.FechaActualizacion).HasColumnName("fecha_actualizacion");
            entidad.Property(e => e.HashTokenRefresco).HasColumnName("hash_token_refresco");
            entidad.Property(e => e.ExpiracionTokenRefresco).HasColumnName("expiracion_token_refresco");

            // Índice compuesto para queries frecuentes: clientes activos ordenados por fecha
            entidad.HasIndex(e => new { e.Activo, e.FechaCreacion })
                  .HasDatabaseName("IX_clientes_ecommerce_activo_fecha_creacion");

            // Índice en HashTokenRefresco para búsqueda rápida al renovar token
            entidad.HasIndex(e => e.HashTokenRefresco)
                  .HasDatabaseName("IX_clientes_ecommerce_hash_token_refresco");
        });

        // ══════════════════════════════════════════════════════════════════════
        // CONFIGURACIÓN DE PEDIDO
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<Pedido>(entidad =>
        {
            entidad.HasKey(e => e.Id);
            entidad.Property(e => e.Id).HasColumnName("id");
            entidad.Property(e => e.ClienteEcommerceId).HasColumnName("cliente_ecommerce_id");
            entidad.Property(e => e.NumeroPedido).IsRequired().HasMaxLength(50).HasColumnName("numero_pedido");
            entidad.HasIndex(e => e.NumeroPedido).IsUnique();
            entidad.Property(e => e.NombreCompletoCliente).IsRequired().HasMaxLength(100).HasColumnName("nombre_completo_cliente");
            entidad.Property(e => e.CorreoCliente).IsRequired().HasMaxLength(100).HasColumnName("correo_cliente");
            entidad.Property(e => e.TelefonoCliente).IsRequired().HasMaxLength(20).HasColumnName("telefono_cliente");
            entidad.Property(e => e.DireccionCliente).IsRequired().HasMaxLength(300).HasColumnName("direccion_cliente");
            entidad.Property(e => e.CiudadCliente).IsRequired().HasMaxLength(100).HasColumnName("ciudad_cliente");
            entidad.Property(e => e.DistritoCliente).IsRequired().HasMaxLength(100).HasColumnName("distrito_cliente");
            entidad.Property(e => e.ReferenciaCliente).HasMaxLength(300).HasColumnName("referencia_cliente");
            entidad.Property(e => e.DocumentoCliente).HasMaxLength(20).HasColumnName("documento_cliente");

            entidad.Property(e => e.Subtotal).HasColumnType("decimal(18,2)").HasColumnName("subtotal");
            entidad.Property(e => e.CostoEnvio).HasColumnType("decimal(18,2)").HasColumnName("costo_envio");
            entidad.Property(e => e.Total).HasColumnType("decimal(18,2)").HasColumnName("total");

            entidad.Property(e => e.MetodoPago).IsRequired().HasMaxLength(50).HasColumnName("metodo_pago");
            entidad.Property(e => e.DetallePago).HasColumnName("detalle_pago");
            entidad.Property(e => e.EstadoPago).IsRequired().HasMaxLength(50).HasColumnName("estado_pago");
            entidad.Property(e => e.UrlComprobantePago).HasColumnName("url_comprobante_pago");
            entidad.Property(e => e.NotasAdmin).HasColumnName("notas_admin");
            entidad.Property(e => e.EstadoPedido).IsRequired().HasMaxLength(50).HasColumnName("estado_pedido");

            entidad.Property(e => e.TipoComprobante).IsRequired().HasMaxLength(20).HasColumnName("tipo_comprobante");
            entidad.Property(e => e.RazonSocialEmpresa).HasMaxLength(200).HasColumnName("razon_social_empresa");
            entidad.Property(e => e.RucEmpresa).HasMaxLength(20).HasColumnName("ruc_empresa");
            entidad.Property(e => e.DireccionEmpresa).HasMaxLength(300).HasColumnName("direccion_empresa");

            entidad.Property(e => e.FechaPedido).HasColumnName("fecha_pedido");
            entidad.Property(e => e.FechaProcesado).HasColumnName("fecha_procesado");
            entidad.Property(e => e.FechaEnviado).HasColumnName("fecha_enviado");
            entidad.Property(e => e.FechaEntregado).HasColumnName("fecha_entregado");
            entidad.Property(e => e.FechaCreacion).HasColumnName("fecha_creacion");
            entidad.Property(e => e.FechaActualizacion).HasColumnName("fecha_actualizacion");

            entidad.Property(e => e.Eliminado).HasColumnName("eliminado");
            entidad.Property(e => e.FechaEliminacion).HasColumnName("fecha_eliminacion");

            entidad.HasOne(e => e.ClienteEcommerce)
                .WithMany(c => c.Pedidos)
                .HasForeignKey(e => e.ClienteEcommerceId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ══════════════════════════════════════════════════════════════════════
        // CONFIGURACIÓN DE DETALLE DE PEDIDO
        // ══════════════════════════════════════════════════════════════════════
        modelBuilder.Entity<DetallePedido>(entidad =>
        {
            entidad.HasKey(e => e.Id);
            entidad.Property(e => e.Id).HasColumnName("id");
            entidad.Property(e => e.PedidoId).HasColumnName("pedido_id");
            entidad.Property(e => e.ProductoId).HasColumnName("producto_id");
            entidad.Property(e => e.NombreProducto).IsRequired().HasMaxLength(200).HasColumnName("nombre_producto");
            entidad.Property(e => e.CodigoProducto).IsRequired().HasMaxLength(100).HasColumnName("codigo_producto");
            entidad.Property(e => e.TallaProducto).HasMaxLength(50).HasColumnName("talla_producto");
            entidad.Property(e => e.MarcaProducto).HasMaxLength(100).HasColumnName("marca_producto");
            entidad.Property(e => e.Cantidad).HasColumnName("cantidad");
            entidad.Property(e => e.PrecioUnitario).HasColumnType("decimal(18,2)").HasColumnName("precio_unitario");
            entidad.Property(e => e.Subtotal).HasColumnType("decimal(18,2)").HasColumnName("subtotal");

            entidad.HasOne(e => e.Pedido)
                .WithMany(o => o.DetallesPedido)
                .HasForeignKey(e => e.PedidoId)
                .OnDelete(DeleteBehavior.Cascade);

            entidad.HasOne(e => e.Producto)
                .WithMany()
                .HasForeignKey(e => e.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Filtro global de soft delete para Pedidos ────────────────────────
        // Los registros con Eliminado = true nunca aparecen en consultas normales.
        // Para consultas administrativas que necesiten ver eliminados, usar IgnoreQueryFilters().
        modelBuilder.Entity<Pedido>().HasQueryFilter(p => !p.Eliminado);

        // Datos semilla
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Datos semilla de Categorías
        modelBuilder.Entity<Categoria>().HasData(
            new Categoria { Id = 1, Nombre = "Zapatillas", Descripcion = "Zapatillas deportivas y casuales", Activo = true },
            new Categoria { Id = 2, Nombre = "Botas", Descripcion = "Botas para trabajo y montaña", Activo = true },
            new Categoria { Id = 3, Nombre = "Formales", Descripcion = "Zapatos formales para oficina", Activo = true },
            new Categoria { Id = 4, Nombre = "Sandalias", Descripcion = "Sandalias y calzado de verano", Activo = true }
        );

        // Datos semilla de Usuario administrador (contraseña: admin123)
        modelBuilder.Entity<Usuario>().HasData(
            new Usuario
            {
                Id = 1,
                NombreUsuario = "admin",
                HashContrasena = "$2a$11$5EJ8FdHmPnNvYWFveZNwCeG.L9sJYmQ6JzBqmJrjXxKHI5KGhYGWG", // admin123
                NombreCompleto = "Administrador del Sistema",
                Correo = "admin@noblestep.com",
                Rol = "Administrador",
                Activo = true
            },
            new Usuario
            {
                Id = 2,
                NombreUsuario = "vendedor1",
                HashContrasena = "$2a$11$5EJ8FdHmPnNvYWFveZNwCeG.L9sJYmQ6JzBqmJrjXxKHI5KGhYGWG", // admin123
                NombreCompleto = "Juan Vendedor",
                Correo = "vendedor@noblestep.com",
                Rol = "Vendedor",
                Activo = true
            }
        );
    }
}
