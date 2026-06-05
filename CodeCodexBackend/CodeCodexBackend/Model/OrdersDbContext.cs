using Microsoft.EntityFrameworkCore;

namespace CodeCodexBackend.Model
{
  public class OrdersDbContext : DbContext
  {
    public OrdersDbContext(DbContextOptions<OrdersDbContext> options) : base(options) { }
    public DbSet<Orders> Orders { get; set; }
  }
}
