using CodeCodexBackend.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
  private readonly TestDbContext _context;

  public TestController(TestDbContext context)
  {
    _context = context;
  }

  [HttpGet("db")]
  public async Task<IActionResult> TestDb()
  {
    try
    {
      var conn = _context.Database.GetDbConnection();
      await conn.OpenAsync();

      return Ok(new
      {
        success = true,
        database = conn.Database,
        dataSource = conn.DataSource,
        state = conn.State.ToString()
      });
    }
    catch (Exception ex)
    {
      return StatusCode(500, new
      {
        success = false,
        message = ex.Message,
        innerMessage = ex.InnerException?.Message,
        details = ex.ToString()
      });
    }
  }
  //sprawdzenie czy testowa tabela jest widoczna
  [HttpGet("test-table")]
  public async Task<IActionResult> TestTable()
  {
    try
    {
      var exists = await _context.Database
    .SqlQueryRaw<bool>(@"
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                      AND table_name = 'testtable'
                ) AS ""Value""
            ")
    .FirstAsync();

      return Ok(new { exists });
    }
    catch (Exception ex)
    {
      return StatusCode(500, new { ex.Message });
    }
  }
}
