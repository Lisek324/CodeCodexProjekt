namespace CodeCodexBackend.Model
{
  public class UserCourses
  {
    public int id { get; set; }
    public Guid userId { get; set; }
    public int courseId { get; set; }
    public Courses Course { get; set; } = null!;
  }
}
