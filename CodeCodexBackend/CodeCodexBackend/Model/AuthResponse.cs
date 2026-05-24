namespace CodeCodexBackend.Model
{
  public class AuthResponse
  {
    public string message { get; set; } = string.Empty;
    public Guid userId { get; set; }
    public string email { get; set; } = string.Empty;
    public string? fullName { get; set; }
    public string? token { get; set; }
  }
}
