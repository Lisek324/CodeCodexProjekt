using Stripe;

namespace CodeCodexBackend.Model
{
  public class Orders
  {
    public long id { get; set; }
    public Guid userId { get; set; }
    public int courseId { get; set; }
    public decimal amount { get; set; }
    public string currency { get; set; } = "pln";
    public string status { get; set; } = "Pending";
    public string? stripeSessionId { get; set; }
    public string? stripePaymentIntentId { get; set; }
    public DateTime createdAtUtc { get; set; } = DateTime.UtcNow;

    public AppUser user { get; set; } = null!;
    public Courses course { get; set; } = null!;
  }
}
