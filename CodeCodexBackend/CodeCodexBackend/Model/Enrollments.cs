using Stripe;

namespace CodeCodexBackend.Model
{
  public class Enrollments
  {
    public long id { get; set; }
    public Guid userId { get; set; }
    public int courseId { get; set; }
    public DateTime createdAtUtc { get; set; } = DateTime.UtcNow;
    public AppUser user { get; set; } = null!;
    public Courses course { get; set; } = null!;
  }
}
