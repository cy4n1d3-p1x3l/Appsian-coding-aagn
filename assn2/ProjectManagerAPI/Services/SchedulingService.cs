using ProjectManagerAPI.DTOs;
using ProjectManagerAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProjectManagerAPI.Services
{
    // Input DTO for the topological sort logic
    public record ScheduleTaskInput(
        string Id, // Using string for generality (can be Guid or Title)
        string Title,
        int EstimatedHours, 
        List<string> Dependencies
    );

    public class SchedulingService
    {
        public ScheduleResponseDto GetSchedule(List<ScheduleTaskInput> tasks)
        {
            var adj = new Dictionary<string, List<string>>();
            var inDegree = new Dictionary<string, int>();
            var taskMap = new Dictionary<string, ScheduleTaskInput>();

            foreach (var task in tasks)
            {
                adj[task.Id] = new List<string>();
                inDegree[task.Id] = 0;
                taskMap[task.Id] = task;
            }

            foreach (var task in tasks)
            {
                foreach (var depId in task.Dependencies)
                {
                    // Only add edge if dependency exists in the list
                    if (taskMap.ContainsKey(depId)) 
                    {
                        adj[depId].Add(task.Id);
                        inDegree[task.Id]++;
                    }
                }
            }

            var queue = new Queue<string>();
            foreach (var task in tasks)
            {
                if (inDegree[task.Id] == 0)
                {
                    queue.Enqueue(task.Id);
                }
            }

            var orderedList = new List<string>();
            var totalHours = 0;

            while (queue.Count > 0)
            {
                var taskId = queue.Dequeue();
                var task = taskMap[taskId];
                
                orderedList.Add(task.Title);
                totalHours += task.EstimatedHours;

                foreach (var neighborId in adj[taskId])
                {
                    inDegree[neighborId]--;
                    if (inDegree[neighborId] == 0)
                    {
                        queue.Enqueue(neighborId);
                    }
                }
            }

            if (orderedList.Count == tasks.Count)
            {
                return new ScheduleResponseDto(orderedList, totalHours, null);
            }
            else
            {
                return new ScheduleResponseDto(
                    new List<string>(), 
                    0, 
                    "Circular dependency detected. Cannot generate schedule."
                );
            }
        }

        // Helper to check for cycles when adding/updating a task
        public bool HasCircularDependency(
            Guid currentTaskId, 
            List<Guid> newDependencies, 
            List<TaskItem> allTasksInProject)
        {
            var taskMap = allTasksInProject.ToDictionary(t => t.Id);
            var visited = new HashSet<Guid>();
            var recursionStack = new HashSet<Guid>();

            // Temporarily update the dependencies for the task being checked
            if (taskMap.ContainsKey(currentTaskId))
            {
                taskMap[currentTaskId].Dependencies = newDependencies;
            }
            else
            {
                // This is a new task, add it to the map for checking
                taskMap[currentTaskId] = new TaskItem { Id = currentTaskId, Dependencies = newDependencies };
            }

            // We need to check for cycles starting from ALL nodes,
            // in case the new dependency creates a cycle far away.
            foreach (var task in taskMap.Values)
            {
                if (DetectCycleDfs(task.Id, taskMap, visited, recursionStack))
                    return true;
            }
            return false;
        }

        private bool DetectCycleDfs(
            Guid taskId, 
            Dictionary<Guid, TaskItem> taskMap, 
            HashSet<Guid> visited, 
            HashSet<Guid> recursionStack)
        {
            if (!taskMap.ContainsKey(taskId)) // Dependency points to a non-existent task
                return false;

            visited.Add(taskId);
            recursionStack.Add(taskId);

            foreach (var depId in taskMap[taskId].Dependencies)
            {
                if (!visited.Contains(depId))
                {
                    if (DetectCycleDfs(depId, taskMap, visited, recursionStack))
                        return true;
                }
                else if (recursionStack.Contains(depId))
                {
                    // Cycle detected
                    return true;
                }
            }

            recursionStack.Remove(taskId);
            return false;
        }
    }
}
