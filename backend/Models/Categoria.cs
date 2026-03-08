namespace NobleStep.Api.Models;

/// <summary>
/// Representa una categoría de productos (ej: Zapatillas, Botas, Formales, Sandalias).
/// Tabla: categorias
/// </summary>
public class Categoria
{
    public int Id { get; set; }

    /// <summary>Nombre de la categoría.</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Descripción de la categoría.</summary>
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>Indica si la categoría está activa.</summary>
    public bool Activo { get; set; } = true;

    /// <summary>Fecha y hora de creación del registro.</summary>
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Propiedad de navegación
    /// <summary>Productos que pertenecen a esta categoría.</summary>
    public ICollection<Producto> Productos { get; set; } = new List<Producto>();
}
