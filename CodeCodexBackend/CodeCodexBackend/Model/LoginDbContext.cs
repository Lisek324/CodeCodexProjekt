using Microsoft.EntityFrameworkCore;

namespace CodeCodexBackend.Model
{
  public class LoginDbContext:DbContext
  {
    public LoginDbContext(DbContextOptions<LoginDbContext> options) : base(options)
    {

    }
    public DbSet<Login> Login { get; set; }
  }
}
