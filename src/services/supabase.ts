import { createClient } from '@supabase/supabase-js';
import type { Project, Task } from '../types/index';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database table definitions
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'createdAt'>;
        Update: Partial<Project>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'createdAt'>;
        Update: Partial<Task>;
      };
    };
  };
}

// Projects service
export const projectsService = {
  async getAll(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error('Error fetching projects:', error);
        // Fallback to localStorage
        const localProjects = localStorage.getItem('task_manager_shared_projects');
        return localProjects ? JSON.parse(localProjects) : [];
      }
      
      // Add tasks array for compatibility with existing code
      return (data || []).map(project => ({ ...project, tasks: [] }));
    } catch (error) {
      console.error('Projects service error:', error);
      // Fallback to localStorage
      const localProjects = localStorage.getItem('task_manager_shared_projects');
      return localProjects ? JSON.parse(localProjects) : [];
    }
  },

  async create(project: Omit<Project, 'id' | 'createdAt' | 'tasks'>): Promise<Project | null> {
    try {
      const newProject = {
        name: project.name,
        description: project.description,
        createdBy: project.createdBy,
        status: project.status
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        // Fallback to localStorage
        const localProject = {
          ...newProject,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          tasks: []
        };
        const localProjects = JSON.parse(localStorage.getItem('task_manager_shared_projects') || '[]');
        localProjects.push(localProject);
        localStorage.setItem('task_manager_shared_projects', JSON.stringify(localProjects));
        return localProject;
      }

      // Add tasks array for compatibility with existing code
      return { ...data, tasks: [] };
    } catch (error) {
      console.error('Projects service error:', error);
      return null;
    }
  },

  async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      // Remove tasks from updates as it's not stored in the database
      const { tasks, ...dbUpdates } = updates;
      
      const { data, error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        // Fallback to localStorage
        const localProjects = JSON.parse(localStorage.getItem('task_manager_shared_projects') || '[]');
        const updatedProjects = localProjects.map((p: Project) => 
          p.id === id ? { ...p, ...updates } : p
        );
        localStorage.setItem('task_manager_shared_projects', JSON.stringify(updatedProjects));
        return updatedProjects.find((p: Project) => p.id === id) || null;
      }

      // Add tasks array for compatibility
      return { ...data, tasks: [] };
    } catch (error) {
      console.error('Projects service error:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting project:', error);
        // Fallback to localStorage
        const localProjects = JSON.parse(localStorage.getItem('task_manager_shared_projects') || '[]');
        const filteredProjects = localProjects.filter((p: Project) => p.id !== id);
        localStorage.setItem('task_manager_shared_projects', JSON.stringify(filteredProjects));
        return true;
      }

      return true;
    } catch (error) {
      console.error('Projects service error:', error);
      return false;
    }
  }
};

// Tasks service
export const tasksService = {
  async getAll(): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        // Fallback to localStorage
        const localTasks = localStorage.getItem('task_manager_shared_tasks');
        return localTasks ? JSON.parse(localTasks) : [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Tasks service error:', error);
      // Fallback to localStorage
      const localTasks = localStorage.getItem('task_manager_shared_tasks');
      return localTasks ? JSON.parse(localTasks) : [];
    }
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task | null> {
    try {
      const newTask = {
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        createdBy: task.createdBy,
        assignedTo: task.assignedTo,
        startedBy: task.startedBy,
        completedBy: task.completedBy,
        startedAt: task.startedAt,
        completedAt: task.completedAt,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        // Fallback to localStorage
        const localTask = {
          ...newTask,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        const localTasks = JSON.parse(localStorage.getItem('task_manager_shared_tasks') || '[]');
        localTasks.push(localTask);
        localStorage.setItem('task_manager_shared_tasks', JSON.stringify(localTasks));
        return localTask;
      }

      return data;
    } catch (error) {
      console.error('Tasks service error:', error);
      return null;
    }
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        // Fallback to localStorage
        const localTasks = JSON.parse(localStorage.getItem('task_manager_shared_tasks') || '[]');
        const updatedTasks = localTasks.map((t: Task) => 
          t.id === id ? { ...t, ...updates } : t
        );
        localStorage.setItem('task_manager_shared_tasks', JSON.stringify(updatedTasks));
        return updatedTasks.find((t: Task) => t.id === id) || null;
      }

      return data;
    } catch (error) {
      console.error('Tasks service error:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task:', error);
        // Fallback to localStorage
        const localTasks = JSON.parse(localStorage.getItem('task_manager_shared_tasks') || '[]');
        const filteredTasks = localTasks.filter((t: Task) => t.id !== id);
        localStorage.setItem('task_manager_shared_tasks', JSON.stringify(filteredTasks));
        return true;
      }

      return true;
    } catch (error) {
      console.error('Tasks service error:', error);
      return false;
    }
  }
};

// Real-time subscriptions
export const subscribeToProjects = (callback: (payload: any) => void) => {
  return supabase
    .channel('projects')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'projects' }, 
      callback
    )
    .subscribe();
};

export const subscribeToTasks = (callback: (payload: any) => void) => {
  return supabase
    .channel('tasks')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'tasks' }, 
      callback
    )
    .subscribe();
};