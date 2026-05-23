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
  [Route("api/AppUsers")]
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

    // GET: api/AppUsers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers()
    {
      return await _context.Users.ToListAsync();
    }

    // GET: api/AppUsers/5
    [HttpGet("{id}")]
    public async Task<ActionResult<AppUser>> GetAppUser(Guid id)
    {
      var appUser = await _context.Users.FindAsync(id);

      if (appUser == null)
      {
        return NotFound();
      }

      return appUser;
    }

    // PUT: api/AppUsers/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutAppUser(Guid id, AppUser appUser)
    {
      if (id != appUser.id)
      {
        return BadRequest();
      }

      _context.Entry(appUser).State = EntityState.Modified;

      try
      {
        await _context.SaveChangesAsync();
      }
      catch (DbUpdateConcurrencyException)
      {
        if (!AppUserExists(id))
        {
          return NotFound();
        }
        else
        {
          throw;
        }
      }

      return NoContent();
    }

    // POST: api/AppUsers
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<AppUser>> PostAppUser(AppUser appUser)
    {
      var normalizedEmailVar = appUser.email.Trim().ToUpperInvariant();
      var existingUser = await _context.Users.FirstOrDefaultAsync(x => x.normalizedEmail == normalizedEmailVar);

      if (existingUser is not null)
      {
        return BadRequest(new { message = "Użytkownik o takim emailu już istnieje." });
      }

      var user = new AppUser
      {
        id = Guid.NewGuid(),
        email = appUser.email.Trim(),
        normalizedEmail = normalizedEmailVar,
        fullName = appUser.fullName?.Trim(),
        authProvider = "local",
        emailConfirmed = false,
        createdAtUtc = DateTime.UtcNow
      };
      if (string.IsNullOrWhiteSpace(appUser.passwordHash)) return BadRequest();
      user.passwordHash = _passwordHasher.HashPassword(user, appUser.passwordHash);

      _context.Users.Add(user);
      await _context.SaveChangesAsync();

      return Ok(new { message = "Rejestracja zakończona sukcesem.", email = user.email });
    }

    // DELETE: api/AppUsers/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAppUser(Guid id)
    {
      var appUser = await _context.Users.FindAsync(id);
      if (appUser == null)
      {
        return NotFound();
      }

      _context.Users.Remove(appUser);
      await _context.SaveChangesAsync();

      return NoContent();
    }

    private bool AppUserExists(Guid id)
    {
      return _context.Users.Any(e => e.id == id);
    }
  }
}
