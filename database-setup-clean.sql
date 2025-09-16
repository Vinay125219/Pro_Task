-- AchieveFlow Pro Database Schema - Clean Version
-- Copy and paste this entire script into Supabase SQL Editor

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active'
);

-- Add check constraint for projects status
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
CHECK (status IN ('active', 'completed', 'on-hold'));

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  "projectId" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "assignedTo" TEXT,
  "startedBy" TEXT,
  "completedBy" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "startedAt" TIMESTAMP WITH TIME ZONE,
  "completedAt" TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  "dueDate" TIMESTAMP WITH TIME ZONE
);

-- Add check constraints for tasks
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('pending', 'in-progress', 'completed'));

ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check 
CHECK (priority IN ('low', 'medium', 'high'));

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for everyone" ON projects;
DROP POLICY IF EXISTS "Allow all operations for everyone" ON tasks;

-- Create permissive policies for shared collaboration
CREATE POLICY "Allow all operations for everyone" ON projects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for everyone" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks("projectId");
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks("assignedTo");
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Insert sample data to test the setup
INSERT INTO projects (name, description, "createdBy", status) 
VALUES ('Welcome Project', 'Your first project in AchieveFlow Pro!', 'vinay', 'active')
ON CONFLICT (id) DO NOTHING;

-- Get the project ID for the sample task
INSERT INTO tasks (title, description, "projectId", "createdBy", status, priority) 
SELECT 'Welcome Task', 'Your first task - click to start!', id, 'vinay', 'pending', 'high'
FROM projects WHERE name = 'Welcome Project' LIMIT 1
ON CONFLICT (id) DO NOTHING;