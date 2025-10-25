import api from './api';
import { Project, Task } from '../types';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get<Project>(/projects/${id});
    return response.data;
  },

  async createProject(title: string, description?: string): Promise<Project> {
    const response = await api.post<Project>('/projects', {
      title,
      description,
    });
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(/projects/${id});
  },

  async getProjectTasks(projectId: string): Promise<Task[]> {
    const response = await api.get<Task[]>(/projects/${projectId}/tasks);
    return response.data;
  },

  async createTask(projectId: string, title: string, dueDate?: string): Promise<Task> {
    const response = await api.post<Task>(/projects/${projectId}/tasks, {
      title,
      dueDate,
    });
    return response.data;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const response = await api.put<Task>(/tasks/${id}, updates);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(/tasks/${id});
  },
};
