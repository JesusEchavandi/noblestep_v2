using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Models;

namespace NobleStep.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Sale> Sales { get; set; }
    public DbSet<SaleDetail> SaleDetails { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<Purchase> Purchases { get; set; }
    public DbSet<PurchaseDetail> PurchaseDetails { get; set; }
    
    // Product variants (tallas con stock individual)
    public DbSet<ProductVariant> ProductVariants { get; set; }

    // E-commerce tables
    public DbSet<EcommerceCustomer> EcommerceCustomers { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderDetail> OrderDetails { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure table names to match MySQL (PascalCase with uppercase first letter)
        modelBuilder.Entity<User>().ToTable("Users");
        modelBuilder.Entity<Category>().ToTable("Categories");
        modelBuilder.Entity<Product>().ToTable("Products");
        modelBuilder.Entity<Customer>().ToTable("Customers");
        modelBuilder.Entity<Supplier>().ToTable("Suppliers");
        modelBuilder.Entity<Sale>().ToTable("Sales");
        modelBuilder.Entity<SaleDetail>().ToTable("SaleDetails");
        modelBuilder.Entity<Purchase>().ToTable("Purchases");
        modelBuilder.Entity<PurchaseDetail>().ToTable("PurchaseDetails");
        modelBuilder.Entity<ProductVariant>().ToTable("ProductVariants");
        modelBuilder.Entity<EcommerceCustomer>().ToTable("EcommerceCustomers");
        modelBuilder.Entity<Order>().ToTable("Orders");
        modelBuilder.Entity<OrderDetail>().ToTable("OrderDetails");
        
        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(20);
        });

        // Category configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        // Product configuration
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Brand).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Size).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.Property(e => e.SalePrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(1000);
            
            entity.HasOne(e => e.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Customer configuration
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.DocumentNumber).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.DocumentNumber).IsUnique();
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);
        });

        // Sale configuration
        modelBuilder.Entity<Sale>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Total).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            
            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Sales)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // SaleDetail configuration
        modelBuilder.Entity<SaleDetail>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Subtotal).HasColumnType("decimal(18,2)");
            
            entity.HasOne(e => e.Sale)
                .WithMany(s => s.SaleDetails)
                .HasForeignKey(e => e.SaleId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Product)
                .WithMany(p => p.SaleDetails)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Supplier configuration
        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CompanyName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ContactName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.DocumentNumber).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.DocumentNumber).IsUnique();
            entity.Property(e => e.Phone).HasMaxLength(15);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Address).HasMaxLength(200);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Country).HasMaxLength(100);
        });

        // Purchase configuration
        modelBuilder.Entity<Purchase>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Total).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.InvoiceNumber).IsRequired().HasMaxLength(50);
            // InvoiceNumber debe ser único globalmente — evita duplicados de facturas
            entity.HasIndex(e => e.InvoiceNumber).IsUnique();

            entity.HasOne(e => e.Supplier)
                .WithMany(s => s.Purchases)
                .HasForeignKey(e => e.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // PurchaseDetail configuration
        modelBuilder.Entity<PurchaseDetail>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Subtotal).HasColumnType("decimal(18,2)");
            
            entity.HasOne(e => e.Purchase)
                .WithMany(p => p.Details)
                .HasForeignKey(e => e.PurchaseId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ProductVariant configuration
        modelBuilder.Entity<ProductVariant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Size).IsRequired().HasMaxLength(20);

            // Un producto no puede tener dos variantes con la misma talla
            entity.HasIndex(e => new { e.ProductId, e.Size }).IsUnique();

            entity.HasOne(e => e.Product)
                .WithMany(p => p.Variants)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // SaleDetail → ProductVariant (opcional)
        modelBuilder.Entity<SaleDetail>(entity =>
        {
            entity.HasOne(e => e.Variant)
                .WithMany()
                .HasForeignKey(e => e.VariantId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
        });

        // PurchaseDetail → ProductVariant (opcional)
        modelBuilder.Entity<PurchaseDetail>(entity =>
        {
            entity.HasOne(e => e.Variant)
                .WithMany()
                .HasForeignKey(e => e.VariantId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
        });

        // EcommerceCustomer configuration
        modelBuilder.Entity<EcommerceCustomer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.DocumentNumber).HasMaxLength(20);
            entity.Property(e => e.Address).HasMaxLength(300);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.District).HasMaxLength(100);
        });

        // Order configuration
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OrderNumber).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.Property(e => e.CustomerFullName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CustomerEmail).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CustomerPhone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CustomerAddress).IsRequired().HasMaxLength(300);
            entity.Property(e => e.CustomerCity).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CustomerDistrict).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CustomerReference).HasMaxLength(300);
            entity.Property(e => e.CustomerDocumentNumber).HasMaxLength(20);
            
            entity.Property(e => e.Subtotal).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ShippingCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Total).HasColumnType("decimal(18,2)");
            
            entity.Property(e => e.PaymentMethod).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PaymentStatus).IsRequired().HasMaxLength(50);
            entity.Property(e => e.OrderStatus).IsRequired().HasMaxLength(50);
            
            entity.Property(e => e.InvoiceType).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CompanyName).HasMaxLength(200);
            entity.Property(e => e.CompanyRUC).HasMaxLength(20);
            entity.Property(e => e.CompanyAddress).HasMaxLength(300);
            
            entity.HasOne(e => e.EcommerceCustomer)
                .WithMany(c => c.Orders)
                .HasForeignKey(e => e.EcommerceCustomerId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // OrderDetail configuration
        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ProductName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ProductCode).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ProductSize).HasMaxLength(50);
            entity.Property(e => e.ProductBrand).HasMaxLength(100);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Subtotal).HasColumnType("decimal(18,2)");
            
            entity.HasOne(e => e.Order)
                .WithMany(o => o.OrderDetails)
                .HasForeignKey(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Seed initial data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Categories
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Sneakers", Description = "Casual and sports sneakers", IsActive = true },
            new Category { Id = 2, Name = "Formal", Description = "Formal dress shoes", IsActive = true },
            new Category { Id = 3, Name = "Sports", Description = "Athletic and running shoes", IsActive = true },
            new Category { Id = 4, Name = "Casual", Description = "Everyday casual footwear", IsActive = true }
        );

        // Seed default admin user (password: admin123)
        modelBuilder.Entity<User>().HasData(
            new User 
            { 
                Id = 1, 
                Username = "admin", 
                PasswordHash = "$2a$11$5EJ8FdHmPnNvYWFveZNwCeG.L9sJYmQ6JzBqmJrjXxKHI5KGhYGWG", // admin123
                FullName = "System Administrator", 
                Email = "admin@noblestep.com", 
                Role = "Administrator", 
                IsActive = true 
            },
            new User 
            { 
                Id = 2, 
                Username = "seller1", 
                PasswordHash = "$2a$11$5EJ8FdHmPnNvYWFveZNwCeG.L9sJYmQ6JzBqmJrjXxKHI5KGhYGWG", // admin123
                FullName = "John Seller", 
                Email = "seller@noblestep.com", 
                Role = "Seller", 
                IsActive = true 
            }
        );
    }
}
