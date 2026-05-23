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
  [Route("api/login")]
  [ApiController]
  public class LoginController : ControllerBase
  {
    private readonly AppUserDbContext _context;
    private readonly PasswordHasher<AppUser> _passwordHasher;

    public LoginController(AppUserDbContext context)
    {
      _context = context;
      _passwordHasher = new PasswordHasher<AppUser>();
    }

    [HttpPost("login")]
    public async Task<ActionResult<Login>> PostLogin([FromBody] AppUser appUser)
    {
      return Ok();
    }

    [HttpPost("register")]

    public async Task<ActionResult<Login>> PostRegister([FromBody] AppUser appUser)
    {
      var normalizedEmail = appUser.Email.Trim().ToUpperInvariant();
      var existingUser = await _context.Users.FirstOrDefaultAsync(x => x.Email == normalizedEmail);

      if (existingUser is not null)
      {
        return BadRequest(new { message = "Użytkownik o takim emailu już istnieje." });
      }

      var user = new AppUser
      {
        Id = Guid.NewGuid(),
        Email = appUser.Email.Trim(),
        NormalizedEmail = normalizedEmail,
        FullName = appUser.FullName?.Trim(),
        AuthProvider = "local",
        EmailConfirmed = false,
        CreatedAtUtc = DateTime.UtcNow
      };
      if (string.IsNullOrWhiteSpace(appUser.Password)) return BadRequest();
      user.Password = _passwordHasher.HashPassword(user, appUser.Password);
      
      _context.Users.Add(user);
      await _context.SaveChangesAsync();

      return Ok(new{message = "Rejestracja zakończona sukcesem.",email = user.Email});
    }
  }
}
