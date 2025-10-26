export interface User {
  username: string;
  token: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
  projectId: string;
  estimatedHours?: number;
  dependencies: string[]; // List of Task IDs (Guids)
}

export interface AuthResponse {
  token: string;
  username: string;
}

export interface ScheduleResponse {
  recommendedOrder: string[];
  totalEstimatedHours: number;
  errorMessage?: string;
}
