namespace FlowAPI.DTOs
{
    public record CreateTaskDto(string Title, DateTime? DueDate);
    public record UpdateTaskDto(string? Title, DateTime? DueDate, bool? IsCompleted);
}
