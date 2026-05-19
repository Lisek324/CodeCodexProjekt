namespace CodeCodexBackend.Model
{
  using Microsoft.EntityFrameworkCore;
  public class TestDbContext:DbContext
  {
    public TestDbContext(DbContextOptions<TestDbContext>o):base(o)
    {

    }

    public DbSet<TestTable> Tests { get; set; }
  }
}
