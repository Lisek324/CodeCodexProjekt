using Microsoft.EntityFrameworkCore;

namespace CodeCodexBackend.Model
{
  public class EnrollmentsDbContext:DbContext
  {
    public EnrollmentsDbContext(DbContextOptions<EnrollmentsDbContext> options) : base(options) { }
    public DbSet<Enrollments> Enrollments { get; set; }
  }
}
