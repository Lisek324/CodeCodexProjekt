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
using Stripe;
using Stripe.BillingPortal;
using Stripe.Checkout;
using Stripe.Climate;
using Stripe.Forwarding;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
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
    private readonly ILogger<AppUsersController> _logger;
    private readonly AppUserDbContext _context;
    private readonly OrdersDbContext _OrdersContext;
    private readonly EnrollmentsDbContext _EnrollmentsContext;
    private readonly CoursesDbContext _coursesDbContext;
    private readonly UserCoursesDbContext _userCoursesContext;
    private readonly PasswordHasher<AppUser> _passwordHasher;
    private readonly IConfiguration _configuration;

    public AppUsersController(AppUserDbContext context, IConfiguration configuration, UserCoursesDbContext userCoursesContext, CoursesDbContext coursesDbContext, ILogger<AppUsersController> logger,
      EnrollmentsDbContext enrollmentsDbContext, OrdersDbContext ordersDbContext)
    {
      _context = context;                       //Users
      _userCoursesContext = userCoursesContext; //UserCourses
      _coursesDbContext = coursesDbContext;     //Courses
      _OrdersContext = ordersDbContext;         //Orders
      _EnrollmentsContext = enrollmentsDbContext;//Enrollments
      _passwordHasher = new PasswordHasher<AppUser>();
      _logger = logger;
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

      return Ok(new AuthResponse { message = "Rejestracja zakończona sukcesem.", isLoggedIn = true, accessToken = token, fullName = user.fullName });
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
      return Ok(new AuthResponse { message = "Zalogowano pomyślnie.", isLoggedIn = true, accessToken = token, avatarUrl = user.avatarUrl, fullName = user.fullName });
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
      return Ok(new AuthResponse { message = "Zalogowano pomyślnie.", isLoggedIn = true, accessToken = token, fullName = user.fullName });
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
          x.Course.name, ///zwróć nazwy oraz je wyświetl
          x.Course.id
        }).ToListAsync();

      return Ok(courses);
    }

    [Authorize]
    [HttpGet("has-course/{courseId}")]
    public async Task<ActionResult<bool>> hasCourse(int courseId)
    {
      var userIdVal = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
      
      if (string.IsNullOrEmpty(userIdVal))
        return Unauthorized();
      var userGuid = Guid.Parse(userIdVal);
      var hasCourse = await _userCoursesContext.UserCourses.AnyAsync(uc => uc.userId == userGuid && uc.courseId == courseId);

      return Ok(hasCourse);
    }

    private string GenerateJwtToken(AppUser user)
    {
      var jwtKey = _configuration["Jwt:JwtSecretKey"];

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
        SameSite = SameSiteMode.None,
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

    [HttpPost("create-checkout-session")]
    [Authorize]
    public async Task<IActionResult> BuyAsync([FromBody] BuyCourseRequest course)
    {

      var dbCourse = await _coursesDbContext.Courses.FindAsync(course.courseId);
      var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
      // jeśli trzymasz GUID w NameIdentifier:
      if(userIdString == null) return NotFound();
      if (dbCourse == null) return NotFound();

      var userId = Guid.Parse(userIdString);

      var order = new Orders
      {
        userId = userId,
        courseId = dbCourse.id,
        amount = dbCourse.price,    
        currency = "pln",
        status = "Pending",
        createdAtUtc = DateTime.UtcNow
      };

      _OrdersContext.Orders.Add(order);
      await _OrdersContext.SaveChangesAsync();

      var options = new Stripe.Checkout.SessionCreateOptions
      {
        Mode = "payment",
        SuccessUrl = "http://localhost:4200/payment-success?session_id={CHECKOUT_SESSION_ID}",
        CancelUrl = "http://localhost:4200/payment-cancel",
        LineItems = new List<SessionLineItemOptions>
        {
          new()
          {
            Quantity = 1,
            PriceData = new Stripe.Checkout.SessionLineItemPriceDataOptions
            {
              Currency = "pln",
              UnitAmount = (long)(dbCourse.price*100),
              ProductData  = new SessionLineItemPriceDataProductDataOptions
              {
                Name = dbCourse.name
              }
            }
          }
        },
        Metadata = new Dictionary<string, string>
        {
          ["orderId"] = order.id.ToString(),
          ["courseId"] = dbCourse.id.ToString(),
          ["userId"] = userId.ToString()
        }
      };
      var service = new Stripe.Checkout.SessionService();
      var session = await service.CreateAsync(options);

      return Ok(new { url = session.Url });
    }

    public string CreateRefreshToken()
    {
      var bytes = RandomNumberGenerator.GetBytes(64);
      return Convert.ToBase64String(bytes);
    }
    [HttpPost("webhook")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> StripeWebhook()
    {
      string json;
      string stripeSignature;

      try
      {
        using var reader = new StreamReader(HttpContext.Request.Body, Encoding.UTF8);
        json = await reader.ReadToEndAsync();
        stripeSignature = Request.Headers["Stripe-Signature"].ToString();

      }
      catch (Exception ex)
      {
        return BadRequest("Failed to read request body.");
      }

      Event stripeEvent;

      try
      {
        var webhookSecret = _configuration["Stripe:WebhookSecret"];

        if (string.IsNullOrWhiteSpace(webhookSecret))
        {
          return StatusCode(500, "Webhook secret is not configured.");
        }

        stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, webhookSecret);
      }
      catch (StripeException ex)
      {
        return BadRequest("Invalid Stripe signature.");
      }
      catch (Exception ex)
      {
        return BadRequest("Invalid webhook payload.");
      }

      try
      {
        if (stripeEvent.Type != EventTypes.CheckoutSessionCompleted)
        {
          return Ok();
        }

        var session = stripeEvent.Data.Object as Stripe.Checkout.Session;

        if (session == null)
        {
          return Ok();
        }
        if (session.Metadata == null)
        {
          return BadRequest("Session metadata is null.");
        }

        if (!session.Metadata.TryGetValue("orderId", out var orderIdRaw))
        {
          return BadRequest("Missing orderId in metadata.");
        }

        if (!long.TryParse(orderIdRaw, out var orderId))
        {
          return BadRequest("Invalid orderId.");
        }

        var order = await _OrdersContext.Orders
            .FirstOrDefaultAsync(x => x.id == orderId);

        if (order == null)
        {
          return NotFound("Order not found.");
        }

        if (order.status == "Paid")
        {
          return Ok();
        }

        order.status = "Paid";
        order.stripeSessionId = session.Id;
        order.stripePaymentIntentId = session.PaymentIntentId;
        await _OrdersContext.SaveChangesAsync();

        var alreadyEnrolled = await _EnrollmentsContext.Enrollments.AnyAsync(x => x.userId == order.userId && x.courseId == order.courseId);
        if (!alreadyEnrolled)
        {
          _EnrollmentsContext.Enrollments.Add(new Enrollments
          {
            userId = order.userId,
            courseId = order.courseId,
            createdAtUtc = DateTime.UtcNow
          });
          await _EnrollmentsContext.SaveChangesAsync();
        }

        var alreadyInUserCourses = await _userCoursesContext.UserCourses.AnyAsync(x => x.userId == order.userId && x.courseId == order.courseId);

        if (!alreadyInUserCourses)
        {
          _userCoursesContext.UserCourses.Add(new UserCourses
          {
            userId = order.userId,
            courseId = order.courseId
          });
          await _userCoursesContext.SaveChangesAsync();
        }
        return Ok();
      }
      catch (DbUpdateException ex)
      {
        return StatusCode(500, new
        {
          error = "Database update failed",
          message = ex.Message,
          inner = ex.InnerException?.Message
        });
      }
      catch (Exception ex)
      {
        return StatusCode(500, new
        {
          error = "Unhandled webhook error",
          message = ex.Message,
          inner = ex.InnerException?.Message,
          stackTrace = ex.StackTrace
        });
      }
    }
  }
}

