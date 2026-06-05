using Microsoft.EntityFrameworkCore;

namespace CodeCodexBackend.Model
{
  public class AppUserDbContext : DbContext
  {
    public AppUserDbContext(DbContextOptions<AppUserDbContext> o) : base(o)
    {

    }
    public DbSet<AppUser> Users { get; set; }
  }
}
