using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using FlowAPI.DTOs;
using FlowAPI.Models;
using FlowAPI.Services;

var builder = WebApplication.CreateBuilder(args);
var jwtSecret = builder.Configuration["JwtSettings:Secret"]!;

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:3000")
                         .AllowAnyHeader()
                         .AllowAnyMethod()
                         .AllowCredentials());
});
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
 
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
var users = new List<User>();
var projects = new List<Project>();
var tasks = new List<TaskItem>();
var authService = new AuthService(jwtSecret, users);

app.MapPost("/api/auth/register", ([FromBody] RegisterDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
        return Results.BadRequest(new { message = "Username and password are required" });

    if (dto.Password.Length < 6)
        return Results.BadRequest(new { message = "Password must be at least 6 characters" });

    var user = authService.Register(dto.Username, dto.Password);
    if (user == null)
        return Results.BadRequest(new { message = "Username already exists" });

    var token = 
    authService.GenerateToken(user);
    return Results.Ok(new AuthResponseDto(token, user.Username));
});

app.MapPost("/api/auth/login", ([FromBody] LoginDto dto) =>
{
    var user = authService.Login(dto.Username, dto.Password);
    if (user == null)
        return Results.Unauthorized();

    var token = authService.GenerateToken(user);
    return Results.Ok(new AuthResponseDto(token, user.Username));
});
app.MapGet("/api/projects", [Authorize] (HttpContext context) =>
{
    var userId = Guid.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var userProjects = projects.Where(p => p.UserId == userId).ToList();
    return Results.Ok(userProjects);
});
app.MapPost("/api/projects", [Authorize] (HttpContext context, [FromBody] CreateProjectDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Title))
        return Results.BadRequest(new { message = "Title is required" });

    if (dto.Title.Length < 3 || dto.Title.Length > 100)
        return Results.BadRequest(new { message = "Title must be between 3 and 100 characters" });

    var userId = Guid.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    var project = new Project
    {
        Id = Guid.NewGuid(),
        Title = dto.Title,
 
        Description = dto.Description,
        CreatedAt = DateTime.UtcNow,
        UserId = userId
    };

    projects.Add(project);
    return Results.Created($"/api/projects/{project.Id}", project);
});
app.MapGet("/api/projects/{id}", [Authorize] (HttpContext context, Guid id) =>
{
    var userId = Guid.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var project = projects.FirstOrDefault(p => p.Id == id && p.UserId == userId);

    if (project == null)
        return Results.NotFound(new { message = "Project not found" });

    return Results.Ok(project);
});
app.MapDelete("/api/projects/{id}", [Authorize] (HttpContext context, Guid id) =>
{
    var userId = Guid.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var project = projects.FirstOrDefault(p => p.Id == id && p.UserId == userId);

    if (project == null)
        return Results.NotFound(new { message = "Project not found" });

    var projectTasks = tasks.Where(t => t.ProjectId == id).ToList();
    foreach (var task in projectTasks)
        tasks.Remove(task);

    projects.Remove(project);
    return Results.NoContent();
});
app.MapPost("/api/projects/{projectId}/tasks", [Authorize] (HttpContext context, Guid projectId, [FromBody] CreateTaskDto dto) =>
{
    var userId = Guid.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var project = projects.FirstOrDefault(p => p.Id == projectId && p.UserId == userId);

    if (project == null)
        return Results.NotFound(new { message = "Project not found" });

    if (string.IsNullOrWhiteSpace(dto.Title))
        return Results.BadRequest(new { message = "Title is required" });

    var task = new TaskItem
    {
        Id = Guid.NewGuid(),
   
         Title = dto.Title,
        DueDate = dto.DueDate,
        IsCompleted = false,
        ProjectId = projectId
    };

    tasks.Add(task);
    return Results.Created($"/api/tasks/{task.Id}", task);
});
app.MapGet("/api/projects/{projectId}/tasks", [Authorize] (HttpContext context, Guid projectId) =>
{
    var userId = Guid.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var project = projects.FirstOrDefault(p => p.Id == projectId && p.UserId == userId);

    if (project == null)
        return Results.NotFound(new { message = "Project not found" });

    var projectTasks = tasks.Where(t => t.ProjectId == projectId).ToList();
    return Results.Ok(projectTasks);
});
app.MapPut("/api/tasks/{id}", [Authorize] (HttpContext context, Guid id, [FromBody] UpdateTaskDto dto) =>
{
    var userId = Guid.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var task = tasks.FirstOrDefault(t => t.Id == id);

    if (task == null)
        return Results.NotFound(new { message = "Task not found" });

    var project = projects.FirstOrDefault(p => p.Id == task.ProjectId && p.UserId == userId);
    if (project == null)
        return Results.NotFound(new { message = "Task not found" });

    if (dto.Title != null)
     
       task.Title = dto.Title;
    if (dto.DueDate.HasValue)
        task.DueDate = dto.DueDate;
    if (dto.IsCompleted.HasValue)
        task.IsCompleted = dto.IsCompleted.Value;

    return Results.Ok(task);
});
app.MapDelete("/api/tasks/{id}", [Authorize] (HttpContext context, Guid id) =>
{
    var userId = Guid.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var task = tasks.FirstOrDefault(t => t.Id == id);

    if (task == null)
        return Results.NotFound(new { message = "Task not found" });

    var project = projects.FirstOrDefault(p => p.Id == task.ProjectId && p.UserId == userId);
    if (project == null)
        return Results.NotFound(new { message = "Task not found" });

    tasks.Remove(task);
    return Results.NoContent();
});
app.Run();
