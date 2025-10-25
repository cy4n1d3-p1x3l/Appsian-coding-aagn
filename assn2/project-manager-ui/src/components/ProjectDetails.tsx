import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';
import { Project, Task } from '../types';
import './ProjectDetails.css';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const username = authService.getUsername();

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchTasks();
    }
  }, [id]);
  const fetchProject = async () => {
    try {
      const data = await projectService.getProject(id!);
      setProject(data);
    } catch (err) {
      console.error('Error fetching project:', err);
      navigate('/dashboard');
    }
  };
  const fetchTasks = async () => {
    try {
      const data = await projectService.getProjectTasks(id!);
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };
  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const newTask = await projectService.createTask(
        id!,
        newTaskTitle,
        newTaskDueDate || undefined
      );
      setTasks([...tasks, newTask]);
      setShowModal(false);
      setNewTaskTitle('');
      setNewTaskDueDate('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };
  const handleToggleComplete = async (task: Task) => {
    try {
      const updated = await projectService.updateTask(task.id, {
        isCompleted: !task.isCompleted,
      });
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await projectService.deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="project-details">
      <nav className="navbar">
        <div className="nav-left">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Back
          </button>
          <h1>{project.title}</h1>
        </div>
        <div className="nav-right">
          <span>Welcome, {username}</span>
 
             <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="project-content">
        {project.description && (
          <div className="project-description">
            <h3>Description</h3>
            <p>{project.description}</p>
 
             </div>
        )}

        <div className="tasks-section">
          <div className="tasks-header">
            <h2>Tasks</h2>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              + Add Task
            </button>
       
           </div>

          <div className="tasks-list">
            {tasks.length === 0 ?
 (
              <p className="no-tasks">
                No tasks yet. Add a task to get started!
              </p>
            ) : (
              tasks.map((task) => (
                <div 
 key={task.id} className="task-item">
                  <div className="task-main">
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                
                     onChange={() => handleToggleComplete(task)}
                    />
                    <span className={task.isCompleted ? 'completed' : ''}>
                      {task.title}
                    </span>
     
                   </div>
                  <div className="task-actions">
                    {task.dueDate && (
                      <small>
                        
                         Due: {new Date(task.dueDate).toLocaleDateString()}
                      </small>
                    )}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
            
                       className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
          
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
          
             <h3>Add New Task</h3>
            <form onSubmit={handleCreateTask}>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label>Task Title *</label>
                <input
                 
                   type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>
             
                 <div className="form-group">
                <label>Due Date (optional)</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
        
                 />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
         
                   className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ?
'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
