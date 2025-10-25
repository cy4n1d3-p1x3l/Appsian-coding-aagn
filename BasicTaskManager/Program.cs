using BasicTaskManager.Models;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactClientPolicy",
        policy => policy.WithOrigins("http://localhost:3000")
                         .AllowAnyHeader()
                         .AllowAnyMethod());
});

var app = builder.Build();
app.UseCors("ReactClientPolicy");

var taskCollection = new List<TaskItem>();

app.MapGet("/api/tasks", () => Results.Ok(taskCollection));

app.MapPost("/api/tasks", ([FromBody] TaskCreationDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Description))
        return Results.BadRequest(new { error = "Task description cannot be empty." });
    
    var newTask = new TaskItem 
    { 
        Id = Guid.NewGuid(), 
        Description = dto.Description, 
        IsCompleted = false 
    };
    
    taskCollection.Add(newTask);
    return Results.Created($"/api/tasks/{newTask.Id}", newTask);
});

app.MapPut("/api/tasks/{id}", (Guid id, [FromBody] TaskStatusDto dto) =>
{
    var existingTask = taskCollection.FirstOrDefault(item => item.Id == id);
    if (existingTask == null) 
        return Results.NotFound(new { error = "Requested task does not exist." });
    
    existingTask.IsCompleted = dto.IsCompleted;
    return Results.Ok(existingTask);
});

app.MapDelete("/api/tasks/{id}", (Guid id) =>
{
    var taskToRemove = taskCollection.FirstOrDefault(item => item.Id == id);
    if (taskToRemove == null) 
        return Results.NotFound(new { error = "Task not found in collection." });
    
    taskCollection.Remove(taskToRemove);
    return Results.NoContent();
});

app.Run();

public record TaskCreationDto(string Description);
public record TaskStatusDto(bool IsCompleted);
