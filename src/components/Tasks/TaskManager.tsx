import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatDate, getTaskStatusColor, getPriorityColor } from '../../utils/helpers';
import type { Task } from '../../types';
import './Tasks.css';

const TaskManager: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    tasks, 
    projects, 
    addTask, 
    updateTask, 
    deleteTask, 
    startTask, 
    completeTask
  } = useApp();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    projectId: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    assignedTo: string;
  }>({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium' as const,
    dueDate: '',
    assignedTo: '',
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const userProjects = projects; // Show all projects for task creation
  
  // Show all tasks to everyone - collaborative workflow
  const allTasks = tasks;
  const filteredTasks = filter === 'all' 
    ? allTasks 
    : allTasks.filter(task => task.status === filter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (editingTask) {
      updateTask(editingTask.id, formData);
      setEditingTask(null);
    } else {
      addTask({
        ...formData,
        createdBy: currentUser.id,
        status: 'pending',
      });
    }

    setFormData({
      title: '',
      description: '',
      projectId: '',
      priority: 'medium',
      dueDate: '',
      assignedTo: '',
    });
    setIsCreating(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      priority: task.priority,
      dueDate: task.dueDate || '',
      assignedTo: task.assignedTo || '',
    });
    setIsCreating(true);
  };

  const handleDelete = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const handleStartTask = (taskId: string) => {
    if (currentUser) {
      startTask(taskId, currentUser.id);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    if (currentUser) {
      completeTask(taskId, currentUser.id);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      projectId: '',
      priority: 'medium',
      dueDate: '',
      assignedTo: '',
    });
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const canStartTask = (task: Task) => {
    return task.status === 'pending'; // Anyone can start any pending task
  };

  const canCompleteTask = (task: Task) => {
    return task.status === 'in-progress'; // Anyone can complete any in-progress task
  };

  const getUserName = (userId: string) => {
    // In a real app, you'd have a users array or API call
    return userId === '1' ? 'Ravali' : userId === '2' ? 'Vinay' : 'Unknown User';
  };

  const getAvailableUsers = () => {
    return [
      { id: '1', name: 'Ravali' },
      { id: '2', name: 'Vinay' }
    ].filter(user => user.id !== currentUser?.id);
  };

  return (
    <div className="task-manager">
      <div className="task-header">
        <h2>Task Management</h2>
        <div className="task-header-actions">
          <div className="task-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Tasks ({allTasks.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({allTasks.filter(t => t.status === 'pending').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
              onClick={() => setFilter('in-progress')}
            >
              In Progress ({allTasks.filter(t => t.status === 'in-progress').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({allTasks.filter(t => t.status === 'completed').length})
            </button>
          </div>
          
          {!isCreating && userProjects.length > 0 && (
            <button 
              onClick={() => setIsCreating(true)} 
              className="create-task-btn"
            >
              + Create New Task
            </button>
          )}
        </div>
      </div>

      {userProjects.length === 0 && (
        <div className="no-projects-notice">
          <p>⚠️ You need to create a project first before adding tasks.</p>
        </div>
      )}

      {isCreating && userProjects.length > 0 && (
        <div className="task-form-container">
          <form onSubmit={handleSubmit} className="task-form">
            <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="taskTitle">Task Title</label>
                <input
                  type="text"
                  id="taskTitle"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="Enter task title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="taskProject">Project</label>
                <select
                  id="taskProject"
                  value={formData.projectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                  required
                >
                  <option value="">Select a project</option>
                  {userProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="taskDescription">Description</label>
              <textarea
                id="taskDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="taskPriority">Priority</label>
                <select
                  id="taskPriority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="taskDueDate">Due Date (Optional)</label>
                <input
                  type="date"
                  id="taskDueDate"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="taskAssignedTo">Assign To (Optional)</label>
              <select
                id="taskAssignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              >
                <option value="">Assign to yourself</option>
                {getAvailableUsers().map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tasks-container">
        {filteredTasks.length > 0 ? (
          <div className="tasks-list">
            {filteredTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-card-header">
                  <div className="task-title-section">
                    <h3>{task.title}</h3>
                    <span 
                      className="task-priority"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className="task-actions">
                    {canStartTask(task) && (
                      <button 
                        onClick={() => handleStartTask(task.id)}
                        className="action-btn start-btn"
                        title="Start Task"
                      >
                        ▶️
                      </button>
                    )}
                    {canCompleteTask(task) && (
                      <button 
                        onClick={() => handleCompleteTask(task.id)}
                        className="action-btn complete-btn"
                        title="Complete Task"
                      >
                        ✅
                      </button>
                    )}
                    {task.createdBy === currentUser?.id && (
                      <>
                        <button 
                          onClick={() => handleEdit(task)}
                          className="action-btn edit-btn"
                          title="Edit Task"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(task.id)}
                          className="action-btn delete-btn"
                          title="Delete Task"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="task-description">{task.description}</p>
                
                <div className="task-meta">
                  <div className="task-project">
                    📁 {getProjectName(task.projectId)}
                  </div>
                  {task.assignedTo && (
                    <div className="task-assigned">
                      👤 Assigned to: {getUserName(task.assignedTo)}
                    </div>
                  )}
                  <span 
                    className="task-status"
                    style={{ backgroundColor: getTaskStatusColor(task.status) }}
                  >
                    {task.status.replace('-', ' ')}
                  </span>
                </div>

                {task.dueDate && (
                  <div className="task-due-date">
                    📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}

                <div className="task-timeline">
                  <div className="timeline-item">
                    <strong>Created by:</strong> {getUserName(task.createdBy)} 
                    <span className="timeline-date">on {formatDate(task.createdAt)}</span>
                  </div>
                  
                  {task.startedBy && task.startedAt && (
                    <div className="timeline-item">
                      <strong>Started by:</strong> {getUserName(task.startedBy)} 
                      <span className="timeline-date">on {formatDate(task.startedAt)}</span>
                    </div>
                  )}
                  
                  {task.completedBy && task.completedAt && (
                    <div className="timeline-item">
                      <strong>Completed by:</strong> {getUserName(task.completedBy)} 
                      <span className="timeline-date">on {formatDate(task.completedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>
              {filter === 'all' ? 'No Tasks Yet' : `No ${filter.replace('-', ' ')} Tasks`}
            </h3>
            <p>
              {filter === 'all' 
                ? 'Create your first task to start managing your workflow.'
                : `No ${filter.replace('-', ' ')} tasks available at the moment.`
              }
            </p>
            {!isCreating && userProjects.length > 0 && filter === 'all' && (
              <button 
                onClick={() => setIsCreating(true)} 
                className="create-first-task-btn"
              >
                Create Your First Task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;