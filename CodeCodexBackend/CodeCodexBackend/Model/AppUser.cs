namespace CodeCodexBackend.Model
{
  public class AppUser
  {
    public Guid Id { get; set; }
    public string? FullName { get; set; }
    public string Email { get; set; } = string.Empty;
    public string NormalizedEmail { get; set; } = string.Empty;
    public bool EmailConfirmed { get; set; } = false;
    public string? GoogleSub { get; set; }
    public string? AvatarUrl { get; set; }
    public string AuthProvider { get; set; } = "local";
    public DateTime CreatedAtUtc { get; set; }
    public string? Password { get; set; }
    public DateTime? LastLoginAt { get; set; }
  }
}
