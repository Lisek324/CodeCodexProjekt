using CodeCodexBackend.Model;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.ObjectModelRemoting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CodeCodexBackend.Controllers
{
  [Route("api/")]
  [ApiController]
  public class AppUsersController : ControllerBase
  {
    private readonly AppUserDbContext _context;
    private readonly PasswordHasher<AppUser> _passwordHasher;
    private readonly IConfiguration _configuration;

    public AppUsersController(AppUserDbContext context, IConfiguration configuration)
    {
      _context = context;
      _passwordHasher = new PasswordHasher<AppUser>();
      _configuration = configuration;
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

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest glr)
    {
      var settings = new GoogleJsonWebSignature.ValidationSettings()
      {
        Audience = new[] { _configuration["Authentication:Google:ClientId"] }
      };
      

      var payload = await GoogleJsonWebSignature.ValidateAsync(glr.credentials, settings);
      var normalizedEmail = payload.Email.Trim().ToUpperInvariant();
      //tutaj porównać emailem z googlea oraz z bazy cyz istnieje!
      var user = await _context.Users.FirstOrDefaultAsync(x => x.googleSub == payload.Subject || x.normalizedEmail == normalizedEmail);

      if (user == null)
      {
        user = new AppUser
        {
          id = Guid.NewGuid(),
          email = payload.Email,
          normalizedEmail = normalizedEmail,
          fullName = payload.Name,
          avatarUrl = payload.Picture,
          googleSub = payload.Subject,
          authProvider = "google",
          emailConfirmed = true,
          createdAtUtc = DateTime.UtcNow,
          lastLoginAtUtc = DateTime.UtcNow
        };

        _context.Users.Add(user);
      }
      else///jeśli istnieje, zakutalizuj jego dane
      {
          user.fullName = payload.Name;
          user.avatarUrl = payload.Picture;
          user.lastLoginAtUtc = DateTime.UtcNow;

          if (string.IsNullOrWhiteSpace(user.googleSub))
            user.googleSub = payload.Subject;

          if (string.IsNullOrWhiteSpace(user.authProvider))
            user.authProvider = "google";
      }
      await _context.SaveChangesAsync();
      return Ok(new { success = true, message = "Zalogowano pomyślnie" });
    }
  }
}
