namespace CodeCodexBackend.Model
{
  public class AuthResponse
  {
    public string message { get; set; } = string.Empty;
    public bool isLoggedIn { get; set; } = false;
    public Guid userId { get; set; }
    public string email { get; set; } = string.Empty;
    public string? fullName { get; set; }
    public string? accessToken { get; set; }
    public string? avatarUrl { get; set; }
  }
}
