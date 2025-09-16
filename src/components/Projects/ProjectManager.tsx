import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { Project } from '../../types';
import './Projects.css';

const ProjectManager: React.FC = () => {
  const { currentUser } = useAuth();
  const { projects, addProject, updateProject, deleteProject } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on-hold';
  }>({
    name: '',
    description: '',
    status: 'active' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (editingProject) {
      updateProject(editingProject.id, formData);
      setEditingProject(null);
    } else {
      addProject({
        ...formData,
        createdBy: currentUser.id,
        status: 'active',
      });
    }

    setFormData({ name: '', description: '', status: 'active' });
    setIsCreating(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
    });
    setIsCreating(true);
  };

  const handleDelete = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      deleteProject(projectId);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', status: 'active' });
  };

  const userProjects = projects; // Show all projects from all users

  return (
    <div className="project-manager">
      <div className="project-header">
        <h2>Project Management</h2>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)} 
            className="create-project-btn"
          >
            + Create New Project
          </button>
        )}
      </div>

      {isCreating && (
        <div className="project-form-container">
          <form onSubmit={handleSubmit} className="project-form">
            <h3>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
            
            <div className="form-group">
              <label htmlFor="projectName">Project Name</label>
              <input
                type="text"
                id="projectName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Enter project name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectDescription">Description</label>
              <textarea
                id="projectDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder="Enter project description"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectStatus">Status</label>
              <select
                id="projectStatus"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="projects-container">
        {userProjects.length > 0 ? (
          <div className="projects-grid">
            {userProjects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <h3>{project.name}</h3>
                  <div className="project-actions">
                    {project.createdBy === currentUser?.id && (
                      <>
                        <button 
                          onClick={() => handleEdit(project)}
                          className="edit-btn"
                          title="Edit Project"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(project.id)}
                          className="delete-btn"
                          title="Delete Project"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="project-description">{project.description}</p>
                
                <div className="project-meta">
                  <span className={`project-status ${project.status}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                  <span className="project-creator">
                    Created by: {project.createdBy === '1' ? 'Ravali' : project.createdBy === '2' ? 'Vinay' : 'Unknown'}
                  </span>
                  <span className="project-date">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="project-stats">
                  <div className="stat">
                    <span className="stat-label">Tasks:</span>
                    <span className="stat-value">{project.tasks?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Projects Yet</h3>
            <p>Create your first project to start organizing your tasks and workflow.</p>
            {!isCreating && (
              <button 
                onClick={() => setIsCreating(true)} 
                className="create-first-project-btn"
              >
                Create Your First Project
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;