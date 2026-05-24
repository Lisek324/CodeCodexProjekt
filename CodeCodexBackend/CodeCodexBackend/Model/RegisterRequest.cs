namespace CodeCodexBackend.Model
{
  public class RegisterRequest
  {
    public string email { get; set; } = string.Empty;
    public string password { get; set; } = string.Empty;
    public string? fullName { get; set; }
  }
}
