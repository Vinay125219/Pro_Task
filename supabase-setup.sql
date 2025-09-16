-- AchieveFlow Pro - Simple Supabase Setup (Fixed Column Names)
-- Copy and paste this script into your Supabase SQL Editor

-- Drop existing tables if they exist (to recreate with correct column names)
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;

-- Create projects table with quoted column names for camelCase
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active'
);

-- Create tasks table with quoted column names for camelCase
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  "projectId" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "assignedTo" TEXT,
  "startedBy" TEXT,
  "completedBy" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "startedAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  "dueDate" TIMESTAMPTZ
);

-- Enable RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for shared collaboration
CREATE POLICY "Public Access" ON projects FOR ALL USING (true);
CREATE POLICY "Public Access" ON tasks FOR ALL USING (true);

-- Add sample data to test
INSERT INTO projects (name, description, "createdBy", status) VALUES
('Welcome to AchieveFlow Pro', 'Your first project is ready!', 'vinay', 'active');

INSERT INTO tasks (title, description, "projectId", "createdBy", status, priority) VALUES
('Get Started', 'Create your first real project and task', 
 (SELECT id FROM projects WHERE name = 'Welcome to AchieveFlow Pro'), 
 'vinay', 'pending', 'high');