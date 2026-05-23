using Microsoft.EntityFrameworkCore;

namespace CodeCodexBackend.Model
{
  public class RegisterDbContext:DbContext
  {
    public RegisterDbContext(DbContextOptions<LoginDbContext> options) : base(options) { }
    public DbSet<Register> Register { get; set; }
  }
}
