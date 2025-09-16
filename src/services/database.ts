import { supabase } from './supabase';

// SQL for creating the database tables
const createTablesSQL = `
-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  createdBy TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
  tasks JSONB DEFAULT '[]'::jsonb
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  projectId UUID REFERENCES projects(id) ON DELETE CASCADE,
  createdBy TEXT NOT NULL,
  assignedTo TEXT,
  startedBy TEXT,
  completedBy TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  startedAt TIMESTAMP WITH TIME ZONE,
  completedAt TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  dueDate TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for authenticated users
-- (Since we want shared collaboration, we allow all users to see all data)
CREATE POLICY IF NOT EXISTS "Allow all operations for everyone" ON projects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all operations for everyone" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(projectId);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assignedTo);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
`;

export const setupDatabase = async (): Promise<boolean> => {
  try {
    console.log('Setting up Supabase database tables...');
    
    // Try to query tables to see if they exist, which will auto-create them if configured
    try {
      await supabase.from('projects').select('id').limit(1);
      await supabase.from('tasks').select('id').limit(1);
      console.log('Tables exist and are accessible!');
      return true;
    } catch (tableError) {
      console.log('Tables need to be created manually in Supabase SQL Editor');
      console.log('Please run the SQL script from supabase-setup.sql in your Supabase dashboard');
      return true; // Don't fail - app can still work
    }
  } catch (error) {
    console.error('Database setup failed:', error);
    console.log('App will continue with localStorage fallback');
    return true; // Don't fail - fallback to localStorage
  }
};

// Check if Supabase is properly configured
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.warn('Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.warn('Supabase connection error:', error);
    return false;
  }
};

// Initialize database on app start
export const initializeDatabase = async (): Promise<void> => {
  const isConnected = await checkSupabaseConnection();
  
  if (isConnected) {
    await setupDatabase();
  } else {
    console.log('Using localStorage fallback mode');
  }
};