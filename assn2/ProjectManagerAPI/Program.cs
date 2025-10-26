using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ProjectManagerAPI.DTOs;
using ProjectManagerAPI.Models;
using ProjectManagerAPI.Services;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);
var jwtSecret = builder.Configuration["JwtSettings:Secret"]!;

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
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

// Register services
builder.Services.AddSingleton<SchedulingService>();

var app = builder.Build();

app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();

// In-memory data stores
var users = new List<User>();
var projects = new List<Project>();
var tasks = new List<TaskItem>();

// Instantiate services
var authService = new AuthService(jwtSecret, users);
var schedulingService = app.Services.GetRequiredService<SchedulingService>();

// Get User ID from HttpContext
Guid GetUserId(HttpContext context) => 
    Guid.Parse(context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

// Auth Endpoints
app.MapPost("/api/auth/register", ([FromBody] RegisterDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
        return Results.BadRequest(new { message = "Username and password are required" });

    if (dto.Password.Length < 6)
        return Results.BadRequest(new { message = "Password must be at least 6 characters" });

    var user = authService.Register(dto.Username, dto.Password);
    if (user == null)
        return Results.BadRequest(new { message = "Username already exists" });

    var token = authService.GenerateToken(user);
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

// Project Endpoints
app.MapGet("/api/projects", [Authorize] (HttpContext context) =>
{
    var userId = GetUserId(context);
    var userProjects = projects.Where(p => p.UserId == userId).ToList();
    return Results.Ok(userProjects);
});

app.MapPost("/api/projects", [Authorize] (HttpContext context, [FromBody] CreateProjectDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Title))
        return Results.BadRequest(new { message = "Title is required" });

    if (dto.Title.Length < 3 || dto.Title.Length > 100)
        return Results.BadRequest(new { message = "Title must be between 3 and 100 characters" });

    var userId = GetUserId(context);
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
    var userId = GetUserId(context);
    var project = projects.FirstOrDefault(p => p.Id == id && p.UserId == userId);
    return project == null 
        ? Results.NotFound(new { message = "Project not found" }) 
        : Results.Ok(project);
});

app.MapDelete("/api/projects/{id}", [Authorize] (HttpContext context, Guid id) =>
{
    var userId = GetUserId(context);
    var project = projects.FirstOrDefault(p => p.Id == id && p.UserId == userId);
    if (project == null)
        return Results.NotFound(new { message = "Project not found" });

    var projectTasks = tasks.Where(t => t.ProjectId == id).ToList();
    foreach (var task in projectTasks)
        tasks.Remove(task);

    projects.Remove(project);
    return Results.NoContent();
});

// Task Endpoints
app.MapPost("/api/projects/{projectId}/tasks", [Authorize] (HttpContext context, Guid projectId, [FromBody] CreateTaskDto dto) =>
{
    var userId = GetUserId(context);
    var project = projects.FirstOrDefault(p => p.Id == projectId && p.UserId == userId);
    if (project == null)
        return Results.NotFound(new { message = "Project not found" });

    if (string.IsNullOrWhiteSpace(dto.Title))
        return Results.BadRequest(new { message = "Title is required" });

    // Check for circular dependencies
    var newTaskId = Guid.NewGuid();
    var newDependencies = dto.Dependencies ?? new List<Guid>();
    var allTasksInProject = tasks.Where(t => t.ProjectId == projectId).ToList();
    
    if (schedulingService.HasCircularDependency(newTaskId, newDependencies, allTasksInProject))
    {
        return Results.BadRequest(new { message = "Circular dependency detected. Cannot create task." });
    }

    var task = new TaskItem
    {
        Id = newTaskId,
        Title = dto.Title,
        DueDate = dto.DueDate,
        IsCompleted = false,
        ProjectId = projectId,
        EstimatedHours = dto.EstimatedHours,
        Dependencies = newDependencies
    };
    tasks.Add(task);
    return Results.Created($"/api/tasks/{task.Id}", task);
});

app.MapGet("/api/projects/{projectId}/tasks", [Authorize] (HttpContext context, Guid projectId) =>
{
    var userId = GetUserId(context);
    var project = projects.FirstOrDefault(p => p.Id == projectId && p.UserId == userId);
    if (project == null)
        return Results.NotFound(new { message = "Project not found" });

    var projectTasks = tasks.Where(t => t.ProjectId == projectId).ToList();
    return Results.Ok(projectTasks);
});

app.MapPut("/api/tasks/{id}", [Authorize] (HttpContext context, Guid id, [FromBody] UpdateTaskDto dto) =>
{
    var userId = GetUserId(context);
    var task = tasks.FirstOrDefault(t => t.Id == id);
    if (task == null)
        return Results.NotFound(new { message = "Task not found" });

    var project = projects.FirstOrDefault(p => p.Id == task.ProjectId && p.UserId == userId);
    if (project == null)
        return Results.NotFound(new { message = "Task not found (unauthorized)" });

    // Check for circular dependencies if dependencies are being updated
    if (dto.Dependencies != null)
    {
        var allTasksInProject = tasks.Where(t => t.ProjectId == task.ProjectId).ToList();
        if (schedulingService.HasCircularDependency(task.Id, dto.Dependencies, allTasksInProject))
        {
            return Results.BadRequest(new { message = "Circular dependency detected. Cannot update task." });
        }
        task.Dependencies = dto.Dependencies;
    }

    if (dto.Title != null)
        task.Title = dto.Title;
    if (dto.DueDate.HasValue)
        task.DueDate = dto.DueDate;
    if (dto.IsCompleted.HasValue)
        task.IsCompleted = dto.IsCompleted.Value;
    if (dto.EstimatedHours.HasValue)
        task.EstimatedHours = dto.EstimatedHours;

    return Results.Ok(task);
});

app.MapDelete("/api/tasks/{id}", [Authorize] (HttpContext context, Guid id) =>
{
    var userId = GetUserId(context);
    var task = tasks.FirstOrDefault(t => t.Id == id);
    if (task == null)
        return Results.NotFound(new { message = "Task not found" });

    var project = projects.FirstOrDefault(p => p.Id == task.ProjectId && p.UserId == userId);
    if (project == null)
        return Results.NotFound(new { message = "Task not found (unauthorized)" });

    // Also remove this task from any other task's dependency list
    var dependentTasks = tasks.Where(t => t.ProjectId == task.ProjectId && t.Dependencies.Contains(id));
    foreach(var t in dependentTasks)
    {
        t.Dependencies.Remove(id);
    }
    
    tasks.Remove(task);
    return Results.NoContent();
});

// Scheduling Endpoint (as requested in assignment)
// This endpoint runs the scheduler on the *existing* tasks in the project.
app.MapPost("/api/projects/{projectId}/schedule", [Authorize] (HttpContext context, Guid projectId) =>
{
    var userId = GetUserId(context);
    var project = projects.FirstOrDefault(p => p.Id == projectId && p.UserId == userId);
    if (project == null)
        return Results.NotFound(new { message = "Project not found" });

    var projectTasks = tasks.Where(t => t.ProjectId == projectId).ToList();
    var taskMap = projectTasks.ToDictionary(t => t.Id);

    var schedulerInputs = projectTasks.Select(t => new ScheduleTaskInput(
        t.Id.ToString(),
        t.Title,
        t.EstimatedHours ?? 0,
        t.Dependencies.Select(depId => depId.ToString()).ToList()
    )).ToList();

    var result = schedulingService.GetSchedule(schedulerInputs);
    
    return result.ErrorMessage != null 
        ? Results.BadRequest(new { message = result.ErrorMessage })
        : Results.Ok(result);
});


app.Run();
