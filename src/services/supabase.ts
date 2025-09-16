import { createClient } from '@supabase/supabase-js';
import type { Project, Task } from '../types/index';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Check if environment variables are properly configured
const isSupabaseConfigured = 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseKey !== 'your-anon-key' &&
  supabaseUrl.includes('supabase.co') &&
  supabaseKey.length > 20;

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase environment variables not configured. Using localStorage fallback mode.');
  console.warn('📝 To enable Supabase, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
} else {
  console.log('✅ Supabase configuration detected:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test Supabase connection
const testSupabaseConnection = async () => {
  if (!isSupabaseConfigured) {
    console.log('🔄 Using localStorage fallback mode');
    return false;
  }

  try {
    const { error } = await supabase.from('projects').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return false;
  }
};

// Test connection on initialization
testSupabaseConnection();

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
    // Skip Supabase if not configured
    if (!isSupabaseConfigured) {
      const localProjects = localStorage.getItem('task_manager_shared_projects');
      return localProjects ? JSON.parse(localProjects) : [];
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching projects:', error);
        // Fallback to localStorage
        const localProjects = localStorage.getItem('task_manager_shared_projects');
        return localProjects ? JSON.parse(localProjects) : [];
      }
      
      // Add tasks array for compatibility with existing code
      return (data || []).map(project => ({ ...project, tasks: [] }));
    } catch (error) {
      console.error('❌ Projects service error:', error);
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
    // Skip Supabase if not configured
    if (!isSupabaseConfigured) {
      const localTasks = localStorage.getItem('task_manager_shared_tasks');
      return localTasks ? JSON.parse(localTasks) : [];
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching tasks:', error);
        // Fallback to localStorage
        const localTasks = localStorage.getItem('task_manager_shared_tasks');
        return localTasks ? JSON.parse(localTasks) : [];
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Tasks service error:', error);
      // Fallback to localStorage
      const localTasks = localStorage.getItem('task_manager_shared_tasks');
      return localTasks ? JSON.parse(localTasks) : [];
    }
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task | null> {
    // Skip Supabase if not configured
    if (!isSupabaseConfigured) {
      const localTask = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      const localTasks = JSON.parse(localStorage.getItem('task_manager_shared_tasks') || '[]');
      localTasks.push(localTask);
      localStorage.setItem('task_manager_shared_tasks', JSON.stringify(localTasks));
      return localTask;
    }

    try {
      // Clean the task object to only include valid database columns
      const newTask = {
        title: task.title || '',
        description: task.description || '',
        projectId: task.projectId || '',
        createdBy: task.createdBy || '',
        assignedTo: task.assignedTo || null,
        startedBy: task.startedBy || null,
        completedBy: task.completedBy || null,
        startedAt: task.startedAt || null,
        completedAt: task.completedAt || null,
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        dueDate: task.dueDate || null
      };

      console.log('🔄 Creating task with data:', newTask);

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating task:', error);
        console.error('❌ Error details:', error.details, error.hint, error.message);
        // Fallback to localStorage
        const localTask: Task = {
          ...newTask,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          assignedTo: newTask.assignedTo || undefined,
          startedBy: newTask.startedBy || undefined,
          completedBy: newTask.completedBy || undefined,
          startedAt: newTask.startedAt || undefined,
          completedAt: newTask.completedAt || undefined,
          dueDate: newTask.dueDate || undefined
        };
        const localTasks = JSON.parse(localStorage.getItem('task_manager_shared_tasks') || '[]');
        localTasks.push(localTask);
        localStorage.setItem('task_manager_shared_tasks', JSON.stringify(localTasks));
        return localTask;
      }

      console.log('✅ Task created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Tasks service error:', error);
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
  if (!isSupabaseConfigured) {
    console.log('🔄 Real-time subscriptions disabled - using localStorage mode');
    // Return a mock subscription that does nothing
    return {
      unsubscribe: () => {},
      subscribe: () => ({})
    };
  }

  return supabase
    .channel('projects')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'projects' }, 
      callback
    )
    .subscribe();
};

export const subscribeToTasks = (callback: (payload: any) => void) => {
  if (!isSupabaseConfigured) {
    console.log('🔄 Real-time subscriptions disabled - using localStorage mode');
    // Return a mock subscription that does nothing
    return {
      unsubscribe: () => {},
      subscribe: () => ({})
    };
  }

  return supabase
    .channel('tasks')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'tasks' }, 
      callback
    )
    .subscribe();
};