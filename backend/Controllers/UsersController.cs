using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NobleStep.Api.Data;
using NobleStep.Api.DTOs;
using NobleStep.Api.Models;

namespace NobleStep.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        var userDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        return Ok(userDto);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createDto)
    {
        // Check if username already exists
        if (await _context.Users.AnyAsync(u => u.Username == createDto.Username))
        {
            return BadRequest(new { message = "El nombre de usuario ya existe" });
        }

        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email == createDto.Email))
        {
            return BadRequest(new { message = "El email ya está registrado" });
        }

        var user = new User
        {
            Username = createDto.Username,
            FullName = createDto.FullName,
            Email = createDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(createDto.Password),
            Role = createDto.Role,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var userDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, userDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateDto)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        // Check if username is taken by another user
        if (await _context.Users.AnyAsync(u => u.Username == updateDto.Username && u.Id != id))
        {
            return BadRequest(new { message = "El nombre de usuario ya existe" });
        }

        // Check if email is taken by another user
        if (await _context.Users.AnyAsync(u => u.Email == updateDto.Email && u.Id != id))
        {
            return BadRequest(new { message = "El email ya está registrado" });
        }

        user.Username = updateDto.Username;
        user.FullName = updateDto.FullName;
        user.Email = updateDto.Email;
        user.Role = updateDto.Role;
        user.IsActive = updateDto.IsActive;

        // Update password only if provided
        if (!string.IsNullOrEmpty(updateDto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateDto.Password);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        // Prevent deleting the last administrator
        if (user.Role == "Administrator")
        {
            var adminCount = await _context.Users.CountAsync(u => u.Role == "Administrator" && u.IsActive);
            if (adminCount <= 1)
            {
                return BadRequest(new { message = "No se puede eliminar el último administrador del sistema" });
            }
        }

        // Soft delete
        user.IsActive = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/activate")]
    public async Task<IActionResult> ActivateUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        user.IsActive = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/deactivate")]
    public async Task<IActionResult> DeactivateUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        // Prevent deactivating the last administrator
        if (user.Role == "Administrator")
        {
            var adminCount = await _context.Users.CountAsync(u => u.Role == "Administrator" && u.IsActive);
            if (adminCount <= 1)
            {
                return BadRequest(new { message = "No se puede desactivar el último administrador del sistema" });
            }
        }

        user.IsActive = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
