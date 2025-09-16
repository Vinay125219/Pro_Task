import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Project, Task, AppContextType } from '../types/index';
import { useAuth } from './AuthContext';
import { projectsService, tasksService, subscribeToProjects, subscribeToTasks } from '../services/supabase';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Load data from Supabase with localStorage fallback
  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setTasks([]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load projects and tasks in parallel
        const [projectsData, tasksData] = await Promise.all([
          projectsService.getAll(),
          tasksService.getAll()
        ]);
        
        setProjects(projectsData);
        setTasks(tasksData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Using offline mode.');
        
        // Fallback to localStorage
        const savedProjects = localStorage.getItem('task_manager_shared_projects');
        const savedTasks = localStorage.getItem('task_manager_shared_tasks');
        
        setProjects(savedProjects ? JSON.parse(savedProjects) : []);
        setTasks(savedTasks ? JSON.parse(savedTasks) : []);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to real-time changes
    const projectsSubscription = subscribeToProjects((payload) => {
      console.log('Projects real-time update:', payload);
      // Refresh projects data
      projectsService.getAll().then(setProjects);
    });

    const tasksSubscription = subscribeToTasks((payload) => {
      console.log('Tasks real-time update:', payload);
      // Refresh tasks data
      tasksService.getAll().then(setTasks);
    });

    return () => {
      projectsSubscription.unsubscribe();
      tasksSubscription.unsubscribe();
    };
  }, [currentUser]);

  // Save to localStorage as backup
  useEffect(() => {
    if (!currentUser || loading) return;
    localStorage.setItem('task_manager_shared_projects', JSON.stringify(projects));
  }, [projects, currentUser, loading]);

  useEffect(() => {
    if (!currentUser || loading) return;
    localStorage.setItem('task_manager_shared_tasks', JSON.stringify(tasks));
  }, [tasks, currentUser, loading]);

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'tasks'>) => {
    try {
      const newProject = await projectsService.create(projectData);
      if (newProject) {
        setProjects(prev => [...prev, newProject]);
      }
    } catch (err) {
      console.error('Error adding project:', err);
      setError('Failed to add project');
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await projectsService.update(id, updates);
      if (updatedProject) {
        setProjects(prev => prev.map(project => 
          project.id === id ? updatedProject : project
        ));
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const success = await projectsService.delete(id);
      if (success) {
        setProjects(prev => prev.filter(project => project.id !== id));
        // Also delete associated tasks
        const projectTasks = tasks.filter(task => task.projectId === id);
        for (const task of projectTasks) {
          await tasksService.delete(task.id);
        }
        setTasks(prev => prev.filter(task => task.projectId !== id));
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const newTask = await tasksService.create(taskData);
      if (newTask) {
        setTasks(prev => [...prev, newTask]);
      }
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task');
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await tasksService.update(id, updates);
      if (updatedTask) {
        setTasks(prev => prev.map(task => 
          task.id === id ? updatedTask : task
        ));
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const success = await tasksService.delete(id);
      if (success) {
        setTasks(prev => prev.filter(task => task.id !== id));
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const startTask = async (taskId: string, userId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status === 'pending') {
        await updateTask(taskId, {
          status: 'in-progress',
          startedBy: userId,
          startedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error starting task:', err);
      setError('Failed to start task');
    }
  };

  const completeTask = async (taskId: string, userId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status === 'in-progress') {
        await updateTask(taskId, {
          status: 'completed',
          completedBy: userId,
          completedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error completing task:', err);
      setError('Failed to complete task');
    }
  };

  const assignTask = async (taskId: string, assignedUserId: string) => {
    try {
      await updateTask(taskId, {
        assignedTo: assignedUserId
      });
    } catch (err) {
      console.error('Error assigning task:', err);
      setError('Failed to assign task');
    }
  };

  const value: AppContextType = {
    projects,
    tasks,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    startTask,
    completeTask,
    assignTask,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};