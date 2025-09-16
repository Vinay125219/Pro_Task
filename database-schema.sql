-- AchieveFlow Pro Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create projects table
CREATE TABLE
IF NOT EXISTS projects
(
  id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
  status TEXT NOT NULL DEFAULT 'active' CHECK
(status IN
('active', 'completed', 'on-hold')),
  tasks JSONB DEFAULT '[]'::jsonb
);

-- Create tasks table
CREATE TABLE
IF NOT EXISTS tasks
(
  id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  "projectId" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "assignedTo" TEXT,
  "startedBy" TEXT,
  "completedBy" TEXT,
  "createdAt" TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
  "startedAt" TIMESTAMP
WITH TIME ZONE,
  "completedAt" TIMESTAMP
WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK
(status IN
('pending', 'in-progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK
(priority IN
('low', 'medium', 'high')),
  "dueDate" TIMESTAMP
WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for everyone
-- (Since we want shared collaboration, we allow all users to see all data)
DROP POLICY
IF EXISTS "Allow all operations for everyone" ON projects;
CREATE POLICY "Allow all operations for everyone" ON projects
  FOR ALL USING
(true) WITH CHECK
(true);

DROP POLICY
IF EXISTS "Allow all operations for everyone" ON tasks;
CREATE POLICY "Allow all operations for everyone" ON tasks
  FOR ALL USING
(true) WITH CHECK
(true);

-- Create indexes for better performance
CREATE INDEX
IF NOT EXISTS idx_projects_created_at ON projects
("createdAt" DESC);
CREATE INDEX
IF NOT EXISTS idx_projects_status ON projects
(status);
CREATE INDEX
IF NOT EXISTS idx_tasks_created_at ON tasks
("createdAt" DESC);
CREATE INDEX
IF NOT EXISTS idx_tasks_project_id ON tasks
("projectId");
CREATE INDEX
IF NOT EXISTS idx_tasks_status ON tasks
(status);
CREATE INDEX
IF NOT EXISTS idx_tasks_assigned_to ON tasks
("assignedTo");
CREATE INDEX
IF NOT EXISTS idx_tasks_priority ON tasks
(priority);

-- Insert sample data (optional)
-- INSERT INTO projects (name, description, "createdBy", status) VALUES
-- ('Sample Project', 'This is a sample project to test the system', 'vinay', 'active');

-- INSERT INTO tasks (title, description, "projectId", "createdBy", status, priority) VALUES
-- ('Sample Task', 'This is a sample task', (SELECT id FROM projects LIMIT 1), 'vinay', 'pending', 'high');