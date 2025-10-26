import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';
import { Project, Task, ScheduleResponse } from '../types';
import { Loader, ButtonLoader } from './Loader';
import './ProjectDetails.css';

// --- SVG Icons ---
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const IconList = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

// --- NEW ICON ---
const IconGitPullRequest = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle>
    <path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line>
  </svg>
);
// --- End SVG Icons ---

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskHours, setNewTaskHours] = useState('');
  const [newTaskDeps, setNewTaskDeps] = useState<string[]>([]);

  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  
  const [modalError, setModalError] = useState('');
  const [pageError, setPageError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  
  const username = authService.getUsername();

  useEffect(() => {
    if (id) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setPageError('');
    try {
      const projectData = await projectService.getProject(id!);
      setProject(projectData);
      const tasksData = await projectService.getProjectTasks(id!);
      setTasks(tasksData);
    } catch (err: any) {
      setPageError(err.message || 'Error fetching project details');
      if (err.message.includes('not found')) {
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);
    try {
      const hours = newTaskHours ? parseInt(newTaskHours, 10) : undefined;
      const newTask = await projectService.createTask(
        id!,
        newTaskTitle,
        newTaskDueDate || undefined,
        hours,
        newTaskDeps
      );
      setTasks([...tasks, newTask]);
      setShowTaskModal(false);
      // Reset form
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setNewTaskHours('');
      setNewTaskDeps([]);
    } catch (err: any) {
      setModalError(err.message || 'Failed to create task');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const updated = await projectService.updateTask(task.id, {
        isCompleted: !task.isCompleted,
      });
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch (err: any) {
      setPageError(err.message || 'Error updating task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await projectService.deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err: any) {
      setPageError(err.message || 'Error deleting task');
    }
  };
  
  const handleShowSchedule = async () => {
    setScheduleLoading(true);
    setShowScheduleModal(true);
    setModalError('');
    try {
      const scheduleData = await projectService.getSchedule(id!);
      setSchedule(scheduleData);
    } catch (err: any) {
      setModalError(err.message || 'Failed to generate schedule');
      setSchedule(null);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return <Loader fullPage />;
  }
  
  if (pageError && !project) {
    return <div className="error-message page-error">{pageError}</div>;
  }

  if (!project) {
      return <div className="error-message page-error">Project not found.</div>;
  }
  
  const availableDependencies = tasks.filter(t => !t.isCompleted);

  // --- NEW: Create a lookup map for task IDs to titles ---
  const taskTitleMap = new Map(tasks.map(t => [t.id, t.title]));

  return (
    <div className="project-details">
      <nav className="navbar">
        <div className="nav-left">
          <button onClick={() => navigate('/dashboard')} className="back-btn btn-icon">
            <IconArrowLeft /> Back
          </button>
          <h1 className="project-title-nav">{project.title}</h1>
        </div>
        <div className="nav-right">
          <span>{username}</span>
          <button onClick={handleLogout} className="logout-btn btn-icon">
            <IconLogout /> Logout
          </button>
        </div>
      </nav>

      <div className="project-content">
        {pageError && <div className="error-message page-error">{pageError}</div>}
        
        {project.description && (
          <div className="project-description">
            <h3>Description</h3>
            <p>{project.description}</p>
          </div>
        )}

        <div className="tasks-section">
          <div className="tasks-header">
            <h2>Tasks</h2>
            <div className="tasks-header-actions">
              <button onClick={handleShowSchedule} className="btn-secondary btn-icon">
                <IconList /> View Schedule
              </button>
              <button onClick={() => setShowTaskModal(true)} className="btn-primary btn-icon">
                <IconPlus /> Add Task
              </button>
            </div>
          </div>

          <div className="tasks-list">
            {tasks.length === 0 ? (
              <p className="no-tasks">
                No tasks yet. Add a task to get started!
              </p>
            ) : (
              tasks
                .sort((a,b) => (a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1) || a.title.localeCompare(b.title))
                .map((task) => (
                  <div key={task.id} className={`task-item ${task.isCompleted ? 'completed' : ''}`}>
                    <div className="task-main">
                      <input
                        type="checkbox"
                        id={`task-${task.id}`}
                        checked={task.isCompleted}
                        onChange={() => handleToggleComplete(task)}
                      />
                      <label htmlFor={`task-${task.id}`} className="task-title">
                        {task.title}
                      </label>
                    </div>
                    <div className="task-meta">
                      {/* --- NEW DEPENDENCY TAGS SECTION --- */}
                      {task.dependencies&& task.dependencies.length > 0 && (
                        <div className="task-dependency-tags">
                          {task.dependencies.map(depId => (
                            <small key={depId} className="task-tag dep-tag" title={`Depends on: ${taskTitleMap.get(depId)}`}>
                              <IconGitPullRequest /> {taskTitleMap.get(depId) || '...'}
                            </small>
                          ))}
                        </div>
                      )}
                      {/* --- END NEW SECTION --- */}

                      {task.estimatedHours && (
                        <small className="task-tag">
                          <IconClock /> {task.estimatedHours} hr(s)
                        </small>
                      )}
                      {task.dueDate && (
                        <small className="task-due">
                          <IconCalendar />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </small>
                      )}
                    </div>
                    <div className="task-actions">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="btn-delete btn-icon"
                        title="Delete task"
                      >
                        <IconTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Task</h3>
            <form onSubmit={handleCreateTask}>
              {modalError && <div className="error-message">{modalError}</div>}
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date (optional)</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                  <div className="form-group">
                  <label>Est. Hours (optional)</label>
                  <input
                    type="number"
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(e.target.value)}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
                <div className="form-group">
                <label>Dependencies (optional)</label>
                <select 
                  multiple 
                  value={newTaskDeps}
                  onChange={(e) => setNewTaskDeps(Array.from(e.target.selectedOptions, option => option.value))}
                  className="dependency-select"
                >
                  {availableDependencies.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
                <small className="field-hint">Hold Ctrl/Cmd to select multiple.</small>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={modalLoading} className="btn-primary btn-icon">
                  {modalLoading ? <ButtonLoader /> : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Schedule Modal */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Recommended Schedule</h3>
            {scheduleLoading ? (
              <Loader />
            ) : modalError ? (
              <div className="error-message">{modalError}</div>
            ) : schedule && (
              <div className="schedule-result">
                <h4>Total Estimated Hours: {schedule.totalEstimatedHours}</h4>
                <p>Tasks in recommended order of completion:</p>
                <ol className="schedule-list">
                  {schedule.recommendedOrder.map((title, index) => (
                    <li key={index}>{title}</li>
                  ))}
                </ol>
                {schedule.recommendedOrder.length === 0 && (
                  <p className="no-tasks">No tasks with estimated hours to schedule.</p>
                )}
              </div>
            )}
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
