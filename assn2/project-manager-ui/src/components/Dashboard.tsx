import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';
import { Project } from '../types';
import { Loader, ButtonLoader } from './Loader';
import './Dashboard.css';

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
// --- End SVG Icons ---

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [modalError, setModalError] = useState('');
  const [pageError, setPageError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const navigate = useNavigate();
  const username = authService.getUsername();
  useEffect(() => {
    fetchProjects();
  }, []);
  const fetchProjects = async () => {
    setPageLoading(true);
    setPageError('');
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err: any) {
      setPageError(err.message || 'Error fetching projects');
    } finally {
      setPageLoading(false);
    }
  };
  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);
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
      setModalError(err.message || 'Failed to create project');
    } finally {
      setModalLoading(false);
    }
  };
  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) {
      return;
    }

    try {
      await projectService.deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err: any) {
      setPageError(err.message || 'Error deleting project');
    }
  };
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  
  const renderContent = () => {
    if (pageLoading) {
      return <Loader fullPage />;
    }
    
    if (pageError) {
      return <div className="error-message page-error">{pageError}</div>;
    }
    
    if (projects.length === 0) {
      return (
        <div className="no-projects">
          <h3>No projects yet.</h3>
          <p>Create your first project to get started!</p>
          <button onClick={() => setShowModal(true)} className="btn-primary btn-icon">
            <IconPlus /> Create Project
          </button>
        </div>
      );
    }
    
    return (
      <div className="projects-grid">
        {projects.map((project) => (
          <div
            key={project.id}
            className="project-card"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <div className="card-header">
              <h3>{project.title}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.id);
                }}
                className="btn-delete btn-icon"
                title="Delete project"
              >
                <IconTrash /> Delete
              </button>
            </div>
            <p className="card-description">
              {project.description || 'No description'}
            </p>
            <div className="card-footer">
              <small>
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </small>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Project Manager</h1>
        <div className="nav-right">
          <span>Welcome, {username}</span>
          <button onClick={handleLogout} className="logout-btn btn-icon">
            <IconLogout /> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>My Projects</h2>
          {projects.length > 0 && (
              <button onClick={() => setShowModal(true)} className="btn-primary btn-new-project btn-icon">
                <IconPlus /> New Project
              </button>
          )}
        </div>
        
        {renderContent()}
        
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              {modalError && <div className="error-message">{modalError}</div>}
              <div className="form-group">
                <label>Project Title *</label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
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
                <button type="submit" disabled={modalLoading} className="btn-primary btn-icon">
                  {modalLoading ? <ButtonLoader /> : 'Create'}
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
