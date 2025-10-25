namespace FlowAPI.DTOs
{
    public record CreateProjectDto(string Title, string? Description);
    public record UpdateProjectDto(string Title, string? Description);
}
