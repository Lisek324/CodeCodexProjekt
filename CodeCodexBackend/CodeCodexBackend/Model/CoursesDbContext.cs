using Microsoft.EntityFrameworkCore;

namespace CodeCodexBackend.Model
{
  public class CoursesDbContext:DbContext
  {
    public CoursesDbContext(DbContextOptions<CoursesDbContext> options):base(options) { }
    public DbSet<Courses> Courses { get; set; }
  }
}
