namespace CodeCodexBackend.Model
{
  public class AppUser
  {
    public Guid id { get; set; }
    public string? fullName { get; set; }
    public string email { get; set; } = string.Empty;
    public string normalizedEmail { get; set; } = string.Empty;
    public bool emailConfirmed { get; set; } = false;
    public string? googleSub { get; set; }
    public string? passwordHash { get; set; }
    public string? avatarUrl { get; set; }
    public string authProvider { get; set; } = "local";
    public DateTime createdAtUtc { get; set; }
    public DateTime? lastLoginAtUtc { get; set; }
  }
}
