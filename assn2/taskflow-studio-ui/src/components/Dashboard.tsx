import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';
import { Project } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const username = authService.getUsername();
  useEffect(() => {
    fetchProjects();
  }, []);
  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };
  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const newProject = await projectService.createProject(
        newProjectTitle,
        newProjectDesc || undefined
      );
      setProjects([...projects, newProject]);
      setShowModal(false);
      setNewProjectTitle('');
      setNewProjectDesc('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectService.deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>TaskFlow Studio</h1>
        <div className="nav-right">
          <span>Welcome, {username}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
   
           <div className="dashboard-header">
          <h2>My Workspaces</h2>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Start New Flow
          </button>
        </div>

        <div className="projects-grid">
          {projects.length === 0 ? (
            <p className="no-projects">
 
               No workspaces yet. Create your first Flow to get started!
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
          
                 className="project-card"
                onClick={() => navigate(/projects/${project.id})}
              >
                <h3>{project.title}</h3>
                {project.description && <p>{project.description}</p>}
                <div className="card-footer">
           
                   <small>
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </small>
                  <button
                    onClick={(e) => {
             
                       e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="btn-delete"
                  >
                    Delete Flow
                  </button>
                </div>
        
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Flow</h3>
          
            <form onSubmit={handleCreateProject}>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label>Flow Title *</label>
                <input
                  type="text"
             
                   value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
         
                 <div className="form-group">
                <label>Flow Goal/Description (optional)</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows={4}
     
                   maxLength={500}
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
'Creating...' : 'Create Flow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
