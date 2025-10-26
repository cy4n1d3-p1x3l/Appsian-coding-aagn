using System.Collections.Generic;
namespace ProjectManagerAPI.Models
{
    public class TaskItem
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public Guid ProjectId { get; set; }
        
        // New fields for scheduling
        public int? EstimatedHours { get; set; }
        public List<Guid> Dependencies { get; set; } = new List<Guid>();
    }
}
