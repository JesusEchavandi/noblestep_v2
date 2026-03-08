using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Helpers;
using NobleStep.Api.Models;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public class CategoriasController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriasController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriaDto>>> GetCategorias()
    {
        var categorias = await _context.Categorias
            .Where(c => c.Activo)
            .Select(c => new CategoriaDto
            {
                Id = c.Id,
                Nombre = c.Nombre,
                Descripcion = c.Descripcion,
                Activo = c.Activo
            })
            .ToListAsync();

        return Ok(categorias);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoriaDto>> GetCategoria(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);

        if (categoria == null)
            return NotFound();

        var categoriaDto = new CategoriaDto
        {
            Id = categoria.Id,
            Nombre = categoria.Nombre,
            Descripcion = categoria.Descripcion,
            Activo = categoria.Activo
        };

        return Ok(categoriaDto);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult<CategoriaDto>> CrearCategoria([FromBody] CrearCategoriaDto crearDto)
    {
        var categoria = new Categoria
        {
            Nombre = crearDto.Nombre,
            Descripcion = crearDto.Descripcion,
            Activo = true
        };

        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync();

        var categoriaDto = new CategoriaDto
        {
            Id = categoria.Id,
            Nombre = categoria.Nombre,
            Descripcion = categoria.Descripcion,
            Activo = categoria.Activo
        };

        return CreatedAtAction(nameof(GetCategoria), new { id = categoria.Id }, categoriaDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ActualizarCategoria(int id, [FromBody] CrearCategoriaDto actualizarDto)
    {
        var categoria = await _context.Categorias.FindAsync(id);

        if (categoria == null)
            return NotFound();

        categoria.Nombre = actualizarDto.Nombre;
        categoria.Descripcion = actualizarDto.Descripcion;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> EliminarCategoria(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);

        if (categoria == null)
            return NotFound();

        // Eliminación lógica
        categoria.Activo = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
