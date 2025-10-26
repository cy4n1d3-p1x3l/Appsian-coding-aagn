using System;
using System.Collections.Generic;

namespace ProjectManagerAPI.DTOs
{
    public record CreateTaskDto(
        string Title, 
        DateTime? DueDate, 
        int? EstimatedHours, 
        List<Guid>? Dependencies
    );
    
    public record UpdateTaskDto(
        string? Title, 
        DateTime? DueDate, 
        bool? IsCompleted, 
        int? EstimatedHours, 
        List<Guid>? Dependencies
    );
}
