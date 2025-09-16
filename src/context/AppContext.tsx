import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Project, Task, AppContextType } from '../types';
import { useAuth } from './AuthContext';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setTasks([]);
      return;
    }

    // Load shared data from localStorage - all users see the same data
    const savedProjects = localStorage.getItem('task_manager_shared_projects');
    const savedTasks = localStorage.getItem('task_manager_shared_tasks');
    
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      setProjects([]);
    }
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks([]);
    }
  }, [currentUser]);

  // Save to shared localStorage - all changes are visible to all users
  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem('task_manager_shared_projects', JSON.stringify(projects));
  }, [projects, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem('task_manager_shared_tasks', JSON.stringify(tasks));
  }, [tasks, currentUser]);

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'tasks'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      tasks: [],
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    setTasks(prev => prev.filter(task => task.projectId !== id));
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const startTask = (taskId: string, userId: string) => {
    setTasks(prev => prev.map(task => {
      // Anyone can start any pending task
      if (task.id === taskId && task.status === 'pending') {
        return {
          ...task,
          status: 'in-progress',
          startedBy: userId,
          startedAt: new Date().toISOString()
        };
      }
      return task;
    }));
  };

  const completeTask = (taskId: string, userId: string) => {
    setTasks(prev => prev.map(task => {
      // Anyone can complete any in-progress task
      if (task.id === taskId && task.status === 'in-progress') {
        return {
          ...task,
          status: 'completed',
          completedBy: userId,
          completedAt: new Date().toISOString()
        };
      }
      return task;
    }));
  };

  const assignTask = (taskId: string, assignedUserId: string) => {
    setTasks(prev => prev.map(task => {
      // Anyone can assign any task
      if (task.id === taskId) {
        return {
          ...task,
          assignedTo: assignedUserId
        };
      }
      return task;
    }));
  };

  const value: AppContextType = {
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