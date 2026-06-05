using Microsoft.EntityFrameworkCore;

namespace CodeCodexBackend.Model
{
  public class UserCoursesDbContext : DbContext
  {
    public UserCoursesDbContext(DbContextOptions<UserCoursesDbContext> o) : base(o)
    {

    }
    public DbSet<UserCourses> UserCourses { get; set; }
  }
}
