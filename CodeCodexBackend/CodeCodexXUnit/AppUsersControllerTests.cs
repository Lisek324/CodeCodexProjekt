using CodeCodexBackend.Controllers;
using CodeCodexBackend.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

public class AppUsersControllerTests
{
  private AppUserDbContext CreateAppUserDbContext(string dbName)
  {
    var options = new DbContextOptionsBuilder<AppUserDbContext>()
        .UseInMemoryDatabase(dbName)
        .Options;

    return new AppUserDbContext(options);
  }

  private UserCoursesDbContext CreateUserCoursesDbContext(string dbName)
  {
    var options = new DbContextOptionsBuilder<UserCoursesDbContext>()
        .UseInMemoryDatabase(dbName)
        .Options;

    return new UserCoursesDbContext(options);
  }

  private CoursesDbContext CreateCoursesDbContext(string dbName)
  {
    var options = new DbContextOptionsBuilder<CoursesDbContext>()
        .UseInMemoryDatabase(dbName)
        .Options;

    return new CoursesDbContext(options);
  }

  private EnrollmentsDbContext CreateEnrollmentsDbContext(string dbName)
  {
    var options = new DbContextOptionsBuilder<EnrollmentsDbContext>()
        .UseInMemoryDatabase(dbName)
        .Options;

    return new EnrollmentsDbContext(options);
  }

  private OrdersDbContext CreateOrdersDbContext(string dbName)
  {
    var options = new DbContextOptionsBuilder<OrdersDbContext>()
        .UseInMemoryDatabase(dbName)
        .Options;

    return new OrdersDbContext(options);
  }

  private IConfiguration CreateConfiguration()
  {
    var settings = new Dictionary<string, string?>
    {
      ["Jwt:JwtSecretKey"] = "super_secret_test_key_123456789_super_secret",
      ["Jwt:Issuer"] = "test-issuer",
      ["Jwt:Audience"] = "test-audience",
      ["Jwt:ExpirationInMinutes"] = "60"
    };

    return new ConfigurationBuilder()
        .AddInMemoryCollection(settings)
        .Build();
  }

  private AppUsersController CreateController(
      AppUserDbContext userContext,
      UserCoursesDbContext? userCoursesContext = null,
      CoursesDbContext? coursesContext = null,
      EnrollmentsDbContext? enrollmentsContext = null,
      OrdersDbContext? ordersContext = null)
  {
    var loggerMock = new Mock<ILogger<AppUsersController>>();
    var configuration = CreateConfiguration();

    var controller = new AppUsersController(
        userContext,
        configuration,
        userCoursesContext ?? CreateUserCoursesDbContext(Guid.NewGuid().ToString()),
        coursesContext ?? CreateCoursesDbContext(Guid.NewGuid().ToString()),
        loggerMock.Object,
        enrollmentsContext ?? CreateEnrollmentsDbContext(Guid.NewGuid().ToString()),
        ordersContext ?? CreateOrdersDbContext(Guid.NewGuid().ToString())
    );

    controller.ControllerContext = new ControllerContext
    {
      HttpContext = new DefaultHttpContext()
    };

    return controller;
  }

