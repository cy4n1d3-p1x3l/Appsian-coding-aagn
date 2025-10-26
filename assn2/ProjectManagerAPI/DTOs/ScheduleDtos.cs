using System.Collections.Generic;

namespace ProjectManagerAPI.DTOs
{
    // This DTO is for the user's "Smart Scheduler API" example
    // where tasks are passed in the body.
    public record ScheduleTaskDto(
        string Title, 
        int EstimatedHours, 
        List<string> Dependencies
    );

    public record ScheduleRequestDto(List<ScheduleTaskDto> Tasks);
    
    // This is the response for scheduling
    public record ScheduleResponseDto(
        List<string> RecommendedOrder, 
        int TotalEstimatedHours,
        string? ErrorMessage
    );
}
