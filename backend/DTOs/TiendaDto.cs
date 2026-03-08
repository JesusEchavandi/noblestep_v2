namespace NobleStep.Api.DTOs;

// DTO para productos en el catálogo público (sin mostrar precio de compra)
public class ProductoTiendaDto
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;

    /// <summary>
    /// Talla del producto (legacy: cuando no hay variantes).
    /// Si hay variantes, usar el campo Tallas.
    /// </summary>
    public string? Talla { get; set; }

    public decimal Precio { get; set; }
    public decimal PrecioVenta { get; set; }

    /// <summary>Stock total sumado de todas las variantes activas (o el campo Stock legacy)</summary>
    public int Stock { get; set; }

    public int CategoriaId { get; set; }
    public string NombreCategoria { get; set; } = string.Empty;
    public string? UrlImagen { get; set; }

    /// <summary>Tallas disponibles con stock individual — vacío si el producto no tiene variantes</summary>
    public List<TallaProductoDto> Tallas { get; set; } = new();
}

/// <summary>Talla disponible con su stock y ID de variante para agregar al carrito</summary>
public class TallaProductoDto
{
    public int VarianteId { get; set; }
    public string Talla { get; set; } = string.Empty;
    public int Stock { get; set; }
    public bool Disponible => Stock > 0;
}

// DTO para categorías en el catálogo público
public class CategoriaTiendaDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public int CantidadProductos { get; set; }
}

// DTO para formulario de contacto
public class ContactoDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
}

/// <summary>Respuesta paginada genérica para endpoints de catálogo público</summary>
public class PaginatedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalItems / PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}
