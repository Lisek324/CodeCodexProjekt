using CodeCodexBackend.Model;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

var allowedOrigins = new[]
{
    "http://localhost:4200",
    "https://render.com/"
}; 

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
  options.AddPolicy("frontend", policy =>
  {
    policy.WithOrigins(allowedOrigins)
          .AllowAnyHeader()
          .AllowAnyMethod();
  });
});
builder.Services
  .AddAuthentication(options =>
  {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
  })
.AddJwtBearer(options =>
 {
   options.TokenValidationParameters.ValidIssuer = builder.Configuration["Jwt:Issuer"];
   options.TokenValidationParameters.ValidAudience = builder.Configuration["Jwt:Audience"];
   options.TokenValidationParameters.IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!));
 });
builder.Services.AddDbContext<AppUserDbContext>(options =>options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
var app = builder.Build();

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
}

app.UseCors("frontend");
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
