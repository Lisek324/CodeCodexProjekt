using CodeCodexBackend.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CodeCodexBackend.Controllers
{
  [Route("api/")]
  [ApiController]
  public class AppUsersController : ControllerBase
  {
    private readonly AppUserDbContext _context;
    private readonly PasswordHasher<AppUser> _passwordHasher;

    public AppUsersController(AppUserDbContext context)
    {
      _context = context;
      _passwordHasher = new PasswordHasher<AppUser>();
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers()
    {
      return await _context.Users.ToListAsync();
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
      var normalizedEmailVar = request.email.Trim().ToUpperInvariant();
      var existingUser = await _context.Users.FirstOrDefaultAsync(x => x.normalizedEmail == normalizedEmailVar);

      if (existingUser is not null)
      {
        return BadRequest(new { message = "Użytkownik o takim emailu już istnieje." });
      }

      var user = new AppUser
      {
        id = Guid.NewGuid(),
        email = request.email.Trim(),
        normalizedEmail = normalizedEmailVar,
        fullName = request.fullName?.Trim(),
        authProvider = "local",
        emailConfirmed = false,
        createdAtUtc = DateTime.UtcNow
      };
      user.passwordHash = _passwordHasher.HashPassword(user, request.password);

      _context.Users.Add(user);
      await _context.SaveChangesAsync();

      return Ok(new { message = "Rejestracja zakończona sukcesem.", success = true });
    }
  }
}
