import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getRandomQuote, formatDate, exportData, getTaskStatusColor, getPriorityColor } from '../../utils/helpers';
import type { MotivationalQuote, Project, Task } from '../../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { 
    projects, 
    tasks, 
    addProject, 
    updateProject, 
    deleteProject,
    addTask, 
    updateTask, 
    deleteTask,
    startTask,
    completeTask,
    assignTask
  } = useApp();
  
  const [quote, setQuote] = useState<MotivationalQuote>({ text: '', author: '' });
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile' | 'settings'>('dashboard');
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'tasks'>('overview');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [taskSort, setTaskSort] = useState<'recent' | 'priority' | 'dueDate' | 'alphabetical'>('recent');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  
  // Form states
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Project form data
  const [projectForm, setProjectForm] = useState<{
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on-hold';
  }>({
    name: '',
    description: '',
    status: 'active',
  });
  
  // Task form data  
  const [taskForm, setTaskForm] = useState<{
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
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
  });
  
  // Profile form data
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('app_theme') || 'light',
    notifications: localStorage.getItem('app_notifications') !== 'false',
    autoSave: localStorage.getItem('app_autosave') !== 'false',
    language: localStorage.getItem('app_language') || 'en'
  });
  
  // Notification system
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    timestamp: string;
  }>>([]);

  useEffect(() => {
    setQuote(getRandomQuote());
    setProfileForm(prev => ({ ...prev, name: currentUser?.name || '' }));
  }, [currentUser]);

  const refreshQuote = () => {
    setQuote(getRandomQuote());
  };

  // Show ALL tasks and projects to everyone for true collaboration
  const allTasks = tasks;
  const allProjects = projects;

  // Remove user-specific filtering - everyone sees everything
  const collaborativeTasks = allTasks;
  const collaborativeProjects = allProjects;

  const taskStats = {
    total: collaborativeTasks.length,
    pending: collaborativeTasks.filter(task => task.status === 'pending').length,
    inProgress: collaborativeTasks.filter(task => task.status === 'in-progress').length,
    completed: collaborativeTasks.filter(task => task.status === 'completed').length,
  };

  const todayTasks = collaborativeTasks.filter(task => {
    const today = new Date().toDateString();
    return task.createdAt && new Date(task.createdAt).toDateString() === today;
  });

  // Personal stats for profile
  const personalStats = {
    projectsCreated: collaborativeProjects.filter(p => p.createdBy === currentUser?.id).length,
    tasksCreated: collaborativeTasks.filter(t => t.createdBy === currentUser?.id).length,
    tasksCompleted: collaborativeTasks.filter(t => t.completedBy === currentUser?.id).length,
    tasksStarted: collaborativeTasks.filter(t => t.startedBy === currentUser?.id).length,
  };

  // Project form handlers
  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (editingProject) {
      updateProject(editingProject.id, projectForm);
      setEditingProject(null);
    } else {
      addProject({
        ...projectForm,
        createdBy: currentUser.id,
      });
    }

    setProjectForm({ name: '', description: '', status: 'active' });
    setShowCreateProject(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      description: project.description,
      status: project.status,
    });
    setShowCreateProject(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will be deleted.')) {
      deleteProject(projectId);
    }
  };

  // Task form handlers
  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (editingTask) {
      updateTask(editingTask.id, taskForm);
      setEditingTask(null);
    } else {
      addTask({
        ...taskForm,
        createdBy: currentUser.id,
        status: 'pending',
      });
    }

    setTaskForm({ title: '', description: '', projectId: '', priority: 'medium', dueDate: '', assignedTo: '' });
    setShowCreateTask(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      priority: task.priority,
      dueDate: task.dueDate || '',
      assignedTo: task.assignedTo || '',
    });
    setShowCreateTask(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  // Enhanced task management with notifications
  const handleStartTask = (taskId: string) => {
    if (currentUser) {
      startTask(taskId, currentUser.id);
      addNotification(`Task started successfully!`, 'success');
    }
  };

  const handleCompleteTask = (taskId: string) => {
    if (currentUser) {
      completeTask(taskId, currentUser.id);
      addNotification(`Task completed! Great job! 🎉`, 'success');
    }
  };

  const addNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    if (!settings.notifications) return;
    
    const notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Data export handlers
  const handleExportData = (format: 'json' | 'csv') => {
    const exportPayload = {
      user: currentUser?.name,
      exportDate: new Date().toISOString(),
      projects: collaborativeProjects,
      tasks: collaborativeTasks,
      statistics: taskStats,
      personalStats: personalStats
    };
    exportData(exportPayload, `task-manager-${currentUser?.username}`, format);
  };

  // Settings handlers
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(`app_${key}`, value.toString());
  };

  const getAvailableUsers = () => {
    return [
      { id: '1', name: 'Ravali' },
      { id: '2', name: 'Vinay' }
    ].filter(user => user.id !== currentUser?.id);
  };

  const handleAssignTask = (taskId: string, assignedUserId: string) => {
    if (currentUser) {
      assignTask(taskId, assignedUserId, currentUser.id);
    }
  };

  // Enhanced task filtering and sorting
  const getFilteredAndSortedTasks = () => {
    let filtered = collaborativeTasks;
    
    // Filter by status
    if (taskFilter !== 'all') {
      filtered = filtered.filter(task => task.status === taskFilter);
    }
    
    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Sort tasks
    return filtered.sort((a, b) => {
      switch (taskSort) {
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  const filteredAndSortedTasks = getFilteredAndSortedTasks();

  const getUserName = (userId: string) => {
    return userId === '1' ? 'Ravali' : userId === '2' ? 'Vinay' : 'Unknown User';
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  // Enhanced project analytics
  const getProjectAnalytics = (project: any) => {
    const projectTasks = collaborativeTasks.filter(task => task.projectId === project.id);
    const completed = projectTasks.filter(task => task.status === 'completed').length;
    const inProgress = projectTasks.filter(task => task.status === 'in-progress').length;
    const pending = projectTasks.filter(task => task.status === 'pending').length;
    const total = projectTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate
    };
  };

  // Overall analytics
  const getOverallAnalytics = () => {
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const tasksThisWeek = collaborativeTasks.filter(task => 
      new Date(task.createdAt) >= thisWeek
    ).length;
    
    const tasksThisMonth = collaborativeTasks.filter(task => 
      new Date(task.createdAt) >= thisMonth
    ).length;
    
    const completedThisWeek = collaborativeTasks.filter(task => 
      task.completedAt && new Date(task.completedAt) >= thisWeek
    ).length;
    
    const highPriorityTasks = collaborativeTasks.filter(task => 
      task.priority === 'high' && task.status !== 'completed'
    ).length;
    
    const overdueTasks = collaborativeTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < today && task.status !== 'completed'
    ).length;
    
    return {
      tasksThisWeek,
      tasksThisMonth,
      completedThisWeek,
      highPriorityTasks,
      overdueTasks
    };
  };

  const analytics = getOverallAnalytics();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger shortcuts when not in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'n':
            event.preventDefault();
            if (collaborativeProjects.length > 0) {
              setShowCreateTask(true);
              addNotification('Quick create task opened! ⌨️', 'info');
            }
            break;
          case 'p':
            event.preventDefault();
            setShowCreateProject(true);
            addNotification('Quick create project opened! ⌨️', 'info');
            break;
          case '1':
            event.preventDefault();
            setActiveTab('overview');
            break;
          case '2':
            event.preventDefault();
            setActiveTab('projects');
            break;
          case '3':
            event.preventDefault();
            setActiveTab('tasks');
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [collaborativeProjects.length]);

  return (
    <div className="dashboard">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map(notification => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              <span className="notification-message">{notification.message}</span>
              <button 
                onClick={() => removeNotification(notification.id)}
                className="notification-close"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🚀 AchieveFlow Pro</h1>
          <div className="main-nav">
            <button 
              className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={`nav-btn ${currentView === 'profile' ? 'active' : ''}`}
              onClick={() => setCurrentView('profile')}
            >
              👤 Profile
            </button>
            <button 
              className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`}
              onClick={() => setCurrentView('settings')}
            >
              ⚙️ Settings
            </button>
            <button onClick={logout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {currentView === 'dashboard' && (
          <>
            <div className="quote-section">
              <div className="quote-card">
                <div className="quote-text">"{quote.text}"</div>
                <div className="quote-author">— {quote.author}</div>
                <button onClick={refreshQuote} className="refresh-quote-btn">
                  🔄 New Quote
                </button>
              </div>
            </div>

            <div className="dashboard-tabs">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📈 Overview
              </button>
              <button 
                className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                📁 Projects
              </button>
              <button 
                className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                ✅ Tasks
              </button>
              <div className="export-buttons">
                <button onClick={() => handleExportData('json')} className="export-btn">
                  📄 Export JSON
                </button>
                <button onClick={() => handleExportData('csv')} className="export-btn">
                  📊 Export CSV
                </button>
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="overview-section">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">📁</div>
                    <div className="stat-info">
                      <h3>Total Projects</h3>
                      <div className="stat-number">{collaborativeProjects.length}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                      <h3>Total Tasks</h3>
                      <div className="stat-number">{taskStats.total}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🔄</div>
                    <div className="stat-info">
                      <h3>In Progress</h3>
                      <div className="stat-number">{taskStats.inProgress}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <h3>Completed</h3>
                      <div className="stat-number">{taskStats.completed}</div>
                    </div>
                  </div>
                </div>

                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h4>📈 Weekly Summary</h4>
                    <div className="analytics-stats">
                      <div className="analytics-stat">
                        <span className="label">Tasks Created This Week:</span>
                        <span className="value">{analytics.tasksThisWeek}</span>
                      </div>
                      <div className="analytics-stat">
                        <span className="label">Tasks Completed This Week:</span>
                        <span className="value">{analytics.completedThisWeek}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="analytics-card">
                    <h4>⚠️ Priority Alerts</h4>
                    <div className="analytics-stats">
                      <div className="analytics-stat">
                        <span className="label">High Priority Tasks:</span>
                        <span className="value priority-high">{analytics.highPriorityTasks}</span>
                      </div>
                      <div className="analytics-stat">
                        <span className="label">Overdue Tasks:</span>
                        <span className="value overdue">{analytics.overdueTasks}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="action-buttons">
                    <button 
                      onClick={() => setShowCreateProject(true)}
                      className="quick-action-btn project"
                    >
                      📁 New Project
                    </button>
                    <button 
                      onClick={() => setShowCreateTask(true)}
                      className="quick-action-btn task"
                      disabled={collaborativeProjects.length === 0}
                    >
                      ✅ New Task
                    </button>
                  </div>
                  {collaborativeProjects.length === 0 && (
                    <p className="hint">Create a project first to add tasks</p>
                  )}
                </div>

                <div className="today-tasks">
                  <h3>Today's Activity</h3>
                  {todayTasks.length > 0 ? (
                    <div className="task-list">
                      {todayTasks.map(task => (
                        <div key={task.id} className="task-item">
                          <div className="task-info">
                            <h4>{task.title}</h4>
                            <p>{getProjectName(task.projectId)}</p>
                          </div>
                          <div className="task-actions">
                            {task.status === 'pending' && (
                              <button 
                                onClick={() => handleStartTask(task.id)}
                                className="action-btn start"
                              >
                                ▶️ Start
                              </button>
                            )}
                            {task.status === 'in-progress' && (
                              <button 
                                onClick={() => handleCompleteTask(task.id)}
                                className="action-btn complete"
                              >
                                ✅ Complete
                              </button>
                            )}
                            <span className={`status ${task.status}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-activity">No tasks for today. Great job staying organized!</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="projects-section">
                <div className="section-header">
                  <h3>All Projects</h3>
                  <button 
                    onClick={() => setShowCreateProject(true)}
                    className="add-btn"
                  >
                    + New Project
                  </button>
                </div>

                {collaborativeProjects.length > 0 ? (
                  <div className="projects-grid">
                    {collaborativeProjects.map(project => {
                      const projectAnalytics = getProjectAnalytics(project);
                      return (
                      <div key={project.id} className="project-card">
                        <div className="project-header">
                          <h4>{project.name}</h4>
                          <div className="project-actions">
                            {project.createdBy === currentUser?.id && (
                              <>
                                <button 
                                  onClick={() => handleEditProject(project)}
                                  className="action-btn edit"
                                  title="Edit Project"
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="action-btn delete"
                                  title="Delete Project"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <p>{project.description}</p>
                        
                        <div className="project-progress">
                          <div className="progress-header">
                            <span>Progress</span>
                            <span className="progress-percentage">{projectAnalytics.completionRate}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${projectAnalytics.completionRate}%` }}
                            ></div>
                          </div>
                          <div className="progress-stats">
                            <span className="progress-stat completed">{projectAnalytics.completed} completed</span>
                            <span className="progress-stat in-progress">{projectAnalytics.inProgress} in progress</span>
                            <span className="progress-stat pending">{projectAnalytics.pending} pending</span>
                          </div>
                        </div>
                        
                        <div className="project-meta">
                          <span className={`status ${project.status}`}>
                            {project.status}
                          </span>
                          <span className="creator">
                            Created by: {getUserName(project.createdBy)}
                          </span>
                          <span className="date">
                            {formatDate(project.createdAt)}
                          </span>
                        </div>
                        <div className="project-stats">
                          <span className="task-count">
                            📋 {projectAnalytics.total} tasks
                          </span>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📁</div>
                    <h3>No Projects Yet</h3>
                    <p>Create your first project to start organizing your tasks and workflow.</p>
                    <button 
                      onClick={() => setShowCreateProject(true)}
                      className="create-first-btn"
                    >
                      Create Your First Project
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="tasks-section">
                <div className="section-header">
                  <h3>All Tasks</h3>
                  <button 
                    onClick={() => setShowCreateTask(true)}
                    className="add-btn"
                    disabled={collaborativeProjects.length === 0}
                  >
                    + New Task
                  </button>
                </div>

                <div className="task-controls">
                  <div className="filter-controls">
                    <div className="filter-group">
                      <label>Status:</label>
                      <select 
                        value={taskFilter} 
                        onChange={(e) => setTaskFilter(e.target.value as any)}
                        className="filter-select"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    
                    <div className="filter-group">
                      <label>Priority:</label>
                      <select 
                        value={priorityFilter} 
                        onChange={(e) => setPriorityFilter(e.target.value as any)}
                        className="filter-select"
                      >
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    
                    <div className="filter-group">
                      <label>Sort by:</label>
                      <select 
                        value={taskSort} 
                        onChange={(e) => setTaskSort(e.target.value as any)}
                        className="filter-select"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="priority">Priority</option>
                        <option value="dueDate">Due Date</option>
                        <option value="alphabetical">Alphabetical</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="task-stats-mini">
                    <span>Showing {filteredAndSortedTasks.length} of {collaborativeTasks.length} tasks</span>
                  </div>
                </div>

                {filteredAndSortedTasks.length > 0 ? (
                  <div className="tasks-list">
                    {filteredAndSortedTasks.map(task => (
                      <div key={task.id} className="task-card">
                        <div className="task-header">
                          <div className="task-title">
                            <h4>{task.title}</h4>
                            <span 
                              className="priority"
                              style={{ backgroundColor: getPriorityColor(task.priority) }}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <div className="task-actions">
                            {task.status === 'pending' && (
                              <button 
                                onClick={() => handleStartTask(task.id)}
                                className="action-btn start"
                                title="Start Task"
                              >
                                ▶️
                              </button>
                            )}
                            {task.status === 'in-progress' && (
                              <button 
                                onClick={() => handleCompleteTask(task.id)}
                                className="action-btn complete"
                                title="Complete Task"
                              >
                                ✅
                              </button>
                            )}
                            {task.createdBy === currentUser?.id && (
                              <>
                                <button 
                                  onClick={() => handleEditTask(task)}
                                  className="action-btn edit"
                                  title="Edit Task"
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="action-btn delete"
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
                          <div className="task-creator">
                            👤 Created by: {getUserName(task.createdBy)}
                          </div>
                          {task.assignedTo && (
                            <div className="task-assigned">
                              🎯 Assigned to: {getUserName(task.assignedTo)}
                            </div>
                          )}
                          <span 
                            className="status"
                            style={{ backgroundColor: getTaskStatusColor(task.status) }}
                          >
                            {task.status.replace('-', ' ')}
                          </span>
                        </div>

                        {task.dueDate && (
                          <div className="task-due">
                            📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}

                        <div className="task-timeline">
                          <div className="timeline-item">
                            <strong>Created by:</strong> {getUserName(task.createdBy)} 
                            <span className="date">on {formatDate(task.createdAt)}</span>
                          </div>
                          
                          {task.startedBy && task.startedAt && (
                            <div className="timeline-item">
                              <strong>Started by:</strong> {getUserName(task.startedBy)} 
                              <span className="date">on {formatDate(task.startedAt)}</span>
                            </div>
                          )}
                          
                          {task.completedBy && task.completedAt && (
                            <div className="timeline-item">
                              <strong>Completed by:</strong> {getUserName(task.completedBy)} 
                              <span className="date">on {formatDate(task.completedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>No Tasks Yet</h3>
                    <p>Create your first task to start managing your workflow.</p>
                    {collaborativeProjects.length > 0 ? (
                      <button 
                        onClick={() => setShowCreateTask(true)}
                        className="create-first-btn"
                      >
                        Create Your First Task
                      </button>
                    ) : (
                      <p className="hint">Create a project first to add tasks</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {currentView === 'profile' && (
          <div className="profile-section">
            <div className="profile-header">
              <div className="profile-avatar">
                <div className="avatar-circle">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="profile-info">
                <h2>{currentUser?.name}</h2>
                <p>@{currentUser?.username}</p>
                <p className="join-date">
                  Member since {new Date(currentUser?.createdAt || '').toLocaleDateString()}
                </p>
              </div>
            </div>

              <div className="profile-stats">
              <div className="stat">
                <span className="label">Projects Created</span>
                <span className="value">{personalStats.projectsCreated}</span>
              </div>
              <div className="stat">
                <span className="label">Tasks Created</span>
                <span className="value">{personalStats.tasksCreated}</span>
              </div>
              <div className="stat">
                <span className="label">Tasks Started</span>
                <span className="value">{personalStats.tasksStarted}</span>
              </div>
              <div className="stat">
                <span className="label">Tasks Completed</span>
                <span className="value">{personalStats.tasksCompleted}</span>
              </div>
            </div>

            <div className="profile-form">
              <h3>Profile Settings</h3>
              <form>
                <div className="form-group">
                  <label>Display Name</label>
                  <input 
                    type="text" 
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your display name"
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    value={currentUser?.username || ''}
                    disabled
                    className="disabled"
                  />
                  <small>Username cannot be changed</small>
                </div>
                <button type="button" className="save-btn">
                  💾 Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="settings-section">
            <h2>Settings</h2>
            
            <div className="settings-group">
              <h3>Appearance</h3>
              <div className="setting-item">
                <label>Theme</label>
                <select 
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            <div className="settings-group">
              <h3>Notifications</h3>
              <div className="setting-item">
                <label>
                  <input 
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  />
                  Enable notifications
                </label>
              </div>
            </div>

            <div className="settings-group">
              <h3>Keyboard Shortcuts</h3>
              <div className="shortcuts-list">
                <div className="shortcut-item">
                  <kbd>Ctrl/Cmd + N</kbd>
                  <span>Create new task</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl/Cmd + P</kbd>
                  <span>Create new project</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl/Cmd + 1</kbd>
                  <span>Go to Overview</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl/Cmd + 2</kbd>
                  <span>Go to Projects</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl/Cmd + 3</kbd>
                  <span>Go to Tasks</span>
                </div>
              </div>
            </div>

            <div className="settings-group">
              <h3>Data & Storage</h3>
              <div className="setting-item">
                <label>
                  <input 
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  />
                  Auto-save changes
                </label>
              </div>
              <div className="setting-item">
                <label>Export Data</label>
                <div className="export-options">
                  <button 
                    onClick={() => handleExportData('json')}
                    className="export-btn"
                  >
                    📄 Export as JSON
                  </button>
                  <button 
                    onClick={() => handleExportData('csv')}
                    className="export-btn"
                  >
                    📊 Export as CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateProject && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
                <button 
                  onClick={() => {
                    setShowCreateProject(false);
                    setEditingProject(null);
                    setProjectForm({ name: '', description: '', status: 'active' });
                  }}
                  className="close-btn"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleProjectSubmit}>
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Enter project name"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                    placeholder="Describe your project"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, status: e.target.value as any }))}
                  >
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="submit-btn">
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowCreateProject(false);
                      setEditingProject(null);
                      setProjectForm({ name: '', description: '', status: 'active' });
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Task Modal */}
        {showCreateTask && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
                <button 
                  onClick={() => {
                    setShowCreateTask(false);
                    setEditingTask(null);
                    setTaskForm({ title: '', description: '', projectId: '', priority: 'medium', dueDate: '', assignedTo: '' });
                  }}
                  className="close-btn"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleTaskSubmit}>
                <div className="form-group">
                  <label>Task Title</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Enter task title"
                  />
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <select
                    value={taskForm.projectId}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, projectId: e.target.value }))}
                    required
                  >
                    <option value="">Select a project</option>
                    {collaborativeProjects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} (by {getUserName(project.createdBy)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                    placeholder="Describe the task"
                    rows={3}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Due Date (Optional)</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Assign To (Optional)</label>
                  <select
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                  >
                    <option value="">Unassigned</option>
                    <option value={currentUser?.id || ''}>{currentUser?.name} (Yourself)</option>
                    {getAvailableUsers().map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="submit-btn">
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowCreateTask(false);
                      setEditingTask(null);
                      setTaskForm({ title: '', description: '', projectId: '', priority: 'medium', dueDate: '', assignedTo: '' });
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;