  private static void SetUser(ControllerBase controller, Guid userId)
  {
    controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
      new ClaimsIdentity(
      [
        new Claim(ClaimTypes.NameIdentifier, userId.ToString())
      ], "TestAuth"));
  }

  [Fact]
  public async Task Register_WhenEmailAlreadyExists_ReturnsBadRequest()
  {
    var db = CreateAppUserDbContext(Guid.NewGuid().ToString());
    db.Users.Add(new AppUser
    {
      id = Guid.NewGuid(),
      email = "test@test.com",
      normalizedEmail = "TEST@TEST.COM",
      fullName = "Existing User",
      authProvider = "local",
      emailConfirmed = false,
      createdAtUtc = DateTime.UtcNow
    });
    await db.SaveChangesAsync();

    var controller = CreateController(db);

    var request = new RegisterRequest
    {
      email = "test@test.com",
      password = "Password123!",
      fullName = "Nowy User"
    };

    var result = await controller.Register(request);

    var badRequest = Assert.IsType<BadRequestObjectResult>(result);
    Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode);
    Assert.Single(db.Users);
  }

  [Fact]
  public async Task Register_WhenEmailIsUnique_CreatesUserAndReturnsOk()
  {
    var db = CreateAppUserDbContext(Guid.NewGuid().ToString());
    var controller = CreateController(db);

    var request = new RegisterRequest
    {
      email = "nowy@test.com",
      password = "Password123!",
      fullName = "Jan Kowalski"
    };

    var result = await controller.Register(request);

    var okResult = Assert.IsType<OkObjectResult>(result);

    var user = await db.Users.FirstOrDefaultAsync(x => x.normalizedEmail == "NOWY@TEST.COM");
    Assert.NotNull(user);
    Assert.Equal("nowy@test.com", user.email);
    Assert.Equal("NOWY@TEST.COM", user.normalizedEmail);
    Assert.Equal("Jan Kowalski", user.fullName);
    Assert.Equal("local", user.authProvider);
    Assert.False(user.emailConfirmed);
    Assert.False(string.IsNullOrWhiteSpace(user.passwordHash));
    Assert.False(string.IsNullOrWhiteSpace(user.refreshToken));
    Assert.True(user.refreshTokenExpiresAtUtc > DateTime.UtcNow);

    var response = Assert.IsType<AuthResponse>(okResult.Value);
    Assert.True(response.isLoggedIn);
    Assert.Equal("Jan Kowalski", response.fullName);
    Assert.False(string.IsNullOrWhiteSpace(response.accessToken));
  }

  [Fact]
  public async Task Login_WhenUserDoesNotExist_ReturnsBadRequest()
  {
    var db = CreateAppUserDbContext(Guid.NewGuid().ToString());
    var controller = CreateController(db);

    var result = await controller.Login(new LoginRequest
    {
      email = "missing@test.com",
      password = "Password123!"
    });

    var badRequest = Assert.IsType<BadRequestObjectResult>(result);
    Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode);
  }

  [Fact]
  public async Task Refresh_WhenCookieIsMissing_ReturnsUnauthorized()
  {
    var db = CreateAppUserDbContext(Guid.NewGuid().ToString());
    var controller = CreateController(db);

    var result = await controller.Refresh();

    var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
    Assert.Equal(StatusCodes.Status401Unauthorized, unauthorized.StatusCode);
  }

  [Fact]
  public async Task Refresh_WhenRefreshTokenIsInvalid_ReturnsUnauthorized()
  {
    var db = CreateAppUserDbContext(Guid.NewGuid().ToString());
    var controller = CreateController(db);
    controller.ControllerContext.HttpContext.Request.Headers.Cookie = "refreshToken=invalid-token";

    var result = await controller.Refresh();

    var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
    Assert.Equal(StatusCodes.Status401Unauthorized, unauthorized.StatusCode);
  }

  [Fact]
  public async Task GetMyCourses_WhenClaimIsMissing_ReturnsUnauthorized()
  {
    var userDb = CreateAppUserDbContext(Guid.NewGuid().ToString());
    var userCoursesDb = CreateUserCoursesDbContext(Guid.NewGuid().ToString());

    var controller = CreateController(userDb, userCoursesDb);

    var result = await controller.GetMyCourses();

    Assert.IsType<UnauthorizedResult>(result);
  }

  [Fact]
  public async Task GetMyCourses_WhenUserHasCourses_ReturnsOk()
  {
    var userId = Guid.NewGuid();

    var userDb = CreateAppUserDbContext(Guid.NewGuid().ToString());
    var userCoursesDb = CreateUserCoursesDbContext(Guid.NewGuid().ToString());
    var coursesDb = CreateCoursesDbContext(Guid.NewGuid().ToString());

    coursesDb.Courses.Add(new Courses
    {
      id = 10,
      name = "ASP.NET Core"
    });
    await coursesDb.SaveChangesAsync();

    userCoursesDb.UserCourses.Add(new UserCourses
    {
      userId = userId,
      courseId = 10
    });
    await userCoursesDb.SaveChangesAsync();

    var controller = CreateController(userDb, userCoursesDb, coursesDb);
    SetUser(controller, userId);

    var result = await controller.GetMyCourses();

    var ok = Assert.IsType<OkObjectResult>(result);
    Assert.NotNull(ok.Value);
  }

  [Fact]
  public async Task HasCourse_WhenClaimIsMissing_ReturnsUnauthorized()
  {
    var userDb = CreateAppUserDbContext(Guid.NewGuid().ToString());
    var userCoursesDb = CreateUserCoursesDbContext(Guid.NewGuid().ToString());

    var controller = CreateController(userDb, userCoursesDb);

    var result = await controller.hasCourse(1);

    Assert.IsType<UnauthorizedResult>(result.Result);
  }

  [Fact]
  public async Task HasCourse_WhenUserDoesNotHaveCourse_ReturnsFalse()
  {
    var userId = Guid.NewGuid();

    var userDb = CreateAppUserDbContext(Guid.NewGuid().ToString());
    var userCoursesDb = CreateUserCoursesDbContext(Guid.NewGuid().ToString());

    var controller = CreateController(userDb, userCoursesDb);
    SetUser(controller, userId);

    var result = await controller.hasCourse(99);

    var ok = Assert.IsType<OkObjectResult>(result.Result);
    Assert.Equal(false, ok.Value);
  }

  [Fact]
  public async Task HasCourse_WhenUserHasCourse_ReturnsTrue()
  {
    var userId = Guid.NewGuid();

    var userDb = CreateAppUserDbContext(Guid.NewGuid().ToString());
    var userCoursesDb = CreateUserCoursesDbContext(Guid.NewGuid().ToString());

    userCoursesDb.UserCourses.Add(new UserCourses
    {
      userId = userId,
      courseId = 5
    });
    await userCoursesDb.SaveChangesAsync();

    var controller = CreateController(userDb, userCoursesDb);
    SetUser(controller, userId);

    var result = await controller.hasCourse(5);

    var ok = Assert.IsType<OkObjectResult>(result.Result);
    Assert.Equal(true, ok.Value);
  }
}
