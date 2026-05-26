using CodeCodexBackend.Model;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.ObjectModelRemoting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace CodeCodexBackend.Controllers
{
  [Route("api/")]
  [ApiController]
  public class AppUsersController : ControllerBase
  {
    private readonly AppUserDbContext _context;
    private readonly UserCoursesDbContext _userCoursesContext;
    private readonly PasswordHasher<AppUser> _passwordHasher;
    private readonly IConfiguration _configuration;

    public AppUsersController(AppUserDbContext context, IConfiguration configuration,UserCoursesDbContext userCoursesContext)
    {
      _context = context;                       //Users
      _userCoursesContext = userCoursesContext; //UserCourses
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

      var token = GenerateJwtToken(user);
      var _refreshToken = CreateRefreshToken();

      user.refreshToken = _refreshToken;
      user.refreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(7);

      Response.Cookies.Append("refreshToken", _refreshToken, new CookieOptions
      {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = DateTimeOffset.UtcNow.AddDays(7),
        Path = "/"
      });

      return Ok(new AuthResponse{ message = "Rejestracja zakończona sukcesem.", isLoggedIn = true, accessToken = token });
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
      var token = GenerateJwtToken(user);
      var _refreshToken = CreateRefreshToken();

      user.refreshToken = _refreshToken;
      user.refreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(7);

      Response.Cookies.Append("refreshToken", _refreshToken, new CookieOptions
      {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = DateTimeOffset.UtcNow.AddDays(7),
        Path = "/"
      });

      await _context.SaveChangesAsync();
      return Ok(new AuthResponse { message = "Zalogowano pomyślnie.", isLoggedIn = true, accessToken = token });
    }
 

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {


      var normalizedEmailVar = request.email.Trim().ToUpperInvariant();
      var user = await _context.Users.FirstOrDefaultAsync(x => x.normalizedEmail == normalizedEmailVar);
      if (user is null || user.passwordHash == null)
      {
        return BadRequest(new { message = "Login lub hasło jest niepoprawne" });
      }
      var result = _passwordHasher.VerifyHashedPassword(user, user.passwordHash, request.password);
      if (result == PasswordVerificationResult.Failed)
      {
        return BadRequest(new { message = "Login lub hasło jest niepoprawne" });
      }

      user.lastLoginAtUtc = DateTime.UtcNow;
      await _context.SaveChangesAsync();

      var token = GenerateJwtToken(user);
      var _refreshToken = CreateRefreshToken();

      user.refreshToken = _refreshToken;
      user.refreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(7);

      Response.Cookies.Append("refreshToken", _refreshToken, new CookieOptions
      {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = DateTimeOffset.UtcNow.AddDays(7),
        Path = "/"
      });

      return Ok(new AuthResponse{ message = "Zalogowano pomyślnie.", isLoggedIn = true, accessToken = token });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
      if (Request.Cookies.TryGetValue("refreshToken", out var _refreshToken))
      {
        var user = await _context.Users.FirstOrDefaultAsync(x => x.refreshToken == _refreshToken);

        if (user is not null)
        {
          user.refreshToken = null;
          user.refreshTokenExpiresAtUtc = null;
          await _context.SaveChangesAsync();
        }
      }

      Response.Cookies.Delete("refreshToken", new CookieOptions
      {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Path = "/"
      });

      return Ok(new { message = "Wylogowano." });
    }

    [HttpGet("my-courses")]
    [Authorize]
    public async Task<IActionResult> GetMyCourses()
    {
      var userIdVal = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

      if (string.IsNullOrWhiteSpace(userIdVal)) return Unauthorized();

      var userGuid = Guid.Parse(userIdVal);

      var courses = await _userCoursesContext.UserCourses.Where(x => x.userId == userGuid)
        .Select(x => new
        {
          x.Course.name ///zwróć nazwy oraz je wyświetl 
        }).ToListAsync();

      return Ok(courses);
    }

    private string GenerateJwtToken(AppUser user)
    {
      var jwtKey = _configuration["Jwt:SecretKey"];

      var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!));
      var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
      List<Claim> claims =
      [
          new (Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames.Sub, user.id.ToString()),
          new (Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames.Email, user.email),
          new ("fullName", user.fullName??""),
          new ("authProvider", user.authProvider ?? "local")
      ];

      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("Jwt:ExpirationInMinutes")),
        SigningCredentials = credentials,
        Issuer = _configuration["Jwt:Issuer"],
        Audience = _configuration["Jwt:Audience"]
      };

      var tokenHandler = new JsonWebTokenHandler();
      string accessToken = tokenHandler.CreateToken(tokenDescriptor);

      return accessToken;
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
      if (!Request.Cookies.TryGetValue("refreshToken", out var _refreshToken))
        return Unauthorized(new { message = "Brak refresh tokena." });

      var user = await _context.Users
          .FirstOrDefaultAsync(x =>
              x.refreshToken == _refreshToken &&
              x.refreshTokenExpiresAtUtc > DateTime.UtcNow);

      if (user is null)
        return Unauthorized(new { message = "Nieprawidłowy refresh token." });

      var newAccessToken = GenerateJwtToken(user);
      var newRefreshToken = CreateRefreshToken();

      user.refreshToken = newRefreshToken;
      user.refreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(7);

      await _context.SaveChangesAsync();

      Response.Cookies.Append("refreshToken", newRefreshToken, new CookieOptions
      {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = DateTimeOffset.UtcNow.AddDays(7),
        Path = "/"
      });

      return Ok(new AuthResponse
      {
        accessToken = newAccessToken,
        fullName = user.fullName ?? user.email,
        email = user.email
      });
    }
    public string CreateRefreshToken()
    {
      var bytes = RandomNumberGenerator.GetBytes(64);
      return Convert.ToBase64String(bytes);
    }
  }
}
